const bcrypt = require('bcrypt');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Loads = require('../models/loadsModel');
const Booker = require('../models/bookerModel');
const APIFeatures = require('../utils/apiFeatures');

exports.locationdectecd = catchAsync(async (req, res, next) => {
  const latlng = req.params.latlng;
  const unit = req.params.unit;
  const [lng, lat] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError('There is no latitude or longitude in the request!', 400)
    );
  }
  const updatedcarrier = await User.findByIdAndUpdate(
    req.user.id,
    {
      currentLocation: {
        coordinates: [lat, lng],
      },
    },
    {
      runValidators: false,
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedcarrier,
    },
  });
});

exports.getAllCarriers = catchAsync(async (req, res, next) => {
  const carriers = await User.find({ role: 'carrier' });
  if (carriers.length === 0) {
    return next(new AppError('No carriers available', 404));
  }
  res.status(200).json({
    status: 'success',
    result: carriers.length,
    data: {
      carriers,
    },
  });
});

exports.updateCarriers = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 14);
  }
  const carrier = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  await carrier.save({ validateBeforeSave: false });

  if (!carrier) {
    return next(new AppError('Not Found This carrier', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      carrier,
    },
  });
});

exports.getCarrier = catchAsync(async (req, res, next) => {
  const carrier = await User.findById(req.params.id);
  if (!carrier) {
    return next(new AppError('Not Found This carrier', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      carrier,
    },
  });
});

exports.deleteCarriers = catchAsync(async (req, res, next) => {
  // Find the Carriers by ID and delete it.
  const carrier = await User.findByIdAndDelete(req.params.id);
  if (!carrier) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This carrier', 404));
  }

  // Return a success message.
  res.status(200).json({
    status: 'success',
  });
});

exports.createCarrier = catchAsync(async (req, res, next) => {
  req.body.role = 'carrier';
  const carrier = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      carrier,
    },
  });
});

exports.calcDistFromCarrierToShopping = catchAsync(async (req, res, next) => {
  const unit = req.params.unit;
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  let userCoordinates;
  const load = await Loads.findById(req.params.idload);
  console.log(load);
  if (!load.idCarrier) {
    return next(new AppError('This Load Not For you.'));
  }

  if (!(load.status === 'Booked' || load.status === 'inroads')) {
    return next(new AppError('This Load Not For Shipping Now.'), 400);
  }
  if (load.status === 'Booked') {
    userCoordinates = load.PickupLocation.coordinates;
  } else if (load.status === 'inroads') {
    userCoordinates = load.DropoutLocation.coordinates;
  }
  // Replace 'YOUR_API_KEY' with your actual TomTom API key
  const apiKey = process.env.API_KEY_TOMTOM;

  // Coordinates of the two points
  const point1 = {
    lat: userCoordinates[1],
    lon: userCoordinates[0],
  };

  const point2 = {
    lat: req.user.currentLocation.coordinates[0] * 1,
    lon: req.user.currentLocation.coordinates[1] * 1,
  };
  console.log(point1);
  console.log(point2);

  const travelMode = 'truck';
  const apiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${point1.lat},${point1.lon}:${point2.lat},${point2.lon}/json?travelMode=${travelMode}`;
  axios
    .get(apiUrl, {
      params: {
        key: apiKey,
      },
    })
    .then(async (response) => {
      if (response.status > 200) {
        return next(
          new AppError(
            'Failed to retrieve distance. Check your coordinates.',
            404
          )
        );
      }
      const data = response.data;
      const distanceInMeters = data.routes[0].summary.lengthInMeters;
      const distanceInKilometers = distanceInMeters * multiplier;
      const distance = distanceInKilometers.toFixed(2);

      req.user.currentDistance = distance;
      req.user.currentLocation.coordinates = [point2.lat, point2.lon];
      carr = req.user;
      carr = await carr.save({ validateBeforeSave: false });
      const StatusNow = load.status === 'Booked' ? 'To Pickup' : 'To Dropout';

      res.status(200).json({
        status: 'success',
        data: {
          distance,
          StatusNow,
        },
      });
    })
    .catch((error) => {
      console.error('Axios request error:', error);
      next(
        new AppError('Invalid Coordinates Make Sure With You Two Points', 400)
      );
    });
});

exports.updateCurrentLocation = catchAsync(async (req, res, next) => {
  currentLocation.coordinates = [req.body.lon * 1, req.body.lat * 1];
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentLocation },
    {
      new: true,
      runValidators: false,
    }
  );
  if (!user) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This user', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateCarrierToSubcarrier = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    role: 'subcarrier',
  });

  if (req.body.team_id) {
    const inputVerfied = crypto
      .createHash('sha256')
      .update(req.body.team_id)
      .digest('hex');
    const team = await Booker.findOne({ email: req.body.email });

    if (!team) {
      await User.findByIdAndUpdate(req.user.id, {
        role: 'carrier',
      });
      return next(new AppError('NoT Found team With this id', 404));
    }

    if (inputVerfied === team.team_id) {
      const updatedteam = await Booker.findOneAndUpdate(
        { email: req.body.email },
        {
          $push: { friends: user._id },
        },
        {
          runValidators: false,
        }
      );
      if (!updatedteam) {
        user.role = 'carrier';
        await user.save({ validateBeforeSave: false });
        return next(new AppError('This team Not Found', 404));
      }
      teamName = updatedteam.teamName;
      res.status(200).json({
        status: 'success',
        data: {
          teamName,
        },
      });
    } else {
      return next(new AppError('teamId is not validated.', 401));
    }
  } else if (req.body.company_id) {
    const inputVerfied = crypto
      .createHash('sha256')
      .update(req.body.company_id)
      .digest('hex');
    const company = await Booker.findOne({ email: req.body.email });

    if (!company) {
      await User.findByIdAndUpdate(req.user.id, {
        role: 'carrier',
      });
      return next(new AppError('NoT Found Company With this id', 404));
    }

    if (inputVerfied === company.company_id) {
      const updatedcompany = await Booker.findOneAndUpdate(
        { email: req.body.email },
        {
          $push: { friends: user._id },
        },
        {
          new: true,
          runValidators: false,
        }
      );
      if (!updatedcompany) {
        user.role = 'carrier';
        console.log(user);
        await user.save({ validateBeforeSave: false });
        return next(new AppError('This company Not Found', 404));
      }
      companyName = updatedcompany.companyName;
      res.status(200).json({
        status: 'success',
        data: {
          companyName,
        },
      });
    } else {
      return next(new AppError('company is not validated.', 401));
    }
  } else {
    return next(
      new AppError(
        'You lost your premissiom as carrier from your bad request. Please call our supporter to return your permition to your account.',
        400
      )
    );
  }
});

exports.getBookedLoadsForCarrier = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Loads.find({
      status: { $in: ['Booked', 'inroads', 'inchecksp', 'paymented'] },
      idCarrier: req.user.id.toString(),
    }),
    req.query
  ).sort();

  const loads = await features.query;

  if (loads.length === 0) {
    return next(new AppError('There is no loads Booked for you', 404));
  }
  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

exports.getdroupedoutLoadsForCarrier = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Loads.find({
      status: 'completed',
      idCarrier: req.user.id.toString(),
    }),
    req.query
  ).sort();

  const loads = await features.query;

  if (loads.length === 0) {
    return next(new AppError('There is no loads Carried for you', 404));
  }

  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

exports.assignCarrierToTeamlead = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email }).select(
    '+password'
  );

  // Check if the user exists and the provided password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect password', 401));
  }
  const newTeam = await Booker.create({
    team_id: req.body.team_id,
    teamName: req.body.teamName,
    role: 'teamleader',
    phoneNumber: req.body.phoneNumber,
    email: req.user.email,
    userName: req.user.userName,
    address: req.body.address,
    password: req.body.password,
  });

  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      newTeam,
    },
  });
});

exports.addfriend = catchAsync(async (req, res, next) => {
  senderId = req.user.id;
  const recipientId = req.body.recipientId;
  const recipient = await User.findById(recipientId);

  if (!senderId || !recipient) {
    return next(new AppError('User Not Found', 404));
  }
  req.user.friends.push(recipientId);
  await req.user.save();
  res.status(200).json({
    status: 'success',
    message: 'Friend request sent.',
  });
});

exports.acceptFriendReq = catchAsync(async (req, res, next) => {
  const friendId = new mongoose.Types.ObjectId(req.body.friendId);
  const friend = await User.findById(friendId);
  console.log(friend.friends);
  if (!friend) {
    return next(new AppError('Friend Not Found', 404));
  }

  if (!friend.friends.includes(req.user.id)) {
    return next(
      new AppError('You Do not have a request friend from this user', 404)
    );
  }
  req.user.friends.push(friendId);
  await req.user.save();
  res.status(200).json({
    status: 'success',
    message: 'Friend Request Accepted.',
    data: {
      user: req.user,
    },
  });
});

exports.rejectFriendReq = catchAsync(async (req, res, next) => {
  const friendId = new mongoose.Types.ObjectId(req.body.friendId);
  const friend = await User.findById(friendId);
  console.log(friend.friends);
  if (!friend) {
    return next(new AppError('Friend Not Found', 404));
  }

  if (!friend.friends.includes(req.user.id)) {
    return next(
      new AppError('You Do not have a request friend from this user', 404)
    );
  }
  await User.updateOne(
    { _id: friendId }, // Filter the document based on its ID.
    { $pull: { friends: req.user.id } },
    {
      new: true,
      runValidators: false,
    }
  );
  res.status(200).json({
    status: 'success',
    message: 'Friend Request Rejected.',
  });
});

exports.calcDeadMileForLoad = catchAsync(async (req, res, next) => {
  const unit = 'mi';
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  let userCoordinates;
  const load = await Loads.findById(req.params.id);

  if (!load) {
    return next(new AppError('Load Not Found', 404));
  }

  const apiKey = process.env.API_KEY_TOMTOM;
  userCoordinates = load.DropoutLocation.coordinates;
  // Coordinates of the two points
  const point1 = {
    lat: userCoordinates[1],
    lon: userCoordinates[0],
  };

  const point2 = {
    lat: req.user.mygrage.coordinates[1] * 1,
    lon: req.user.mygrage.coordinates[0] * 1,
  };
  console.log(point1);
  console.log(point2);

  const travelMode = 'truck';
  // TomTom API endpoint for calculating distance
  const apiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${point1.lat},${point1.lon}:${point2.lat},${point2.lon}/json?travelMode=${travelMode}`;

  // Make the API request
  axios
    .get(apiUrl, {
      params: {
        key: apiKey,
      },
    })
    .then(async (response) => {
      if (response.status > 200) {
        return next(
          new AppError(
            'Failed to retrieve distance. Check your coordinates.',
            404
          )
        );
      }
      const data = response.data;
      // Extract the distance in meters from the response
      const distanceInMeters = data.routes[0].summary.lengthInMeters;
      // Convert the distance to kilometers
      const distanceInKilometers = distanceInMeters * multiplier;
      const distance = distanceInKilometers.toFixed(2);

      res.status(200).json({
        status: 'success',
        data: {
          distance,
        },
      });
    })
    .catch((error) => {
      console.error('Axios request error:', error);
      next(
        new AppError('Invalid Coordinates Make Sure With You Two Points', 400)
      );
    });
});
