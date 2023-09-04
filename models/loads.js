const mongoose = require('mongoose');

// Define the schema
const loadsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_shipper: { type: Number, required: true },
  id_carrier: { type: Number},
  type_loads: { type: String, required: true },
  name_loads: { type: String, required: true },
  Pickup_location: { type: String, required: true },
  Dropoff_location: { type: String, required: true },
  Weight: { type: Number, required: true },
  status: { type: String, required: true },
  priceloads: { type: Number, required: true },
  description: { type: String },
});

// Create the model
const Load = mongoose.model('Load', loadsSchema);

module.exports = Load;
