const Car = require('../models/carModel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createCar = catchAsync(async (req, res, nex) => {
  req.body.carrierId = req.user.id;
  const newCar = await Car.create(req.body);
 await newCar.populate({
   path: 'carrierId',
   select: 'fullName userName role address companyName',
 });
  res.status(201).json({
    status: 'success',
    data: {
      newCar,
    },
  });
});
