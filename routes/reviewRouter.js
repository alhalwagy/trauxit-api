/**
 * @swagger
 * tags:
 *   name: Reviews
 */

const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });
/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Add a review rating for a carrier
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: The rating given for the carrier (e.g., 3.2).
 *               review:
 *                 type: string
 *                 description: The review comments (e.g., "very good").
 *             required:
 *               - rating
 *               - review
 *     responses:
 *       '201':
 *         description: A new review rating has been added for the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    reviewController.addRatingToCarrier
  );

module.exports = router;
