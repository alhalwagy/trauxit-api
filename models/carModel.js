

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    carrierId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    USDot: {
      type: Number,
      required: [true, 'USDot is Required'],
      unique: true,
    },
    type: {
      type: String,
      required: [true, 'Type is Required'],
    },
    maxWeight: {
      type: Number,
    },
    lisence: {
      type: Number,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
