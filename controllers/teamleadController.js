const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 
const AppError = require('../utils/appError'); 
const catchAsync = require('../utils/catchAsync'); 
const Team = require('../models/teamleadModel');

// // Function to sign a JSON Web Token (JWT) with user ID
// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// // Function to create and send a JWT token in a cookie and respond with user data
// const createSendToken = (team, statusCode, req, res) => {
//   const token = signToken(team._id);

//   // Define cookie options
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
//   };

//   // Set the JWT token in a cookie
//   res.cookie('jwt', token, cookieOptions);

//   // Remove the password from the Team object before sending it to the client
//   team.password = undefined;

//   // Respond with the JWT token and Team data
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       team,
//     },
//   });
// };

// Controller function for Team signup
// exports.signup = catchAsync(async (req, res, next) => {
//   // Create a new Team based on request data
//   const newTeam = await Team.create({
//     fullName: req.body.fullName,
//     team_id: req.body.team_id,
//     password: req.body.password,
//     address: req.body.address,
//     email: req.body.email,
//     passwordConfirm: req.body.passwordConfirm,
//     phoneNumber: req.body.phoneNumber,
//     teamName: req.body.teamName,
//   });

//   // Create and send a JWT token and respond with Team data
//   createSendToken(newTeam, 201, req, res);
// });

// exports.login = catchAsync(async (req, res, next) => {
//   // Check if email and password are provided in the request body
//   if (!req.body.password || !req.body.email) {
//     return next(new AppError('Please provide us by email and password', 400));
//   }

//   // Find a user by their username, including the password
//   const team = await Team.findOne({ email: req.body.email }).select(
//     '+password'
//   );

//   // Check if the user exists and the provided password is correct
//   if (
//     !team ||
//     !(await team.correctPassword(req.body.password, team.password))
//   ) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   // Generate a new JWT token for the user
//   team.hashToken = signToken(team._id);
//   await team.save({ validateBeforeSave: false });

//   // Create and send a JWT token and respond with team data
//   createSendToken(team, 200, req, res);
// });

// exports.logout = catchAsync(async (req, res, next) => {
//   const team = await Team.findById(req.team.id);

//   if (!team) {
//     return next(new AppError('There is no team with this id.', 404));
//   }

//   team.hashToken = undefined;
//   await team.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: 'success',
//   });
// });

// // Middleware function to protect routes (check if Team is authenticated)
// exports.protect = catchAsync(async (req, res, next) => {
//   let token;

//   // Check if the token is included in the request headers or cookies
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }
//   // If no token is found, return an error
//   if (!token) {
//     return next(
//       new AppError('You Are Not Logged In Please Log In To Get Access', 401)
//     );
//   }

//   // Verify the token and get the decoded user ID
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//   // Find the Team associated with the token
//   const freshTeam = await Team.findById(decoded.id);

//   // If the Team doesn't exist, return an error
//   if (!freshTeam) {
//     return next(
//       new AppError(
//         'The Team belonging to this token does not no longer exist.',
//         404
//       )
//     );
//   }
//   if (freshTeam.hashToken != token) {
//     return next(
//       new AppError(
//         'The Session is Expired Or logged in another device. Please Login Again.',
//         400
//       )
//     );
//   }

//   // Set the Team data in the request object and response locals
//   req.team = freshTeam;
//   res.locals.team = freshTeam;

//   // Move to the next middleware
//   next();
// });
