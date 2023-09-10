const Loads = require('../models/loadsModel');
const Notify = require('../models/notificationModel');
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors



//Create Notification and return Response
exports.createNotification = catchAsync(async (req, res, next) => {
  const load = req.load;
  const { idShipper, idCarrier } = load;
  const text =
    'This Load is booked From Carrier. Open Notification to see more details';
  const newNotify = await Notify.create({
    idCarrier,
    idShipper,
    text,
  });


  res.status(200).json({
    status: 'success',
    data: {
      load,
    },
  });
});
