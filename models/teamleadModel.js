const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const teamSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Team Must Have A Full Name.'], // Full name of the user, required field
    },
    team_id: {
      type: String,
      required: [true, 'Team id is required.'],
      unique: true, // Ensures that each ID card number is unique in the database
    },
    password: {
      type: String,
      required: [true, 'Team must have a Password.'], // Password of the user, required field
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
    teamName: {
      type: String,
      required: [true, 'Team name is required.'],
    },
    address: { type: String, required: [true, 'Address is required.'] }, // Address field, required
    rating: Number, // User's rating
    // To check the given token same as database token
    hashToken: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true, // Store a lowercase slug based on the username
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate a slug based on the username
teamSchema.pre('save', function (next) {
  this.slug = slugify(this.fullName);
  next();
});

// Post-save middleware to generate and save a JWT hash token
teamSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

// Pre-save middleware to hash the password
teamSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined; // Clear the passwordConfirm field
  next();
});

// Set toJSON options to remove the password field from JSON responses
teamSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

// Set toJSON options to remove the hashToken field from JSON responses
teamSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

// Method to compare a candidate password with the user's hashed password
teamSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
