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
const Authentication = require('../models/authModel');

// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//   console.log(file);
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400));
//   }
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// exports.updateBookerData= catchAsync(async (req, res, next) => {
//   console.log(req.body);
//   let data = {};
//   // console.log(req.files);
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         'This route is not for password updates. Please use /updateMyPassword.',
//         400
//       )
//     );
//   }

//   // Check if an old image exists
//   console.log(req.files);
//   if (req.files.image) {
//     const imageUrl = await User.findOne({ userid: req.user.id });
//     if (imageUrl.image) {
//       // console.log(req.user.image);
//       const parts = imageUrl.image.split('User');
//       // Get the path to the old image
//       const oldImagePath = `public/img/User${parts[1]}`;
//       console.log(
//         '.....................................................................'
//       );

//       console.log(oldImagePath);

//       // Check if the old image file exists
//       if (fs.existsSync(oldImagePath)) {
//         // Delete the old image file
//         fs.unlinkSync(oldImagePath);
//       }
//     }
//   }

//   //2) Filtered out unwanted fields that are not allowed to be updated
//   const filteredBody = filterObj(
//     req.body,
//     'fullName',
//     'phoneNumber',
//     'birthDate',
//     'address',
//     'mygrage'
//   );

//   let imageUrl;
//   if (req.files.image) {
//     imageUrl = `http://192.168.1.23:3000/public/img/${req.body.image}`;

//     filteredBody.image = imageUrl;
//   }
//   // console.log(filteredBody);

//   if (req.body.email || req.body.userName) {
//     const authUser = await Authentication.findByIdAndUpdate(
//       req.user.id,
//       {
//         ...(req.body.email && { email: req.body.email }),
//         ...(req.body.userName && { userName: req.body.userName }),
//       },
//       { new: true, runValidators: true }
//     );
//     console.log(authUser);
//     data.userData = authUser;
//   }
//   console.log(filteredBody);
//   //3) Update the user document
//   if (Object.keys(filteredBody).length > 0) {
//     const updatedUser = await User.findOneAndUpdate(
//       { userid: req.user.id },
//       filteredBody,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     data.user_info = updatedUser;
//   }
//   res.status(200).json({
//     status: 'success',
//     data,
//   });
// });

// exports.uploadUserImage = upload.fields([
//   {
//     name: 'image',
//     maxCount: 1,
//   },
// ]);

// exports.resizeUserImage = catchAsync(async (req, res, next) => {
//   if (!req.files) {
//     return next();
//   }
//   // console.log(req.files);
//   req.body.image = `User-${req.booker.id}-${Date.now()}.jpeg`;
//   // console.log(req.files.image);
//   await sharp(req.files.image[0].buffer)
//     .resize(700, 700)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/${req.body.image}`);
//   next();
// });

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el] = obj[el];
//     }
//   });
//   return newObj;
// };

// exports.updateBookerData = catchAsync(async (req, res, next) => {
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(new AppError('This route not for update Password', 400));
//   }
//   //2) Filtered out unwanted fields that are not allowed to be updated
//   const filteredBody = filterObj(
//     req.body,
//     'fullName',
//     'email',
//     'phoneNumber',
//     'userName',
//     'birthDate',
//     'address'
//   );

//   if (req.files) {
//     if (req.booker.image) {
//       const imageUrl = req.booker.image;
//       const part = imageUrl.split('User');
//       const oldImagePath = `public/img/User${part[1]}`;
//       console.log(oldImagePath);
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//       }
//     }

//     imageUrl = `http://192.168.1.16:3000/public/img/${req.body.image}`;

//     filteredBody.image = imageUrl;
//   }

//   const updatedBooker = await Booker.findByIdAndUpdate(
//     req.booker.id,
//     filteredBody,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   updatedBooker.password = undefined;
//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: updatedBooker,
//     },
//   });
// });

exports.crearteSubCarrier = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
  const userData = await Authentication.create({
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email,
    role: 'subcarrier',
  });
  const user_info = await User.create({
    fullName: req.body.fullName,
    birthDate: req.body.birthDate,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    userid: userData._id,
  });
  console.log(req.user.id);
  const updatedBooker = await Booker.findOneAndUpdate(
    { userid: req.user._id },
    {
      $push: { friends: userData._id },
    },
    { new: true }
  );
  if (!updatedBooker) {
    await User.findByIdAndDelete(user_info._id);
    await Authentication.findByIdAndDelete(userData._id);
    return next(new AppError('There is No Team with this id'), 404);
  }
  res.status(201).json({
    status: 'success',
    data: {
      userData,
      user_info,
    },
  });
});

exports.getMyMembers = catchAsync(async (req, res, next) => {
  let myFriends = await Booker.findOne({ userid: req.user.id }).populate({
    path: 'friends',
    select: 'userName email role',
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

//get All Sub Carrier
exports.getAllSubcarriers = catchAsync(async (req, res, next) => {
  const subcarrier = await Authentication.find({
    role: 'subcarrier',
  });

  if (subcarrier.length === 0) {
    return next(new AppError('No Subcarriers Available.', 404));
  }

  res.status(200).json({
    status: 'success',
    length: subcarrier.length,
    data: {
      subcarrier,
    },
  });
});

exports.assignTeamLeaderToComany = catchAsync(async (req, res, next) => {
  const encryptedCompany_id = crypto
    .createHash('sha256')
    .update(req.body.group_id)
    .digest('hex');
  const company = await Booker.findOneAndUpdate(
    { group_id: encryptedCompany_id },
    { $push: { friends: req.user.id } }
  );

  if (!company) {
    return next(
      new AppError('Company Not Found. Please check your company id.', 404)
    );
  }

  res.status(200).json({
    status: 'success',

    data: {
      company,
    },
  });
});
