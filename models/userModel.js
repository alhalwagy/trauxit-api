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

// Define a schema for the User model
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'User Must Have A Full Name.'], // Full name of the user, required field
    },
    ID_card_number: {
      type: Number,
      required: true,
      unique: true, // Ensures that each ID card number is unique in the database
    },
    userName: {
      type: String,
      required: [true, 'User must have a unique user name.'], // User name of the user, required field
      unique: true, // Ensures that each username is unique in the database
    },
    password: {
      type: String,
      required: [true, 'User must have a Password.'], // Password of the user, required field
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
      type: Date,
      required: [true, 'User must have a birth Date.'], // Birth date of the user, required field
    },
    companyName: {
      type: String,
    },
    address: { type: String, required: [true, 'Address is required.'] }, // Address field, required
    location_address: String,
    rating: Number, // User's rating

    role: {
      required: [true, 'User must have a role'], // User's role, required field
      type: String,
      enum: ['shipper', 'carrier'], // User's role is limited to specific values
    },

    hashToken: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true, // Store a lowercase slug based on the username
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps to the document
  }
);

// Pre-save middleware to generate a slug based on the username
userSchema.pre('save', function (next) {
  this.slug = slugify(this.userName);
  next();
});

// Post-save middleware to generate and save a JWT hash token
userSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

// Pre-save middleware to hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined; // Clear the passwordConfirm field
  next();
});

// Set toJSON options to remove the password field from JSON responses
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

// Set toJSON options to remove the hashToken field from JSON responses
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

// Method to compare a candidate password with the user's hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Create a User model using the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model
