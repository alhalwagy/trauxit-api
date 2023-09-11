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
  req.load = load;
  next();
  // Send a JSON response with the updated load data
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     load,
  //   },
  // });
});

exports.getLoadWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const raduis = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('there is no latitude or longitude in request!!', 400));
  }

  const loads = await Loads.find({
    PickupLocation: { $geoWithin: { $centerSphere: [[lng, lat], raduis] } },
  });

  // console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    result: loads.length,
    data: {
      loads,
    },
  });
});
//Get Distances between all points in DB and Specified Point
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;
  if (!lat || !lng) {
    next(new AppError('there is no latitude or longitude in request!!', 400));
  }

  const distances = await Loads.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        nameLoads: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});

// exports.updateLoadsToAvailable = catchAsync(async (req, res, next) => {
//   const load = await Loads.findByIdAndUpdate(
//     req.params.id,
//     {
//       status: 'available',
//     },
//     {
//       new: true,
//       runValidators: false,
//     }
//   );

//   res.status(200).json({
//     status: 'success',
//     data: {
//       load,
//     },
//   });
// });

//Update Load Status To Available
exports.updateLoadsToAvailable = catchAsync(async (req, res, next) => {
  const load = await Loads.findByIdAndUpdate(
    req.params.id,
    {
      status: 'available',
    },
    {
      new: true,
      runValidators: false,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});

//Update Load Status To In CheckSP
exports.updateLoadsToInchecksp = catchAsync(async (req, res, next) => {
  const load = await Loads.findByIdAndUpdate(
    req.params.id,
    {
      status: 'inchecksp',
      idCarrier: req.user.id,
    },
    {
      new: true,
      runValidators: false,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});

//Update Load Status To On Road

exports.updateLoadsToOnRoad = catchAsync(async (req, res, next) => {
  if (req.user.currentDistance < 1) {
    const load = await Loads.findByIdAndUpdate(
      req.params.id,
      {
        status: 'inroads',
      },
      {
        new: true,
        runValidators: false,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        load,
      },
    });
  } else {
    res.status(400).json({
      status: 'fail',
      message: `You can't update the load to on road. You stile have distance(${req.user.currentDistance}) from it.`,
    });
  }
});

//Update Load Status To canceled
exports.updateLoadsToCanceled = catchAsync(async (req, res, next) => {
  const load = await Loads.findById(req.params.id);

  if (load.idShipper.toString() === req.user.id) {
    console.log(load.idShipper.toString());
    console.log(req.user.id);
    if (load.status === 'available' || load.status === 'inprogress') {
      load.status = 'canceled';
      load.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        data: {
          load,
        },
      });
    } else {
      return next(
        new AppError(
          'You can not update the status of this load right now. because it is in process to cancel it must take a ticket to our supporter. ',
          401
        )
      );
    }
  } else {
    return next(new AppError('This Load is Not for You. ', 401));
  }
});

//Update Load Status To Completed
exports.updateLoadsToCompleted = catchAsync(async (req, res, next) => {
  req.user.currentDistance = 0;
  if (req.user.calculateDistance < 1) {
    const load = await Loads.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
      },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        load,
      },
    });

    req.user.currentDistance = 0;
    await req.user.save({});
    console.log(req.user.currentDistance);
  } else {
    res.status(400).json({
      status: 'fail',
      message: `You can't update the load to on road. You stile have distance(${req.user.currentDistance}) from it.`,
    });
  }
});

//For Admin
exports.getAllLoads = catchAsync(async (req, res, next) => {
  const loads = await Loads.find({});
  if (loads.length === 0) {
    return next(new AppError('No loads available', 404));
  }
  res.status(200).json({
    status: 'success',
    result: loads.length,
    data: {
      loads,
    },
  });
});

//For Admin
exports.updateLoads = catchAsync(async (req, res, next) => {
  const load = await Loads.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });
  if (!load) {
    return next(new AppError('Not Found This Load', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});

//For Admin
exports.getLoad = catchAsync(async (req, res, next) => {
  const load = await Loads.findById(req.params.id);
  if (!load) {
    return next(new AppError('Not Found This Load', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});
//For Admin
exports.deleteLoad = catchAsync(async (req, res, next) => {
  // Check if the load is canceled.
  const checkLoad = await Loads.findById(req.params.id);
  if (!(checkLoad.status === 'canceled')) {
    // Return an error if the load is not canceled.
    return next(
      new AppError('This Load Can not deleted. it is not canceled.', 404)
    );
  }

  // Find the load by ID and delete it.
  const load = await Loads.findByIdAndDelete(req.params.id);
  if (!load) {
    // Return an error if the load is not found.
    return next(new AppError('Not Found This Load', 404));
  }

  // Return a success message.
  res.status(200).json({
    status: 'success',
  });
});
