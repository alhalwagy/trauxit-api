const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Loads = require('../models/loadsModel');

exports.addRatingToCarrier = catchAsync(async (req, res, next) => {
  const load = await Loads.findOne({ idCarrier: req.params.carrierId });
  if (!load) {
    return next(new AppError('there is no Carrier with this id.', 404));
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
