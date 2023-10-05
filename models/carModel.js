const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    carrierId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      validate: {
        validator: async function (carrier) {
          // Check if a User with the given id exists
          const check = await mongoose.model('User').findById(carrier);
          return check;
        },
        message: 'There is no Shipper with this name or Id',
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
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
