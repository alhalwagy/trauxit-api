const { promisify } = require('util');
const jwt = require('jsonwebtoken'); // Import JWT for token handling
const crypto = require('crypto');

const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors
const Booker = require('../models/bookerModel');
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
  // Generate a new JWT token for the user
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

// Controller function for user signup
exports.signupUser = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Password confirm do not match password.', 400));
  }
  console.log(req.body);
  // Create a new user based on request data
  const newUser = await User.create({
    role: req.body.role,
    fullName: req.body.fullName,
    userName: req.body.userName,
    password: req.body.password,
    birthDate: req.body.birthDate,
    address: req.body.address,
    email: req.body.email,
  });

  newUser.image = '';
  if (req.body.role === 'subcarrier') {
    if (req.body.company_id) {
      const company = await Booker.findOneAndUpdate(
        { company_id: req.body.company_id },
        { $push: { friends: newUser._id } }
      );

      if (!company) {
        await User.findByIdAndDelete(newUser.id);

        return next(new AppError('There is No Company with this id'), 404);
      }
    } else if (req.body.team_id) {
      const team = await Booker.findOneAndUpdate(
        { team_id: req.body.team_id },
        { $push: { friends: newUser._id } }
      );

      if (!team) {
        await User.findByIdAndDelete(newUser.id);

        return next(new AppError('There is No Team with this id'), 404);
      }
    } else {
      await User.findByIdAndDelete(newUser.id);

      return next(
        new AppError('You Are subCarrier Must belong to team or company', 400)
      );
    }

    await new Email(newUser).sendWelcome();

    // Create and send a JWT token and respond with user data
    return createSendToken(newUser, 201, req, res);
  }
  await new Email(newUser).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

// Controller function for user login
exports.login = catchAsync(async (req, res, next) => {
  // Check if email and password are provided in the request body
  if (!req.body.password || !req.body.email) {
    return next(new AppError('Please provide us by email and password', 400));
  }

  // Find a user by their username, including the password
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user) {
    // Find a Booker by their username, including the password
    const booker = await Booker.findOne({ email: req.body.email }).select(
      '+password'
    );
    if (
      !booker ||
      !(await booker.correctPassword(req.body.password, booker.password))
    ) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Create and send a JWT token and respond with company data
    return createSendToken(booker, 200, req, res);
  }

  // Check if the user exists and the provided password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
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
  //4)check if user changed password after token issued
  // if (freshUser.checkPasswordChanged(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password. Please log in again.', 401)
  //   );
  // }

  // console.log(req.user);
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

exports.logout = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

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
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const booker = await Booker.findOne({ email: req.body.email });

    if (!booker) {
      return next(new AppError('No User Found with this email', 404));
    }

    const randomNum = booker.CreatePasswordResetCode();
    await booker.save({ validateBeforeSave: false });
    console.log(booker.passwordRestExpires);
    console.log('current date', Date.now());
    await new Email(booker, randomNum).sendPasswordReset();

    return res.status(200).json({
      status: 'success',
      message: 'Reset code passed to your mail, Please check your inbox mail',
    });
  }

  const randomNum = user.CreatePasswordResetCode();
  await user.save({ validateBeforeSave: false });

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
  const user = await User.findOne({
    passwordRestCode: hashedResetCode,
    passwordRestExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    const booker = await Booker.findOne({
      passwordRestCode: hashedResetCode,
      passwordRestExpires: { $gt: Date.now() },
    });

    console.log(booker);
    if (!booker) {
      return next(
        new AppError(
          'Invalid password Reset Code, check code from mail again!',
          404
        )
      );
    }
    booker.passwordRestIsused = true;
    booker.passwordRestCode = undefined;
    booker.passwordRestExpires = undefined;
    booker.save({ validateBeforeSave: false });

   return res.status(200).json({
      status: 'success',
    });
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
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const booker = await Booker.findOne({ email: req.body.email });
    if (!booker) {
      return next(new AppError('No user found with this email', 404));
    }
    if (!booker.passwordRestIsused) {
      return next(
        new AppError(
          'Invalid password Reset Code, check code from mail again!',
          404
        )
      );
    }
    booker.password = req.body.password;
    booker.passwordConfirm = req.body.passwordConfirm;
    booker.passwordRestIsused = undefined;
    booker.passwordChangedAt = Date.now();
    await booker.save();
    return res.status(200).json({
      status: 'success',
      data: 'Password Updated !!',
    });
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
