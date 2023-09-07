const express = require('express');

const authController = require('../controllers/authController');
const loadController = require('../controllers/loadsController');
const adminController = require('../controllers/adminController');
const router = express.Router();
//Route Add & Get Loads From Shipper
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
//Route Add Loads From Admin

router
  .route('/admin/')
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.createLoad
  );
//Route Get Loads From Carrier

router
  .route('/carrier/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getLoadsForCarrier
  );

//Route Book Loads From Carrier

router
  .route('/booking/:id')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.bookingLoads
  );

  

module.exports = router;
