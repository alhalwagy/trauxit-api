const mongoose = require('mongoose');

// Define the schema
const paymentShipperSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_shipper: { type: Number, required: true },
  method_payment: { type: String, enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'], required: true },
  payment_info: { type: String, required: true },
  type: { type: String, enum: ['One-Time', 'Recurring'], required: true },
});

// Create the model
const PaymentShipper = mongoose.model('PaymentShipper', paymentShipperSchema);

module.exports = PaymentShipper;
