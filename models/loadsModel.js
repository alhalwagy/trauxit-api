/**
 * @swagger
 * components:
 *   schemas:
 *     Loads:
 *       type: object
 *       properties:
 *         idShipper:
 *           type: string
 *           description: The ID of the Shipper who owns the load (reference to User model).
 *         idCarrier:
 *           type: string
 *           description: The ID of the Carrier assigned to the load (reference to User model).
 *         typeLoads:
 *           type: string
 *           description: Type of the load (required).
 *         nameLoads:
 *           type: string
 *           description: Name of the load (required).
 *         Weight:
 *           type: number
 *           description: Weight of the load (required).
 *         status:
 *           type: string
 *           enum:
 *             - available
 *             - inroads
 *             - canceled
 *             - inprogress
 *             - Booked
 *             - completed
 *             - inchecksp
 *           default: inprogress
 *           description: |
 *             Status of the load (required, default: inprogress).
 *         priceLoads:
 *           type: number
 *           description: Price of the load.
 *         description:
 *           type: string
 *           description: Description of the load.
 *         PickupLocation:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum:
 *                 - Point
 *               default: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *             address:
 *               type: string
 *             description:
 *               type: string
 *           description: Pickup location information.
 *         DropoutLocation:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum:
 *                 - Point
 *               default: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *             address:
 *               type: string
 *             description:
 *               type: string
 *           description: Dropout location information.
 *         shipmentDistance:
 *           type: number
 *           description: Shipment distance.
 *       required:
 *         - typeLoads
 *         - nameLoads
 *         - Weight
 *         - status
 *       example:
 *         idShipper: "5f8b86a67fd16f6d18f8a5b5"
 *         typeLoads: "Cargo"
 *         nameLoads: "Cargo Load 1"
 *         Weight: 5000
 *         status: "available"
 *         priceLoads: 1500
 *         description: "Cargo Load Description"
 *         PickupLocation:
 *           type: "Point"
 *           coordinates: [34.567, -87.123]
 *           address: "123 Main St, City"
 *           description: "Pickup Location Description"
 *         DropoutLocation:
 *           type: "Point"
 *           coordinates: [34.789, -87.456]
 *           address: "456 Elm St, City"
 *           description: "Dropout Location Description"
 *         shipmentDistance: 150
 */

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
