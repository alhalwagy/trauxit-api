const bcrypt = require('bcrypt');

const AppError = require('../utils/appError'); // Import custom error handling utility
const User = require('../models/userModel'); // Import the User model
const catchAsync = require('../utils/catchAsync');

exports.getAllShippers = catchAsync(async(req,res,next)=>{
    const shippers = await User.find({ role: 'shipper' });
    if (shippers.length === 0) {
      return next(new AppError('No shippers available', 404));
    }
    res.status(200).json({
      status: 'success',
      result: shippers.length,
      data: {
        shippers,
      },
    });
})