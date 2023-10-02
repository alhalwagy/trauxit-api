

const mongoose = require('mongoose');
const User = require('./userModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty !'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    carriedId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to Carrier'],
    },

    shipperId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to Shipper'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
