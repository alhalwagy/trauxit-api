const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const validator = require('validator');
const crypto = require('crypto');

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'A User must have a email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide a valid email'],
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
    role: {
      required: [true, 'User must have a role'],
      type: String,
      enum: ['shipper', 'carrier', 'subcarrier', 'company', 'teamlead'],
    },
    hashToken: {
      type: String,
    },
    slug: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestIsused: Boolean,
  },
  {
    timestamps: true,
  }
);

authSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 14);
  next();
});

authSchema.pre('save', function (next) {
  this.slug = slugify(this.userName, { lower: true });
  next();
});

authSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

authSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.hashToken;
  },
});

authSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.hashToken;
  },
});

authSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

authSchema.methods.checkPasswordChanged = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamps < changedTimestamps;
  }
  return false;
};

authSchema.methods.CreatePasswordResetCode = function () {
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

const Authentication = mongoose.model('Authentication', authSchema);

module.exports = Authentication;
