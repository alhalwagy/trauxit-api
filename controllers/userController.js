const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booker = require('../models/bookerModel');
const Authentication = require('../models/authModel');

const multer = require('multer');
const sharp = require('sharp');

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await Authentication.findById(req.user.id);

  const userData = await User.findOne({ userid: req.user.id });
  if (!userData) {
    return next(new AppError('User not have A Data', 404));
  }
  user.password = undefined;
  if (!user) {
    return next(AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
      userData,
    },
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const userData = await Authentication.findById(req.user.id);
  if (!userData) {
    return next(new AppError('User not found. Please log in again.'));
  }
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }

  if (
    !(await userData.correctPassword(
      req.body.currentPassword,
      req.user.password
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  userData.password = req.body.password;
  await userData.save();
  res.status(200).json({
    status: 'success',
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserImage = upload.fields([
  {
    name: 'image',
    maxCount: 1,
  },
]);

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.files.image) {
    return next();
  }
  // console.log(req.files);
  req.body.image = `User-${req.user.id}-${Date.now()}.jpeg`;
  // console.log(req.files.image);

  await sharp(req.files.image[0].buffer)
    .resize(700, 700)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.body.image}`)
    .catch((err) => {
      const oldImagePath = `public/img/${req.body.image}`;
      if (fs.existsSync(oldImagePath)) {
        // Delete the old image file
        fs.unlinkSync(oldImagePath);
      }
      return next(new AppError('there is no compactable format', 400));
    });

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
  console.log(req.files.image);
  if (req.files.image) {
    if (req.user.image) {
      const imageUrl = req.user.image;
      console.log(req.user.image);
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
  }

  //2) Filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'fullName',
    'email',
    'phoneNumber',
    'userName',
    'birthDate',
    'address',
    'mygrage'
  );

  let imageUrl;
  if (req.files.image) {
    imageUrl = `http://192.168.1.23:3000/public/img/${req.body.image}`;

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
