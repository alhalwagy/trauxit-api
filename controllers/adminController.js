const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const AppError = require('../utils/appError'); // Import custom error handling utility
const Admin = require('../models/adminModel'); // Import the Admin model
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

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
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
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
  if (!req.body.password || !req.body.email) {
    return next(new AppError('Please provide us by email and password', 400));
  }

  // Find a user by their username, including the password
  const user = await Admin.findOne({ email: req.body.email }).select(
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

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //get user ,check if exist
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    return next(new AppError('No admin found with this email', 404));
  }
  const randomNum = admin.CreatePasswordResetCode();
  console.log(randomNum);
  await admin.save({ validateBeforeSave: false });
  console.log(admin.passwordRestExpires);

  await sendEmail({
    to: admin.email,
    subject: 'Your password reset code (valid for 10 minutes',
    message: `
Hi ${admin.fullName}, \n
Enter this code to complete the reset. \n
${randomNum} \n
Thanks for helping us keep your account secure. \n
The Trauxit Group \n
`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Reset code passed to your mail, Please check your inbox mails',
  });
});

exports.verifyResetCode = catchAsync(async (req, res, next) => {
  hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.passwordRestCode)
    .digest('hex');

  const admin = await Admin.findOne({
    passwordRestCode: hashedResetCode,
    passwordRestExpires: { $gt: Date.now() },
  });
  console.log('hashedResetCode:', hashedResetCode);
  console.log('Current Time:', Date.now());
  console.log(admin);
  if (!admin) {
    return next(
      new AppError(
        'Invalid password Reset Code, check code from mail again!',
        404
      )
    );
  }
  admin.passwordRestIsused = true;
  admin.passwordRestCode = undefined;
  admin.passwordRestExpires = undefined;
  admin.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password not match password confirm.', 404));
  }
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return next(new AppError('No admin found with this email', 404));
  }

  if (!admin.passwordRestIsused) {
    return next(
      new AppError(
        'Invalid password Reset Code, check code from mail again!',
        404
      )
    );
  }
  admin.password = req.body.password;
  admin.passwordRestIsused = undefined;
  admin.passwordChangedAt = Date.now();
  await admin.save();
  res.status(200).json({
    status: 'success',
    data: 'Password Updated !!',
  });
});
