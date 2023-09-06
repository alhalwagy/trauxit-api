const express = require('express');
const carController = require('../controllers/carController'); // Import admin controller
const authController = require('../controllers/authController'); // Import admin controller

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('carrier'),
    carController.createCar
  );

module.exports = router;
