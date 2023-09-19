/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         review:
 *           type: string
 *           description: The review text.
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: The rating given in the review, ranging from 1 to 5.
 *         carriedId:
 *           type: string
 *           format: uuid
 *           description: The ID of the carrier associated with this review.
 *         shipperId:
 *           type: string
 *           format: uuid
 *           description: The ID of the shipper associated with this review.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the review was created.
 *       required:
 *         - review
 *         - rating
 *         - carriedId
 *         - shipperId
 */

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
