const bcrypt = require('bcrypt');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');

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

//For Admin
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

//For Admin
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

//For Admin
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
