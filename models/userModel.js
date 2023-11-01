const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const bcrypt = require('bcrypt');
const slugify = require('slugify');
const validator = require('validator');
const moment = require('moment-timezone');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'User Must Have A Full Name.'],
    },
    birthDate: {
      type: Date,
      required: [true, 'User must have a birth Date.'],
    },

    address: { type: String, required: [true, 'Address is required.'] },
    rating: Number,
    currentDistance: Number,
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
    },
    phoneNumber: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestIsused: Boolean,
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authentication',
      required: [true, 'User must have AUTH Data.'],
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    image: {
      type: String,
    },
    mygrage: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
    },
    companyName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// userSchema.pre('save', function (next) {
//   // Format the birthDate field
//   if (this.isModified('birthDate')) {
//     this.birthDate = moment
//       .tz('04/24/2001', 'MM/DD/YYYY', 'America/New_York')
//       .toDate();
//   }
//   console.log(this.birthDate);
//   // Continue with the save/update operation
//   next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
