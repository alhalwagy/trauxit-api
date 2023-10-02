
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
