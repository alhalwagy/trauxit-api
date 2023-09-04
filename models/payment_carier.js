const mongoose = require('mongoose');

// Define the schema
const paymentCarrierSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_carrier: { type: Number, required: true },
  method_payment: { type: String, enum: ['Bank Transfer', 'PayPal', 'Check'], required: true },
  payment_info: { type: String, required: true },
  type: { type: String, enum: ['One-Time', 'Recurring'], required: true },
});

// Create the model
const PaymentCarrier = mongoose.model('PaymentCarrier', paymentCarrierSchema);

module.exports = PaymentCarrier;
