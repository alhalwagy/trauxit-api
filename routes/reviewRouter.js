const express = require('express'); // Import the Express framework
const authController = require('../controllers/authController'); // Import the authentication controller
const reviewController = require('../controllers/reviewController');
const router = express.Router({ mergeParams: true }); // Create an Express router

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    reviewController.addRatingToCarrier
  );

module.exports = router;
