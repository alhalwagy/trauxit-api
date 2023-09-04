const mongoose = require('mongoose');

// Define the schema
const ratingCarrierSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_shipper: { type: Number, required: true },
  id_carrier: { type: Number, required: true },
  rating: { type: Number },
  comment: { type: String },
  date: { type: Date },
});

// Create the model
const RatingCarrier = mongoose.model('RatingCarrier', ratingCarrierSchema);

module.exports = RatingCarrier;
