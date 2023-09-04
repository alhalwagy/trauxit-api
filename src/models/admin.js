const mongoose = require('mongoose');

// Define the schema
const adminSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
});

// Create the model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
