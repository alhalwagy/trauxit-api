const mongoose = require('mongoose');

const User = require('./userModel');

const loadsSchema = new mongoose.Schema({
  idShipper: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Load must belong to Shipper'],
    validate: {
      validator: async function (shipper) {
        const check = await mongoose.model('User').findById(shipper);
        return check;
      },
      message: 'There is no Shipper with this name or Id',
    },
  },
  idCarrier: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Load must belong to Carrier'],
    validate: {
      validator: async function (carrier) {
        const check = await mongoose.model('User').findById(carrier);
        return check;
      },
      message: 'There is no Carrier with this name or Id',
    },
  },
  typeLoads: { type: String, required: [true, 'Load must belong to Type.'] },
  nameLoads: { type: String, required: [true, 'Load must Have a Name.'] },
  PickupLocation: {
    type: String,
    required: [true, 'Load must Have a Address Pickup.'],
  },
  DropoutLocation: {
    type: String,
    required: [true, 'Load must Have a Address Dropout.'],
  },
  Weight: { type: String, required: [true, 'Load must Have a Right Weight.'] },
  status: {
    type: String,
    required: [true, 'Load must Have a Status At all time.'],
  },
  priceLoads: { type: Number, required: [true, 'Load must Have a Name.'] },
  description: { type: String },
});

const Loads = mongoose.model('Loads', loadsSchema);
module.exports = Loads;
