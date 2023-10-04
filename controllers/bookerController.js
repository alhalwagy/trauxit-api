const { promisify } = require('util');
const jwt = require('jsonwebtoken'); // Import JWT for token handling

const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors
const Booker = require('../models/bookerModel');
const validator = require('express-validator');
const crypto = require('crypto');
const Email = require('../utils/email');

// Function to sign a JSON Web Token (JWT) with user ID
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Function to create and send a JWT token in a cookie and respond with user data
const createSendToken = async (user, statusCode, req, res) => {
  const token = signToken(user._id);
  user.hashToken = token;

  await user.save({ validateBeforeSave: false });

  // Define cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // Set the JWT token in a cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the company object before sending it to the client
  user.password = undefined;

  // Respond with the JWT token and company data
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Controller function for Company signup
exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
  if (!req.body.role) {
    return next(new AppError('role Must be in body', 400));
  }
  if (req.body.role === 'company') {
    if (
      !req.body.companyName ||
      !req.body.company_id ||
      !req.body.password ||
      !req.body.address ||
      !req.body.email ||
      !req.body.passwordConfirm ||
      !req.body.phoneNumber ||
      !req.body.userName ||
      !req.body.role
    ) {
      return next(new AppError('The body of request not completed.'), 400);
    }
    const encryptedCompany_id = crypto
      .createHash('sha256')
      .update(req.body.group_id)
      .digest('hex');
    // Create a new Company based on request data
    const newBooker = await Booker.create({
      companyName: req.body.companyName,
      group_id: encryptedCompany_id,
      password: req.body.password,
      address: req.body.address,
      email: req.body.email,
      passwordConfirm: req.body.passwordConfirm,
      phoneNumber: req.body.phoneNumber,
      userName: req.body.userName,
      role: req.body.role,
    });

    // Create and send a JWT token and respond with Company data
    createSendToken(newBooker, 201, req, res);
  } else if (req.body.role === 'teamleader') {
    console.log(req.body);
    if (
      !req.body.teamName ||
      !req.body.password ||
      !req.body.address ||
      !req.body.email ||
      !req.body.passwordConfirm ||
      !req.body.phoneNumber ||
      !req.body.userName ||
      !req.body.role
    ) {
      return next(new AppError('The body of request not completed.'), 400);
    }
    const team_id = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Create a new Company based on request data
    const encryptedTeam_id = crypto
      .createHash('sha256')
      .update(team_id)
      .digest('hex');
    const newBooker = await Booker.create({
      teamName: req.body.teamName,
      group_id: encryptedTeam_id,
      password: req.body.password,
      address: req.body.address,
      email: req.body.email,
      passwordConfirm: req.body.passwordConfirm,
      phoneNumber: req.body.phoneNumber,
      userName: req.body.userName,
      role: req.body.role,
    });
    await new Email(newBooker, team_id).sendTeamId();

    createSendToken(newBooker, 201, req, res);
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  const booker = await Booker.findById(req.booker.id);

  if (!booker) {
    return next(new AppError('There is no Booker with this id.', 404));
  }

  booker.hashToken = undefined;
  await booker.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});

// Middleware function to protect routes (check if Company is authenticated)
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if the token is included in the request headers or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // If no token is found, return an error
  if (!token) {
    return next(
      new AppError('You are not logged in please log in to get access', 401)
    );
  }

  // Verify the token and get the decoded user ID
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Find the company associated with the token
  const freshbooker = await Booker.findById(decoded.id);

  // If the company doesn't exist, return an error
  if (!freshbooker) {
    return next(
      new AppError(
        'The company belonging to this token does not no longer exist.',
        404
      )
    );
  }
  if (freshbooker.hashToken != token) {
    return next(
      new AppError(
        'The Session is Expired Or logged in another device. Please Login Again.',
        400
      )
    );
  }

  // Set the company data in the request object and response locals
  req.booker = freshbooker;
  res.locals.booker = freshbooker;

  // Move to the next middleware
  next();
});

exports.getMe = catchAsync(async (req, res, next) => {
  const booker = await Booker.findById(req.booker.id);
  booker.password = undefined;
  if (!booker) {
    return next(AppError('Booker not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booker,
    },
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const bookerData = await Booker.findById(req.booker.id);
  if (!bookerData) {
    return next(new AppError('Booker not found. Please log in again.'));
  }
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }

  if (
    !(await bookerData.correctPassword(
      req.body.currentPassword,
      bookerData.password
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  bookerData.password = req.body.password;
  await bookerData.save();
  res.status(200).json({
    status: 'success',
  });
});
