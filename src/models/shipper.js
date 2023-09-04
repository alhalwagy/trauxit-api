const mongoose = require('mongoose');

// Define the schema
const shipperSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fullname: { type: String, required: true },
  ID_card_number: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  sessiontoken: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  location_address: { type: String, required: true },
});

// Create the model
const Shipper = mongoose.model('Shipper', shipperSchema);

module.exports = Shipper;
