const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError'); // Import custom error handling utility
const Admin = require('../models/adminModel'); // Import the Admin model
const catchAsync = require('../utils/catchAsync');

// Function to sign a JSON Web Token (JWT) with user ID
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Function to create and send a JWT token in a cookie and respond with user data
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

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

  // Remove the password from the user object before sending it to the client
  user.password = undefined;

  // Respond with the JWT token and user data
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Controller function for admin signup
exports.SignupAdmins = catchAsync(async (req, res, next) => {
  // Create a new admin based on request data
  const newAdmin = await Admin.create({
    role: req.body.role,
    fullName: req.body.fullName,
    userName: req.body.userName,
    password: req.body.password,
    birthDate: req.body.birthDate,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
  });

  // Create and send a JWT token and respond with admin data
  createSendToken(newAdmin, 201, req, res);
});

// Middleware function to protect routes (check if admin is authenticated)
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
      new AppError('You are not logged in please log in to get access', 200)
    );
  }

  // Verify the token and get the decoded user ID
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Find the admin associated with the token
  const freshUser = await Admin.findById(decoded.id);
  console.log(freshUser);
  // If the admin doesn't exist, return an error
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does not no longer exist',
        404
      )
    );
  }
  if (freshUser.hashToken != token) {
    return next(
      new AppError(
        'The Session is expired Or logged in another device. Please Login again',
        400
      )
    );
  }
  // Set the admin data in the request object and response locals
  req.admin = freshUser;
  res.locals.admin = freshUser;

  // Move to the next middleware
  next();
});

// Middleware function to restrict access to specific roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Check if the admin's role is included in the allowed roles
    if (!roles.includes(req.admin.role)) {
      return next(
        new AppError(
          "You don't have the permission to access this service ",
          403
        )
      );
    }
    next();
  };

exports.login = catchAsync(async (req, res, next) => {
  // Check if email and password are provided in the request body
  if (!req.body.password || !req.body.userName) {
    return next(new AppError('Please provide us by email and password', 400));
  }

  // Find a user by their username, including the password
  const user = await Admin.findOne({ userName: req.body.userName }).select(
    '+password'
  );

  // Check if the user exists and the provided password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Generate a new JWT token for the user
  user.hashToken = signToken(user._id);
  await user.save({ validateBeforeSave: false });

  // Create and send a JWT token and respond with user data
  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return next(new AppError('There is no Admin with this id.', 404));
  }

  admin.hashToken = undefined;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});
