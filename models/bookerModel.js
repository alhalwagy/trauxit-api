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
    groupName: {
      type: String,
    },
    address: { type: String, required: [true, 'Address is required.'] },
    rating: Number,
    birthDate: Date,
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
        ref: 'Authentication',
      },
    ],

    group_id: {
      type: String,
      unique: true,
    },
    fullName: String,
    image: String,
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authentication',
    },
    myTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authentication',
      },
    ],
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
