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
  )
  .get(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.getLoadsForShipper
  );

router
  .route('/admin/')
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.createLoad
  );

router
  .route('/carrier/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getLoadsForCarrier
  );

router
  .route('/booking/:id')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.bookingLoads
  );

  

module.exports = router;
