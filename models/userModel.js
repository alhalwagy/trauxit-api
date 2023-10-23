const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const bcrypt = require('bcrypt');
const slugify = require('slugify');
const validator = require('validator');

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

const User = mongoose.model('User', userSchema);

module.exports = User;
