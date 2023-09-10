const bcrypt = require('bcrypt');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');

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
