const express = require('express');

const authController = require('../controllers/authController');
const loadController = require('../controllers/loadsController');
const adminController = require('../controllers/adminController');
const router = express.Router();

router
  .route('/shipper/')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.createLoad
  );
router
  .route('/admin/')
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.createLoad
  );

module.exports = router;
