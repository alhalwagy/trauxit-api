/**
 * @swagger
 * components:
 *   schemas:
 *     Booker:
 *       type: object
 *       properties:
 *         company_id:
 *           type: string
 *           description: Unique company ID.
 *         password:
 *           type: string
 *           description: Password for the booker (required).
 *         companyName:
 *           type: string
 *           description: Name of the company.
 *         address:
 *           type: string
 *           description: Address of the booker (required).
 *         rating:
 *           type: number
 *           description: User's rating.
 *         hashToken:
 *           type: string
 *           description: JWT hash token.
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the booker (required).
 *         userName:
 *           type: string
 *           description: User name of the booker (required, unique).
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the booker (required, unique).
 *         friends:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs representing friends.
 *         teamName:
 *           type: string
 *           description: Name of the team.
 *         role:
 *           type: string
 *           enum:
 *             - company
 *             - teamleader
 *           description: Role of the booker.
 *         team_id:
 *           type: string
 *           description: Unique team ID.
 *       required:
 *         - password
 *         - passwordConfirm
 *         - address
 *         - email
 *         - userName
 *         - phoneNumber
 */

// Your other Swagger documentation annotations for routes can go here

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const bookerSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      unique: true, // Ensures that each ID card number is unique in the database
    },
    password: {
      type: String,
      required: [true, 'Company must have a Password.'], // Password of the user, required field
    },
    companyName: {
      type: String,
    },
    address: { type: String, required: [true, 'Address is required.'] }, // Address field, required
    rating: Number, // User's rating
    // To check the given token same as database token
    hashToken: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'A booker must have a email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    userName: {
      type: String,
      unique: true,
      required: [true, 'Booker must have userName'],
    },
    phoneNumber: {
      required: [true, 'Phone Number is required'],
      unique: true,
      type: String,
      minlength: 11,
      maxlength: 11,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 'user' is the name of the referenced collection
      },
    ],
    teamName: {
      type: String,
    },
    role: {
      type: String,
      enum: ['company', 'teamleader'],
    },
    team_id: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Post-save middleware to generate and save a JWT hash token
bookerSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

// Pre-save middleware to hash the password
bookerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined; // Clear the passwordConfirm field
  next();
});

// Set toJSON options to remove the password field from JSON responses
bookerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

// Set toJSON options to remove the hashToken field from JSON responses
bookerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

// Method to compare a candidate password with the user's hashed password
bookerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Booker = mongoose.model('Booker', bookerSchema);
module.exports = Booker;
