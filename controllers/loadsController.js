// Import necessary models and modules
const Loads = require('../models/loadsModel'); // Import the Loads model
const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import an error handling utility
const catchAsync = require('../utils/catchAsync'); // Import an async error handling utility

// Controller function to create a new load
exports.createLoad = catchAsync(async (req, res, next) => {
  // Check if the request is made by a user (shipper)
  if (req.user) {
    // Associate the load with the shipper (user) and set its status to 'inprogress'
    const idShipper = req.user.id;
    req.body.idShipper = idShipper;
    req.body.status = 'inprogress';
    const load = await Loads.create(req.body);

    // Populate the 'idShipper' field in the load with additional user data
    await load.populate({
      path: 'idShipper',
      select: 'fullName userName role address companyName',
    });

    // Send a JSON response with the created load data
    return res.status(200).json({
      status: 'success',
      data: {
        load,
      },
    });
  }

  // If the request is made by an admin
  if (req.admin) {
    console.log(req.body.shipperName);

    // Find the user (shipper) based on the specified shipperName
    const idShipper = await User.findOne({ userName: req.body.shipperName });

    // Associate the load with the found shipper
    req.body.idShipper = idShipper.id;
    const load = await Loads.create(req.body);

    // Populate the 'idShipper' field in the load with additional user data
    await load.populate({
      path: 'idShipper',
      select: 'fullName userName role address companyName',
    });

    // Send a JSON response with the created load data
    res.status(201).json({
      status: 'success',
      data: {
        load,
      },
    });
  }
});

// Controller function to get loads for a shipper
exports.getLoadsForShipper = catchAsync(async (req, res, next) => {
  // Find all loads associated with the requesting shipper (user)
  const loads = await Loads.find({ idShipper: req.user.id });

  // If no loads are found, return a 404 error
  if (loads.length === 0) {
    return next(new AppError('There is no loads for specified shipper.', 404));
  }

  // Send a JSON response with the loaded loads
  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

// Controller function to get available loads for a carrier
exports.getLoadsForCarrier = catchAsync(async (req, res, next) => {
  // Find all loads with status 'available' and populate 'idShipper' field with user data
  const loads = await Loads.find({ status: 'available' }).populate({
    path: 'idShipper',
    select: 'fullName userName role address companyName',
  });

  // If no available loads are found, return a 404 error
  if (loads.length === 0) {
    return next(new AppError('There is no loads available.', 404));
  }

  // Send a JSON response with the loaded available loads
  res.status(200).json({
    status: 'success',
    length: loads.length,
    data: {
      loads,
    },
  });
});

// Controller function to book a load for a carrier
exports.bookingLoads = catchAsync(async (req, res, next) => {
  // Check if the load's status is 'Booked'
  const loadCheck = (await Loads.findById(req.params.id)).status;

  // If it's already booked, return an error
  if (loadCheck === 'Booked') {
    return next(new AppError('This Load Booked'));
  }

  // Update the load's status to 'Booked' and associate it with the carrier
  const load = await Loads.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Booked',
      idCarrier: req.user.id,
    },
    { new: true, runValidators: false }
  );

  // If the specified load ID is not found, return a 404 error
  if (!load) {
    return next(new AppError('There is no loads for specified Id.', 404));
  }

  // Send a JSON response with the updated load data
  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});
