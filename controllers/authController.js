const { promisify } = require('util');
const jwt = require('jsonwebtoken'); // Import JWT for token handling

const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors

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

// Controller function for user signup
exports.signupUser = catchAsync(async (req, res, next) => {
  // Create a new user based on request data
  const newShipper = await User.create({
    role: req.body.role,
    fullName: req.body.fullName,
    userName: req.body.userName,
    ID_card_number: req.body.ID_card_number,
    password: req.body.password,
    birthDate: req.body.birthDate,
    companyName: req.body.companyName,
    address: req.body.address,
    rating: req.body.rating,
    location_address: req.body.location_address,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Create and send a JWT token and respond with user data
  createSendToken(newShipper, 201, req, res);
});

// Controller function for user login
exports.login = catchAsync(async (req, res, next) => {
  // Check if email and password are provided in the request body
  if (!req.body.password || !req.body.userName) {
    return next(new AppError('Please provide us by email and password', 400));
  }

  // Find a user by their username, including the password
  const user = await User.findOne({ userName: req.body.userName }).select(
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

// Middleware function to protect routes (check if user is authenticated)
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

  // Find the user associated with the token
  const freshUser = await User.findById(decoded.id);

  // If the user doesn't exist, return an error
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does not no longer exist',
        404
      )
    );
  }

  // Set the user data in the request object and response locals
  req.user = freshUser;
  res.locals.user = freshUser;

  // Move to the next middleware
  next();
});

// Middleware function to restrict access to specific roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You don't have the permission to access this service ",
          403
        )
      );
    }
    next();
  };
