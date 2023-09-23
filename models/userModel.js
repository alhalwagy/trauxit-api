/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: The full name of the user.
 *         ID_card_number:
 *           type: string
 *           description: The ID card number of the user.
 *         userName:
 *           type: string
 *           description: The username of the user.
 *         password:
 *           type: string
 *           description: The user's password.
 *         birthDate:
 *           type: string
 *           format: date
 *           description: The birth date of the user.
 *         address:
 *           type: string
 *           description: The address of the user.
 *         rating:
 *           type: number
 *           description: The user's rating.
 *         role:
 *           type: string
 *           enum:
 *             - shipper
 *             - carrier
 *             - subcarrier
 *             - companycarrier
 *           description: The role of the user.
 *         currentDistance:
 *           type: number
 *           description: The current distance of the user.
 *         currentLocation:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               default: Point
 *               description: The type of location.
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: The coordinates of the location.
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user.
 *         phoneNumber:
 *           type: string
 *           pattern: "^(?:\\+20|0)(1\\d{9}|[2-5]\\d{7})$"
 *           description: The phone number of the user.
 *         passwordChangedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user's password was last changed.
 *       required:
 *         - fullName
 *         - ID_card_number
 *         - userName
 *         - password
 *         - birthDate
 *         - address
 *         - role
 *         - email
 *         - phoneNumber
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
    userName: {
      type: String,
      required: [true, 'User must have a unique user name.'], // User name of the user, required field
      unique: true, // Ensures that each username is unique in the database
    },
    password: {
      type: String,
      required: [true, 'User must have a Password.'], // Password of the user, required field
    },
    birthDate: {
      type: Date,
      required: [true, 'User must have a birth Date.'], // Birth date of the user, required field
    },

    address: { type: String, required: [true, 'Address is required.'] }, // Address field, required
    rating: Number, // User's rating

    role: {
      required: [true, 'User must have a role'], // User's role, required field
      type: String,
      enum: ['shipper', 'carrier', 'subcarrier', 'companycarrier'], // User's role is limited to specific values ('shipper','carrier','small-carrier')
    },
    // To check the given token same as database token
    hashToken: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true, // Store a lowercase slug based on the username
    },
    currentDistance: Number,
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
    },
    email: {
      type: String,
      required: [true, 'A user must have a email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      // minlength: 11,
      // maxlength: 11,
      // required: [true, 'Phone Number is required.'],
      // // Apply custom validation to Phone number for user to match spacific country

      // validate: {
      //   validator: function (value) {
      //     // Regular expression for validating Egyptian phone numbers
      //     const egyptianPhoneNumberRegex = /^(?:\+20|0)(1\d{9}|[2-5]\d{7})$/;
      //     return egyptianPhoneNumberRegex.test(value);
      //   },
      //   message: 'Invalid Egyptian phone number',
      // },
    },
    passwordChangedAt: Date,
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestIsused: Boolean,
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps to the document
  }
);
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

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

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPasswordChanged = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamps < changedTimestamps;
  }
  return false;
};

userSchema.methods.CreatePasswordResetCode = function () {
  const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordRestCode = crypto
    .createHash('sha256')
    .update(randomNum)
    .digest('hex');
  console.log(new Date(Date.now()));
  this.passwordRestExpires = Date.now() + 10 * 60 * 1000;
  this.passwordRestIsused = false;
  return randomNum;
};

// Create a User model using the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model
