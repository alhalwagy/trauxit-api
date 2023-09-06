const Loads = require('../models/loadsModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createLoad = catchAsync(async (req, res, next) => {
  if (req.user) {
    const idShipper = req.user.id;
    req.body.idShipper = idShipper;
    req.body.status = 'inprogress';
    const load = await Loads.create(req.body);
    await load.populate({
      path: 'idShipper',
      select: 'fullName userName role address companyName',
    });
    return res.status(200).json({
      status: 'success',
      data: {
        load,
      },
    });
  }

  if (req.admin) {
    console.log(req.body.shipperName);
    const idShipper = await User.findOne({ userName: req.body.shipperName });

    req.body.idShipper = idShipper.id;
    const load = await Loads.create(req.body);
    await load.populate({
      path: 'idShipper',
      select: 'fullName userName role address companyName',
    });
    res.status(201).json({
      status: 'success',
      data: {
        load,
      },
    });
  }
});

exports.getLoadsForShipper = catchAsync(async (req, res, next) => {
  const loads = await Loads.find({ idShipper: req.user.id });
  if (loads.length === 0) {
    return next(new AppError('There is no loads for specified shipper.', 404));
  }
  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

exports.getLoadsForCarrier = catchAsync(async (req, res, next) => {
  const loads = await Loads.find({ status: 'available' }).populate({
    path: 'idShipper',
    select: 'fullName userName role address companyName',
  });

  if (loads.length === 0) {
    return next(new AppError('There is no loads available.', 404));
  }
  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

exports.bookingLoads = catchAsync(async (req, res, next) => {
  const loadCheck = (await Loads.findById(req.params.id)).status;
  if (loadCheck === 'Booked') {
    return next(new AppError('This Load Booked'));
  }
  const load = await Loads.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Booked',
      idCarrier: req.user.id,
    },
    { new: true, runValidators: false }
  );

  if (!load) {
    return next(new AppError('There is no loads for specified Id.', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});
