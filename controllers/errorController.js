// Import the AppError utility
const AppError = require('../utils/appError');

// Define functions to handle specific types of errors
const handleCastErrorDB = (err) => {
  // Create an error message for invalid data type casting
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // Return an AppError with a 400 status code
};

const handleJsonWebTokenError = () =>
  new AppError('Invalid access. Please log in again !', 401); // Return an AppError for invalid JWT token

const handleDuplicateFieldsDB = (err) => {
  // Extract the duplicate value from the error message
  const value = err.errmsg.match(/([^{}]+)(?=\s*}$)/)[0].split(':')[1];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400); // Return an AppError with a 400 status code
};

const handleTokenExpiredError = () =>
  new AppError('Your token has been expired. Please log in again!', 401); // Return an AppError for expired JWT token

const handleValidationErrorDB = (err) => {
  // Extract error messages from validation errors
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400); // Return an AppError with a 400 status code
};

// Define a function to send detailed error responses during development
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // If the error occurred in the API, send a JSON response with error details
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // Otherwise, log the error and handle it according to the development environment
  console.error('ERROR 💥', err);
};

// Define a function to send error responses in a production environment
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // If it's an operational error, send a JSON response with a simplified error message
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Log non-operational errors and send a generic error response
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  if (err.isOperational) {
    // Render a user-friendly error page for operational errors in non-API routes
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  // Render a generic error page for non-operational errors in non-API routes
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
};

// Export a middleware function that handles errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Set a default status code of 500
  err.status = err.status || 'error'; // Set a default status of 'error'

  if (process.env.NODE_ENV === 'development') {
    // In the development environment, send detailed error responses
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // In the production environment, handle specific types of errors and send appropriate responses
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }
};
