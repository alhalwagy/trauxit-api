const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    carrierId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Authentication',
      validate: {
        validator: async function (carrier) {
          // Check if a User with the given id exists
          const check = await mongoose
            .model('Authentication')
            .findById(carrier);
          return check;
        },
        message: 'There is no Carrier with this name or Id',
      },
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
    idBooker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booker', // 'booker' is the name of the referenced collection
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
