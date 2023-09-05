const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Admin Must Have A Full Name.'],
    },
    email: {
      type: String,
      required: [true, 'Email IS Required.'],
      unique: true,
    },
    userName: {
      type: String,
      required: [true, 'Admin must have a unique user name.'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Admin must have a Password.'],
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
    },
    role: {
      type: String,
      enum: ['head admin', 'admin', 'supporter'],
    },
    hashToken: String,
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
