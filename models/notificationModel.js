

const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema(
  {
    idShipper: {
      type: mongoose.Schema.ObjectId, // Store as ObjectId
      ref: 'User', // Reference to the User model
      validate: {
        validator: async function (shipper) {
          // Check if a User with the given id exists
          const check = await mongoose.model('User').findById(shipper);
          return check;
        },
        message: 'There is no Shipper with this name or Id',
      },
    },

    // Reference to the Carrier (User) assigned to the load
    idCarrier: {
      type: mongoose.Schema.ObjectId, // Store as ObjectId
      ref: 'User',
      validate: {
        validator: async function (carrier) {
          // Check if a User with the given id exists
          const check = await mongoose.model('User').findById(carrier);
          return check;
        },
        message: 'There is no Carrier with this name or Id',
      }, // Reference to the User model
    },
    title: {
      type: String,
      enum: ['error', 'success', 'info'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isAll: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      required: [true, 'Notification must have a content in it.'],
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

const Notify = mongoose.model('Notify', notifySchema);

module.exports = Notify;
