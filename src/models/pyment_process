const mongoose = require('mongoose');

// Define the schema
const paymentProcessSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_payment_carrier: { type: Number, required: true },
  id_payment_shipper: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
});

// Create the model
const PaymentProcess = mongoose.model('PaymentProcess', paymentProcessSchema);

module.exports = PaymentProcess;
