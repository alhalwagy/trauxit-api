/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         idAdmin:
 *           type: string
 *           description: The ID of the admin associated with the ticket.
 *         idSupport:
 *           type: string
 *           description: The ID of the support admin associated with the ticket.
 *         type:
 *           type: string
 *           enum:
 *             - technical
 *             - not-technical
 *           description: The type of the ticket.
 *         media:
 *           type: string
 *           description: Media associated with the ticket.
 *         content_ticket:
 *           type: string
 *           description: The content of the ticket.
 *         idUser:
 *           type: string
 *           description: The ID of the user associated with the ticket.
 *         isSolved:
 *           type: boolean
 *           description: Indicates whether the ticket is solved or not.
 *         supporter_reply:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of supporter replies.
 *         admin_reply:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of admin replies.
 *         user_reply:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of user replies.
 *       required:
 *         - type
 *         - content_ticket
 *         - idUser
 *         - isSolved
 */

const mongoose = require('mongoose');

// Define the schema
const ticketSchema = new mongoose.Schema(
  {
    idAdmin: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin',
      validate: {
        validator: async function (admin) {
          // Check if a Admin with the given id exists
          const check = await mongoose.model('Admin').findById(admin);
          return check;
        },
        message: 'There is no Admin with this name or Id',
      },
    },
    idSupport: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin',
      validate: {
        validator: async function (support) {
          // Check if a Admin with the given id exists
          const check = await mongoose.model('Admin').findById(support);
          return check;
        },
        message: 'There is no Support with this name or Id',
      },
    },
    type: {
      type: String,
      enum: ['technical', 'not-technical'],
      default: 'not-technical',
      required: [true, 'Ticket Must Belong To Type.'],
    },
    media: String,
    content_ticket: {
      type: String,
      required: [true, 'Ticket Must have content in it.'],
    },
    idUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      validate: {
        validator: async function (user) {
          // Check if a Admin with the given id exists
          const check = await mongoose.model('User').findById(user);
          return check;
        },
        message: 'There is no User with this name or Id',
      },
      required: [true, 'Ticket Must Belong To User.'],
    },
    isSolved: {
      type: Boolean,
      default: false,
      required: [true, 'Ticket Must Be Solved Or Not.'],
    },
    supporter_reply: [String],
    admin_reply: [String],
    user_reply: [String],
  },
  {
    timestamps: true,
  }
);

// Create the model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
