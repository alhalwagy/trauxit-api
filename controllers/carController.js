// Import necessary modules and dependencies
const Car = require('../models/carModel'); // Import the Car model
const AppError = require('../utils/appError'); // Import an error handling utility
const catchAsync = require('../utils/catchAsync'); // Import an async error handling utility

// Define the controller function to create a new car
exports.createCar = catchAsync(async (req, res, nex) => {
  // Set the carrierId in the request body to the authenticated user's ID
  req.body.carrierId = req.user.id;

  // Create a new car object based on the request body data
  const newCar = await Car.create(req.body);

  // Populate the 'carrierId' field in the new car with additional user data
  await newCar.populate({
    path: 'carrierId',
    select: 'fullName userName role address companyName',
  });

  // Send a JSON response with a 201 (Created) status code
  res.status(201).json({
    status: 'success',
    data: {
      newCar, // Include the newly created car data in the response
    },
  });
});
