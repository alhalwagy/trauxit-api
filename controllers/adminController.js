const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../models/adminModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };
  res.cookie('jwt', token, cookieOptions);
  //Remove the password from result of client
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.SignupAdmins = catchAsync(async (req, res, next) => {
  const newAdmin = await Admin.create({
    role: req.body.role,
    fullName: req.body.fullName,
    userName: req.body.userName,
    password: req.body.password,
    birthDate: req.body.birthDate,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newAdmin, 201, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in please log in to get access', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await Admin.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does not no longer exist',
        404
      )
    );
  }
  // if (freshUser.checkPasswordChanged(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password. Please log in again.', 401)
  //   );
  // }
  req.admin = freshUser;
  res.locals.admin = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
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
