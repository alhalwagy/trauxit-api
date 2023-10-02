// Import necessary modules and dependencies
const Car = require('../models/carModel'); // Import the Car model
const User = require('../models/userModel');
const AppError = require('../utils/appError'); // Import an error handling utility
const catchAsync = require('../utils/catchAsync'); // Import an async error handling utility

// Define the controller function to create a new car
exports.createCar = catchAsync(async (req, res, nex) => {
  // Set the carrierId in the request body to the authenticated user's ID
  req.body.carrierId = req.user.id;
  // Create a new car object based on the request body data
  const newCar = await Car.create(req.body);

  // Populate the 'carrierId' field in the new car with additional user data
  await newCar.populate({
    path: 'carrierId',
    select: 'fullName userName role address companyName',
  });
  await newCar.save();
  // Send a JSON response with a 201 (Created) status code
  res.status(201).json({
    status: 'success',
    data: {
      newCar, // Include the newly created car data in the response
    },
  });
});

exports.updateCar = catchAsync(async (req, res, next) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });
  if (!car) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This car', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      car, // Include the newly created car data in the response
    },
  });
});

exports.deleteCar = catchAsync(async (req, res, next) => {
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This car', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      car, // Include the newly created car data in the response
    },
  });
});

exports.createCarForAdmin = catchAsync(async (req, res, next) => {
  const carrierCar = await User.findOne({ userName: req.body.userName });
  req.body.carrierId = carrierCar._id;

  const car = await Car.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      car, // Include the newly created car data in the response
    },
  });
});

exports.getAllCars = catchAsync(async (req, res, next) => {
  const cars = await Car.find({}).populate({
    path: 'carrierId',
    select: 'fullName userName role address companyName',
  });
  if (!cars.length === 0) {
    // Return an error if the Carriers is not found.
    return next(new AppError('No cars available', 404));
  }
  res.status(200).json({
    status: 'success',
    result: cars.length,
    data: {
      cars,
    },
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This car', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.getMyCar = catchAsync(async (req, res, next) => {
  console.log(req.user.userName);
  console.log(req.body);
  const myCars = await Car.find({ carrierId: req.user.id });
  if (myCars.length === 0) {
    // Return an error if the Carriers is not found.
    return next(new AppError('Not Found This car', 404));
  }
  res.status(200).json({
    status: 'success',
    result: myCars.length,
    data: {
      myCars,
    },
  });
});
