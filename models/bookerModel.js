const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const bookerSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, 'Company must have a Password.'],
    },
    groupName: {
      type: String,
    },
    address: { type: String, required: [true, 'Address is required.'] },
    rating: Number,
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
      minlength: 12,
      maxlength: 12,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    role: {
      type: String,
      enum: ['company', 'teamleader'],
    },
    group_id: {
      type: String,
      unique: true,
    },
    fullName: String,
    image: String,

    passwordChangedAt: Date,
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestIsused: Boolean,
    birthDate: Date,
  },
  {
    timestamps: true,
  }
);

bookerSchema.post('save', function (doc, next) {
  doc.hashToken = signToken(doc._id);
  next();
});

bookerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined; // Clear the passwordConfirm field
  next();
});

bookerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

bookerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

bookerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

bookerSchema.methods.checkPasswordChanged = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamps < changedTimestamps;
  }
  return false;
};

bookerSchema.methods.CreatePasswordResetCode = function () {
  const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordRestCode = crypto
    .createHash('sha256')
    .update(randomNum)
    .digest('hex');
  console.log(new Date(Date.now()));
  this.passwordRestExpires = Date.now() + 10 * 60 * 1000;
  this.passwordRestIsused = false;
  return randomNum;
};

const Booker = mongoose.model('Booker', bookerSchema);
module.exports = Booker;
