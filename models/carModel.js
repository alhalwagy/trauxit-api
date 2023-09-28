/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         carrierId:
 *           type: string
 *           description: The ID of the carrier associated with the car (reference to User model).
 *         USDot:
 *           type: number
 *           description: USDot number of the car (required and unique).
 *         type:
 *           type: string
 *           description: Type of the car (required).
 *         maxWeight:
 *           type: number
 *           description: Maximum weight of the car (required).
 *       required:
 *         - USDot
 *         - type
 *         - maxWeight
 */

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
