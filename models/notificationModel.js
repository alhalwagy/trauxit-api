/**
 * @swagger
 * components:
 *   schemas:
 *     Notify:
 *       type: object
 *       properties:
 *         idShipper:
 *           type: string
 *           description: The ID of the Shipper associated with the notification (reference to User model).
 *         idCarrier:
 *           type: string
 *           description: The ID of the Carrier associated with the notification (reference to User model).
 *         title:
 *           type: string
 *           enum:
 *             - error
 *             - success
 *             - info
 *           default: info
 *           description: The title of the notification, which can be 'error,' 'success,' or 'info' (default is 'info').
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: A boolean flag indicating whether the notification has been read (default is false).
 *         isAll:
 *           type: boolean
 *           default: false
 *           description: A boolean flag indicating whether the notification is for all users (default is false).
 *         text:
 *           type: string
 *           description: The content of the notification (required).
 *         image:
 *           type: string
 *           description: URL or path to an image associated with the notification.
 *       required:
 *         - text
 *       example:
 *         idShipper: "5f8b86a67fd16f6d18f8a5b5"
 *         idCarrier: "5f8b86a67fd16f6d18f8a5c6"
 *         title: "info"
 *         isRead: false
 *         isAll: false
 *         text: "This is an example notification."
 *         image: "https://example.com/notification-image.jpg"
 */

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
