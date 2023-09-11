const mongoose = require('mongoose');
const User = require('./userModel'); // Import the User model

// Define a schema for the Loads model
const loadsSchema = new mongoose.Schema(
  {
    // Reference to the Shipper (User) who owns the load
    idShipper: {
      type: mongoose.Schema.ObjectId, // Store as ObjectId
      ref: 'User', // Reference to the User model
      required: [true, 'Load must belong to Shipper'],
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
      ref: 'User', // Reference to the User model
    },

    typeLoads: { type: String, required: [true, 'Load must belong to Type.'] }, // Type of the load
    nameLoads: { type: String, required: [true, 'Load must Have a Name.'] }, // Name of the load
    Weight: {
      type: Number,
      required: [true, 'Load must Have a Right Weight.'],
    }, // Weight of the load
    status: {
      type: String,
      enum: [
        'available',
        'inroads',
        'canceled',
        'inprogress',
        'Booked',
        'completed',
        'inchecksp',
      ],
      required: [true, 'Load must Have a Status At all time.'], // Status of the load
      default: 'inprogress',
    },
    priceLoads: { type: Number }, // Price of the load
    description: { type: String }, // Description of the load
    PickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    DropoutLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    shipmentDistance: Number,
  },
  {
    timestamps: true,
    toJSON: { victuals: true },
    toObject: { victuals: true },
  }
);

loadsSchema.virtual('shipper', {
  ref: 'User',
  foreignField: 'idShipper',
  localField: '_id',
});

loadsSchema.index({ PickupLocation: '2dsphere' });

// Create a Loads model using the loadsSchema
const Loads = mongoose.model('Loads', loadsSchema);

module.exports = Loads; // Export the Loads model
