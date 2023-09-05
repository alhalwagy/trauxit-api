const mongoose = require('mongoose');

// Define a schema for the Admin model
const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Admin Must Have A Full Name.'], // Full name of the admin, required field
    },
    email: {
      type: String,
      required: [true, 'Email IS Required.'], // Email of the admin, required field
      unique: true, // Ensures that each email is unique in the database
    },
    userName: {
      type: String,
      required: [true, 'Admin must have a unique user name.'], // User name of the admin, required field
      unique: true, // Ensures that each username is unique in the database
    },
    password: {
      type: String,
      required: [true, 'Admin must have a Password.'], // Password of the admin, required field
    },
    passwordConfirm: {
      type: String,
      required: [
        true,
        'Confirm Password is required. Please enter your confirm password', // Confirm password field, required with custom error message
      ],
      validate: {
        validator: function (passwordConfirm) {
          // Custom validation function to check if passwordConfirm matches password
          return passwordConfirm === this.password;
        },
        message: "Confirm password doesn't match password ", // Error message if validation fails
      },
    },

    birthDate: {
      type: Date, // Birth date of the admin (optional)
    },
    role: {
      type: String,
      enum: ['head admin', 'admin', 'supporter'], // Role of the admin, limited to specific values
    },
    hashToken: String, // A field to store a token (e.g., for authentication)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps to the document
  }
);

// Create an Admin model using the adminSchema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; // Export the Admin model
