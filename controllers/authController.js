const Shipper = require('../models/shipperModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

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

exports.signupShipper = catchAsync(async (req, res, next) => {
  const newShipper = await Shipper.create({
    id: req.body.id,
    fullName: req.body.fullName,
    userName: req.body.userName,
    ID_card_number: req.body.ID_card_number,
    password: req.body.password,
    birthDate: req.body.birthDate,
    companyName: req.body.companyName,
    address: req.body.address,
    // location_address: req.body.location_address,
  });
  // console.log(newShipper.id);
  createSendToken(newShipper, 201, req, res);
});
