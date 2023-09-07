// Import necessary modules and models
const AppError = require('../utils/appError'); // Import an error handling utility
const catchAsync = require('../utils/catchAsync'); // Import an async error handling utility
const Review = require('../models/reviewModel'); // Import the Review model
const Loads = require('../models/loadsModel'); // Import the Loads model

// Controller function to add a rating (review) to a carrier
exports.addRatingToCarrier = catchAsync(async (req, res, next) => {
  // Find a load associated with the specified carrier ID
  const load = await Loads.findOne({ idCarrier: req.params.carrierId });

  // If no load is found for the carrier, return a 404 error
  if (!load) {
    return next(new AppError('There is no Carrier with this id.', 404));
  }

  // Set the 'carriedId' and 'shipperId' in the request body based on the load's data
  req.body.carriedId = load.idCarrier;
  req.body.shipperId = load.idShipper;

  // Create a new review using the request body data
  const newReview = await Review.create(req.body);

  // Populate the 'carriedId' field in the new review with additional user data
  await newReview.populate({
    path: 'carriedId',
    select: 'fullName userName role address companyName',
  });

  // Send a JSON response with a 201 (Created) status code and the newly created review data
  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
