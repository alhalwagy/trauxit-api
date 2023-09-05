const mongoose = require('mongoose');

// Define the schema
const shipperSchema = new mongoose.Schema({
  // id: { type: Number, required: [true, 'Id is required'], unique: true },
  fullName: {
    type: String,
    required: [true, 'Shipper Must Have A Full Name.'],
  },
  ID_card_number: {
    type: Number,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: [true, 'Shipper must have a unique user name.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Shipper must have a Password.'],
  },

  birthDate: {
    type: Date,
    required: [true, 'Shipper must have a birth Date.'],
  },
  companyName: {
    type: String,
    required: [true, 'Company Name is required.'],
  },
  address: { type: String, required: [true, 'Address is required.'] },
  location_address: String,
});

// Create the model
const Shipper = mongoose.model('Shipper', shipperSchema);

module.exports = Shipper;
