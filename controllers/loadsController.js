const Loads = require('../models/loadsModel');
const Shipper = require('../models/shipperModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createLoad = catchAsync(async (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role === 'shipper') {
    const idShipper = req.user.id;
    req.body.idShipper = idShipper;
    const newLoad = await Loads.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        newLoad,
      },
    });
  }

  if (req.admin.role === 'admin') {
    const idShipper = await Shipper.findOne({ userName: req.body.shipperName });
    req.body.idShipper = idShipper._id;
    const newLoad = await Loads.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        newLoad,
      },
    });
  }
});
