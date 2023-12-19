const bcrypt = require('bcrypt');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');
const Loads = require('../models/loadsModel');
const axios = require('axios');

exports.getAllShippers = catchAsync(async (req, res, next) => {
  const shippers = await User.find({ role: 'shipper' });
  if (shippers.length === 0) {
    return next(new AppError('No shippers available', 404));
  }
  res.status(200).json({
    status: 'success',
    result: shippers.length,
    data: {
      shippers,
    },
  });
});

exports.updateShipper = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 14);
  }
  const shipper = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  await shipper.save({ validateBeforeSave: false });

  if (!shipper) {
    return next(new AppError('Not Found This carrier', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shipper,
    },
  });
});

exports.getShipper = catchAsync(async (req, res, next) => {
  const shipper = await User.findById(req.params.id);
  if (!shipper) {
    return next(new AppError('Not Found This carrier', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      shipper,
    },
  });
});

exports.deleteShipper = catchAsync(async (req, res, next) => {
  // Find the Carriers by ID and delete it.
  const shipper = await User.findByIdAndDelete(req.params.id);
  if (!shipper) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This carrier', 404));
  }

  // Return a success message.
  res.status(200).json({
    status: 'success',
  });
});

exports.createShipper = catchAsync(async (req, res, next) => {
  req.body.role = 'shipper';

  const shipper = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      shipper,
    },
  });
});

exports.createShipmentFromAToB = catchAsync(async (req, res, next) => {
  const load = await Loads.findById(req.load._id);
  const specifiedPointCoordinates = load.DropoutLocation.coordinates; // Assuming PickupLocation is the correct field name
  const userCoordinates = load.PickupLocation.coordinates;
  const unit = 'mi';
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  // Replace 'YOUR_API_KEY' with your actual TomTom API key
  const apiKey = process.env.API_KEY_TOMTOM;

  // Coordinates of the two points
  const point1 = {
    lat: specifiedPointCoordinates[1],
    lon: specifiedPointCoordinates[0],
  };
  const point2 = { lat: userCoordinates[1], lon: userCoordinates[0] };

  const deptTime = load.departureTime.toISOString();
  console.log(deptTime);
  // TomTom API endpoint for calculating distance
  const travelMode = 'truck';
  const apiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${point1.lat},${point1.lon}:${point2.lat},${point2.lon}/json?travelMode=${travelMode}`;

  // Make the API request
  axios
    .get(apiUrl, {
      params: {
        key: apiKey,
        instructionsType: 'text',
        computeTravelTimeFor: 'all',
        // departureTime: deptTime,
      },
    })
    .then((response) => {
      if (response.status > 200) {
        return next(
          new AppError(
            'Failed to retrieve distance. Check your coordinates.',
            404
          )
        );
      }
      const data = response.data;
      console.log(data.routes[0].summary);
      // Extract the distance in meters from the response
      const distanceInMeters = data.routes[0].summary.lengthInMeters;
      // Convert the distance to kilometers
      const distanceInKilometers = distanceInMeters * multiplier;
      const distance = distanceInKilometers.toFixed(2);
      let priceLoads = distance * 1.5;
      priceLoads = priceLoads.toFixed(2);
      load.summary = data.routes[0].summary;
      load.priceLoads = priceLoads;
      load.shipmentDistance = distance;
      load.dataSummary = load.save({ validateBeforeSave: false });

      res.status(200).json({
        status: 'success',
        data: {
          load,
          distance,
        },
      });
    });
});

exports.getMyLoadsStatistics = catchAsync(async (req, res, next) => {

  

});
