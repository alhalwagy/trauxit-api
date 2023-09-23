const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  userName: {
    type: String,
    required: [true, 'user must have a unique user name.'], // User name of the admin, required field
    unique: true, // Ensures that each username is unique in the database
  },
  password: {
    type: String,
    required: [true, 'user must have a Password.'], // Password of the admin, required field
  },
  role: {
    required: [true, 'User must have a role'], // User's role, required field
    type: String,
    enum: ['shipper', 'carrier', 'subcarrier', 'company', 'teamlead'], // User's role is limited to specific values ('shipper','carrier','small-carrier')
  },
  hashToken: {
    type: String,
  },
});

const Authentication = mongoose.model('Authentication', authSchema);

module.exports = Authentication;
