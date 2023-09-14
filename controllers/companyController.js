const { promisify } = require('util');
const jwt = require('jsonwebtoken'); // Import JWT for token handling

const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors
const Company = require('../models/companyModel');

// Function to sign a JSON Web Token (JWT) with user ID
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Function to create and send a JWT token in a cookie and respond with user data
const createSendToken = (company, statusCode, req, res) => {
  const token = signToken(company._id);

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
  company.password = undefined;

  // Respond with the JWT token and company data
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      company,
    },
  });
};

// Controller function for Company signup
exports.signup = catchAsync(async (req, res, next) => {
  // Create a new Company based on request data
  const newCompany = await Company.create({
    companyName: req.body.companyName,
    company_id: req.body.company_id,
    password: req.body.password,
    address: req.body.address,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
    phoneNumber: req.body.phoneNumber,
  });

  // Create and send a JWT token and respond with Company data
  createSendToken(newCompany, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Check if email and password are provided in the request body
  if (!req.body.password || !req.body.email) {
    return next(new AppError('Please provide us by email and password', 400));
  }

  // Find a user by their username, including the password
  const company = await Company.findOne({ email: req.body.email }).select(
    '+password'
  );

  // Check if the user exists and the provided password is correct
  if (
    !company ||
    !(await company.correctPassword(req.body.password, company.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Generate a new JWT token for the user
  company.hashToken = signToken(company._id);
  await company.save({ validateBeforeSave: false });

  // Create and send a JWT token and respond with company data
  createSendToken(company, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.user.id);

  if (!company) {
    return next(new AppError('There is no Company with this id.', 404));
  }

  company.hashToken = undefined;
  await company.save({ validateBeforeSave: false });

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
  const freshCompany = await Company.findById(decoded.id);

  // If the company doesn't exist, return an error
  if (!freshCompany) {
    return next(
      new AppError(
        'The company belonging to this token does not no longer exist.',
        404
      )
    );
  }
  if (freshCompany.hashToken != token) {
    return next(
      new AppError(
        'The Session is Expired Or logged in another device. Please Login Again.',
        400
      )
    );
  }

  // Set the company data in the request object and response locals
  req.company = freshCompany;
  res.locals.company = freshCompany;

  // Move to the next middleware
  next();
});
