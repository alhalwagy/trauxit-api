// Import necessary modules and models
const AppError = require('../utils/appError'); // Import an error handling utility
const catchAsync = require('../utils/catchAsync'); // Import an async error handling utility
const Review = require('../models/reviewModel'); // Import the Review model
const Loads = require('../models/loadsModel'); // Import the Loads model

// Controller function to add a rating (review) to a carrier
exports.addRatingToCarrier = catchAsync(async (req, res, next) => {
  const load = await Loads.findOne({ idCarrier: req.params.carrierId });

  if (!load) {
    return next(new AppError('There is no Carrier with this id.', 404));
  }

  req.body.carriedId = load.idCarrier;
  req.body.shipperId = load.idShipper;

  const newReview = await Review.create(req.body);

  await newReview.populate({
    path: 'carriedId',
    select: 'fullName userName role address companyName',
  });

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
