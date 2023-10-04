const { promisify } = require('util');
const jwt = require('jsonwebtoken'); // Import JWT for token handling
const crypto = require('crypto');
const fs = require('fs'); // Require the 'fs' module for file operations

const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors
const Booker = require('../models/bookerModel');
const multer = require('multer');
const sharp = require('sharp');

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.password = undefined;
  if (!user) {
    return next(AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const userData = await User.findById(req.user.id);
  if (!userData) {
    return next(new AppError('User not found. Please log in again.'));
  }
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }

  if (!userData.correctPassword(req.body.currentPassword, req.user.password)) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  userData.password = req.body.password;
  await userData.save();
  res.status(200).json({
    status: 'success',
  });
});

const multerStorage = multer.memoryStorage();

// Check if user upload only images or not
const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};
//give filter and storage to multer
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
//upload image
exports.uploadUserImage = upload.fields([
  {
    name: 'image',
    maxCount: 1,
  },
]);

//use sharp package to image preprocessing
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  // console.log(req.files);
  req.body.image = `User-${req.user.id}-${Date.now()}.jpeg`;
  // console.log(req.files.image);
  await sharp(req.files.image[0].buffer)
    .resize(700, 700)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.body.image}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // Check if an old image exists
  if (req.files) {
    const imageUrl = req.user.image;
    const parts = imageUrl.split('User');
    // Get the path to the old image
    const oldImagePath = `public/img/User${parts[1]}`;
    console.log(oldImagePath);

    // Check if the old image file exists
    if (fs.existsSync(oldImagePath)) {
      // Delete the old image file
      fs.unlinkSync(oldImagePath);
    }
  }

  //2) Filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'fullName',
    'email',
    'phoneNumber',
    'userName',
    'birthDate',
    'address'
  );

  let imageUrl;
  if (req.files) {
    imageUrl = `http://192.168.1.16:3000/public/img/${req.body.image}`;

    filteredBody.image = imageUrl;
  }
  console.log(filteredBody);

  //3) Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  updatedUser.password = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
