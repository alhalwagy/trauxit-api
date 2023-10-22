const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Import JWT for token handling
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const validator = require('express-validator');
const crypto = require('crypto');

const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors

const User = require('../models/userModel'); // Import the User model
const Booker = require('../models/bookerModel');
const Car = require('../models/carModel');

const Email = require('../utils/email');

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
  if (!req.files) {
    return next();
  }
  // console.log(req.files);
  req.body.image = `User-${req.booker.id}-${Date.now()}.jpeg`;
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

exports.updateBookerData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route not for update Password', 400));
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

  if (req.files) {
    if (req.booker.image) {
      const imageUrl = req.booker.image;
      const part = imageUrl.split('User');
      const oldImagePath = `public/img/User${part[1]}`;
      console.log(oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    imageUrl = `http://192.168.1.16:3000/public/img/${req.body.image}`;

    filteredBody.image = imageUrl;
  }

  const updatedBooker = await Booker.findByIdAndUpdate(
    req.booker.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  updatedBooker.password = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedBooker,
    },
  });
});

// Function to sign a JSON Web Token (JWT) with user ID
// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// // Function to create and send a JWT token in a cookie and respond with user data
// const createSendToken = async (user, statusCode, req, res) => {
//   const token = signToken(user._id);
//   user.hashToken = token;

//   await user.save({ validateBeforeSave: false });

//   // Define cookie options
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
//   };

//   // Set the JWT token in a cookie
//   res.cookie('jwt', token, cookieOptions);

//   // Remove the password from the company object before sending it to the client
//   user.password = undefined;

//   // Respond with the JWT token and company data
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };

// Controller function for Company signup
// exports.signup = catchAsync(async (req, res, next) => {
//   if (req.body.password != req.body.passwordConfirm) {
//     return next(new AppError('Password confirm do not match  .', 400));
//   }
//   console.log(req.body);
//   const group_id = Math.floor(10000000 + Math.random() * 90000000).toString();

//   if (
//     !req.body.groupName ||
//     !req.body.password ||
//     !req.body.address ||
//     !req.body.email ||
//     !req.body.passwordConfirm ||
//     !req.body.phoneNumber ||
//     !req.body.userName ||
//     !req.body.role
//   ) {
//     return next(new AppError('The body of request not completed.'), 400);
//   }

//   const encryptedCompany_id = crypto
//     .createHash('sha256')
//     .update(group_id)
//     .digest('hex');
//   // Create a new Company based on request data
//   const newBooker = await Booker.create({
//     groupName: req.body.groupName,
//     group_id: encryptedCompany_id,
//     password: req.body.password,
//     address: req.body.address,
//     email: req.body.email,
//     passwordConfirm: req.body.passwordConfirm,
//     phoneNumber: req.body.phoneNumber,
//     userName: req.body.userName,
//     role: req.body.role,
//   });

//   await new Email(newBooker, group_id).sendTeamId();

//   createSendToken(newBooker, 201, req, res);
// });

// exports.logout = catchAsync(async (req, res, next) => {
//   const booker = await Booker.findById(req.booker.id);

//   if (!booker) {
//     return next(new AppError('There is no Booker with this id.', 404));
//   }

//   booker.hashToken = undefined;
//   await booker.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: 'success',
//   });
// });

// Middleware function to protect routes (check if Company is authenticated)
// exports.protect = catchAsync(async (req, res, next) => {
//   let token;
//   // Check if the token is included in the request headers or cookies
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }
//   // If no token is found, return an error
//   if (!token) {
//     return next(
//       new AppError('You are not logged in please log in to get access', 401)
//     );
//   }

//   // Verify the token and get the decoded user ID
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//   // Find the company associated with the token
//   const freshbooker = await Booker.findById(decoded.id);

//   // If the company doesn't exist, return an error
//   if (!freshbooker) {
//     return next(
//       new AppError(
//         'The company belonging to this token does not no longer exist.',
//         404
//       )
//     );
//   }
//   if (freshbooker.hashToken != token) {
//     return next(
//       new AppError(
//         'The Session is Expired Or logged in another device. Please Login Again.',
//         400
//       )
//     );
//   }

//   // Set the company data in the request object and response locals
//   req.booker = freshbooker;
//   res.locals.booker = freshbooker;

//   // Move to the next middleware
//   next();
// });

// exports.getMe = catchAsync(async (req, res, next) => {
//   const booker = await Booker.findById(req.booker.id);
//   booker.password = undefined;
//   if (!booker) {
//     return next(AppError('Booker not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booker,
//     },
//   });
// });

// exports.updateMyPassword = catchAsync(async (req, res, next) => {
//   const bookerData = await Booker.findById(req.booker.id);
//   if (!bookerData) {
//     return next(new AppError('Booker not found. Please log in again.'));
//   }
//   if (req.body.password != req.body.passwordConfirm) {
//     return next(new AppError('Password confirm do not match password.', 400));
//   }

//   if (
//     !(await bookerData.correctPassword(
//       req.body.currentPassword,
//       bookerData.password
//     ))
//   ) {
//     return next(new AppError('Your current password is wrong.', 401));
//   }

//   bookerData.password = req.body.password;
//   await bookerData.save();
//   res.status(200).json({
//     status: 'success',
//   });
// });

exports.crearteSubCarrier = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }

  const user = await User.create({
    role: 'subcarrier',
    fullName: req.body.fullName,
    userName: req.body.userName,
    password: req.body.password,
    birthDate: req.body.birthDate,
    address: req.body.address,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  });
  console.log(user._id);
  console.log(req.booker.id);
  const updatedBooker = await Booker.findByIdAndUpdate(
    req.booker.id,
    {
      $push: { friends: user._id },
    },
    { new: true }
  );
  if (!updatedBooker) {
    await User.findByIdAndDelete(user._id);

    return next(new AppError('There is No Team with this id'), 404);
  }
  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getMyMembers = catchAsync(async (req, res, next) => {
  let myFriends = await Booker.findById(req.booker.id).populate({
    path: 'friends',
    select: 'fullName email',
  });
  myFriends = myFriends.friends;

  // Create an array to store user-car pairs
  const userCars = [];

  // Iterate through each friend
  for (const friend of myFriends) {
    const friendId = friend._id;
    const cars = await Car.find({ carrierId: friendId });

    // Create a user-car pair object
    const userCarPair = {
      user: friend,
      cars: cars,
    };

    userCars.push(userCarPair);
  }

  res.status(200).json({
    status: 'success',
    data: {
      userCars,
    },
  });
});
