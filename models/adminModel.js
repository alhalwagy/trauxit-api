const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const validator = require('validator');

// Function to sign a JSON Web Token (JWT) with user ID
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
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

    slug: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps to the document
  }
);

adminSchema.pre('save', function (next) {
  this.slug = slugify(this.userName);
  next();
});

// Post-save middleware to generate and save a JWT hash token
adminSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

// Pre-save middleware to hash the password
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined; // Clear the passwordConfirm field
  next();
});

// Set toJSON options to remove the password field from JSON responses
adminSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

// Set toJSON options to remove the hashToken field from JSON responses
adminSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

// Method to compare a candidate password with the user's hashed password
adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Create an Admin model using the adminSchema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; // Export the Admin model
