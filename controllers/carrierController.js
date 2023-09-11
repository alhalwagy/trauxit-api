const bcrypt = require('bcrypt');
const axios = require('axios');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');
const Loads = require('../models/loadsModel');

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
  const latlng = req.params.latlng;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError('There is no latitude or longitude in the request!', 400)
    );
  }
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
  const point2 = { lat: lng * 1, lon: lat * 1 };

  // TomTom API endpoint for calculating distance
  const apiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${point1.lat},${point1.lon}:${point2.lat},${point2.lon}/json`;

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
      const distanceInKilometers = distanceInMeters / 1000;
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

