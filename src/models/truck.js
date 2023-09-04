const mongoose = require('mongoose');

// Define the schema
const truckSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_carrier: { type: Number, required: true },
  US_DOT: { type: Number, required: true },
  type: { type: String, required: true },
  maxsize: { type: Number, required: true },
});

// Create the model
const Truck = mongoose.model('Truck', truckSchema);

module.exports = Truck;
