const express = require('express');

const shipperController = require('../controllers/shipperController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router
  .route('/')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getAllShippers
  );

module.exports = router;
