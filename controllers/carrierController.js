const bcrypt = require('bcrypt');
const axios = require('axios');
const crypto = require('crypto');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');
const Loads = require('../models/loadsModel');
const Booker = require('../models/bookerModel');
const Team = require('../models/teamleadModel');

//get location for carriers
exports.locationdectecd = catchAsync(async (req, res, next) => {
  const latlng = req.params.latlng;
  const unit = req.params.unit;
  const [lat, lng] = latlng.split(',');
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

//Get All Carriers Data for Admin
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

//For Admin
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

//For Admin
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

//For Admin
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
  if (load.idCarrier.toString() != req.user.id) {
    return next(new AppError('This Load Not For you.'), 401);
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
    lat: userCoordinates[0],
    lon: userCoordinates[1],
  };
  console.log(req.user.currentLocation.coordinates);
  const point2 = {
    lat: req.user.currentLocation.coordinates[1] * 1,
    lon: req.user.currentLocation.coordinates[0] * 1,
  };

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
        'You lost your premissiom as carrier from your bad request. Please call our supporter to return your permition0.',
        400
      )
    );
  }
});

exports.getBookedLoadsForCarrier = catchAsync(async (req, res, next) => {
  const loads = await Loads.find({
    status: 'Booked',
    idCarrier: req.user.id.toString(),
  });

  if (loads.length === 0) {
    return next(new AppError('There is no loads Booked for you', 404));
  }
  res.status(200).json({
    status: 'success',
    result: loads.length,
    data: {
      loads,
    },
  });
});

exports.getdroupedoutLoadsForCarrier = catchAsync(async (req, res, next) => {
  const loads = await Loads.find({
    status: 'Completed',
    idCarrier: req.user.id.toString(),
  });
  if (loads.length === 0) {
    return next(new AppError('There is no loads Carried for you', 404));
  }
  res.status(200).json({
    status: 'success',
    result: loads.length,
    data: {
      loads,
    },
  });
});

// exports.assignCarrierToTeamlead = catchAsync(async (req, res, next) => {
//   const { team_id, teamName, role } = req.body;

//   req.body.team_id = team_id;
//   req.body.teamName = teamName;
//   req.body.role = 'teamleader';

//   const newTeam = await Booker.create(req.body);
// });
