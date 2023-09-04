const mongoose = require('mongoose');

// Define the schema
const ticketSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_admin: { type: Number, required: true },
  id_user: { type: Number, required: true },
  type_ticket: { type: String, required: true },
  content_tickets: { type: String, required: true },
});

// Create the model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
