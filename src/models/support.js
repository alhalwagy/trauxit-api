const mongoose = require('mongoose');

// Define the schema
const supportSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
});

// Define methods
supportSchema.methods.view_tickets = function () {
  // Logic to view tickets
  console.log(`${this.fullname} is viewing tickets.`);
  // Replace the console.log with actual logic to view tickets
};

supportSchema.methods.reply_tickets = function () {
  // Logic to reply to tickets
  console.log(`${this.fullname} is replying to tickets.`);
  // Replace the console.log with actual logic to reply to tickets
};

supportSchema.methods.change_status_tickets = function () {
  // Logic to change status of tickets
  console.log(`${this.fullname} is changing status of tickets.`);
  // Replace the console.log with actual logic to change status of tickets
};

// Create the model
const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
