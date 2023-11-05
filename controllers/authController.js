const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment-timezone');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Booker = require('../models/bookerModel');
const Email = require('../utils/email');
const Authentication = require('../models/authModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (auth, statusCode, req, res) => {
  const token = signToken(auth.userData._id);
  // Generate a new JWT token for the auth
  const userData = auth;
  console.log(userData);
  const saveHashToken = await Authentication.findByIdAndUpdate(
    auth.userData._id,
    {
      hashToken: token,
    }
  );

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

  // Remove the password from the auth object before sending it to the client
  auth.password = undefined;

  // Respond with the JWT token and auth data
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      userData: userData.userData,
      user_info: userData.user_info,
    },
  });
};

exports.signupAuth = catchAsync(async (req, res, next) => {
  console.log(req.body);
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
  // Create a new user based on request data
  const newUser = await Authentication.create({
    role: req.body.role,
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email,
  });
  req.user = newUser;
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.password) {
    return next(new AppError('Please provide us by password', 400));
  }
  if (!req.body.userName && !req.body.email) {
    return next(new AppError('Please provide us by userName or email', 400));
  }

  const user = await Authentication.findOne({
    $or: [{ email: req.body.email }, { userName: req.body.userName }],
  }).select('+password');

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (
    user.role === 'carrier' ||
    user.role === 'subcarrier' ||
    user.role === 'shipper'
  ) {
    const user_info = await User.findOne({ userid: user._id });

    const userData = { ...user._doc };
    if (!user_info) {
      return next(new AppError('there is no data for user', 401));
    }

    // Create and send a JWT token and respond with user data
    createSendToken({ userData, user_info }, 200, req, res);
  } else if (user.role === 'teamlead' || user.role === 'company') {
    const user_info = await Booker.findOne({ userid: user._id });

    if (!user_info) {
      return next(new AppError('there is no data for user', 401));
    }
    const userData = { ...user._doc };

    // Create and send a JWT token and respond with user data
    createSendToken({ userData, user_info }, 200, req, res);
  }
});

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
  const freshUser = await Authentication.findById(decoded.id);
  // If the user doesn't exist, return an error
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does not no longer exist.',
        404
      )
    );
  }
  if (freshUser.hashToken != token) {
    return next(
      new AppError(
        'The Session is Expired Or logged in another device. Please Login Again.',
        400
      )
    );
  }
  // 4)check if user changed password after token issued
  if (freshUser.checkPasswordChanged(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  // console.log(req.user);
  // Set the user data in the request object and response locals
  req.user = freshUser;
  res.locals.user = freshUser;
  // Move to the next middleware
  next();
});

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

exports.logout = catchAsync(async (req, res, next) => {
  const user = await Authentication.findById(req.user.id);

  if (!user) {
    return next(new AppError('There is no user with this id.', 404));
  }

  user.hashToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    taken: 'Logout',
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //get user ,check if exist
  const user = await Authentication.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No User Found with this email', 404));
  }

  const randomNum = user.CreatePasswordResetCode();
  await user.save();

  await new Email(user, randomNum).sendPasswordReset();

  res.status(200).json({
    status: 'success',
    message: 'Reset code passed to your mail, Please check your inbox mails',
  });
});

exports.verifyResetCode = catchAsync(async (req, res, next) => {
  console.log(req.body);
  hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.passwordRestCode)
    .digest('hex');
  console.log(hashedResetCode);
  const user = await Authentication.findOne({
    passwordRestCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return next(
      new AppError(
        'Invalid password Reset Code, check code from mail again!',
        404
      )
    );
  }
  user.passwordRestIsused = true;
  user.passwordRestCode = undefined;
  user.passwordRestExpires = undefined;
  user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password not match password confirm.', 404));
  }
  const user = await Authentication.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  if (!user.passwordRestIsused) {
    return next(
      new AppError(
        'Invalid password Reset Code, check code from mail again!',
        404
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordRestIsused = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    data: 'Password Updated !!',
  });
});

exports.signupUser = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  if (req.user.role === 'carrier' || req.user.role === 'shipper') {
    const birthDate = moment
      .tz(req.body.birthDate, 'MM/DD/YYYY', 'America/New_York')
      .toDate();
    let user_info = await User.create({
      fullName: req.body.fullName,
      birthDate,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      userid: req.user.id,
      companyName: req.body.companyName,
    });
    const userData = { ...req.user._doc };
    console.log(
      '............................................................................................................................................................................'
    );
    console.log({ userData });
    await new Email(req.user).sendWelcome();
    return createSendToken({ userData, user_info }, 201, req, res);
  } else if (req.user.role === 'subcarrier') {
    const birthDate = moment
      .tz(req.body.birthDate, 'MM/DD/YYYY', 'America/New_York')
      .toDate();
    const user_info = await User.create({
      fullName: req.body.fullName,
      birthDate,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      userid: req.user.id,
    });
    const encryptedCompany_id = crypto
      .createHash('sha256')
      .update(req.body.group_id)
      .digest('hex');

    console.log(encryptedCompany_id);
    const team = await Booker.findOneAndUpdate(
      { group_id: encryptedCompany_id },
      { $push: { friends: req.user.id } }
    );

    if (!team) {
      await User.findByIdAndDelete(user_info._id);
      await Authentication.findByIdAndDelete(req.user.id);
      return next(new AppError('There is No Team with this id'), 404);
    }
    const userData = { ...req.user._doc };
    // await new Email(req.user).sendWelcome();
    // Create and send a JWT token and respond with user data
    return createSendToken({ userData, user_info }, 201, req, res);
  } else if (req.user.role === 'company' || req.user.role === 'teamlead') {
    console.log(req.body);
    if (req.body.password != req.body.passwordConfirm) {
      return next(new AppError('Password confirm do not match.', 400));
    }
    console.log(req.body);
    const group_id = Math.floor(10000000 + Math.random() * 90000000).toString();

    if (!req.body.groupName || !req.body.address || !req.body.phoneNumber) {
      return next(new AppError('The body of request not completed.'), 400);
    }
    if (req.body.birthDate) {
      req.body.birthDate = moment
        .tz(req.body.birthDate, 'MM/DD/YYYY', 'America/New_York')
        .toDate();
    }

    const encryptedCompany_id = crypto
      .createHash('sha256')
      .update(group_id)
      .digest('hex');
    req.body.group_id = encryptedCompany_id;
    req.body.userid = req.user._id;
    const user_info = await Booker.create(req.body);

    await new Email(req.user, group_id).sendTeamId();
    const userData = { ...req.user._doc };
    return createSendToken({ userData, user_info }, 201, req, res);
  }
});

exports.passwordReset = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashedToken);
  const user = await Authentication.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  //2) if token has not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has been expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password Updated Successfully.',
  });
});
