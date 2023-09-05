const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const validator = require('validator');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'User Must Have A Full Name.'],
    },
    ID_card_number: {
      type: Number,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: [true, 'User must have a unique user name.'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'User must have a Password.'],
    },
    passwordConfirm: {
      type: String,
      required: [
        true,
        'Confirm Password is required. Please enter your confirm password',
      ],
      validate: {
        validator: function (passwordConfirm) {
          return passwordConfirm === this.password;
        },
        message: "Confirm password doesn't match password ",
      },
    },

    birthDate: {
      type: Date,
      required: [true, 'User must have a birth Date.'],
    },
    companyName: {
      type: String,
    },
    address: { type: String, required: [true, 'Address is required.'] },
    location_address: String,
    rating: Number,

    role: {
      required: [true, 'User must have a role'],
      type: String,
      enum: ['shipper', 'carrier'],
    },

    hashToken: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  this.slug = slugify(this.userName);
  next();
});

userSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined;
  next();
});

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
