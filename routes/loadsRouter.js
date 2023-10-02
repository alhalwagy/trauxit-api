const express = require('express');

const authController = require('../controllers/authController');
const loadController = require('../controllers/loadsController');
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const carrierController = require('../controllers/carrierController');
const shipperController = require('../controllers/shipperController');
const router = express.Router();

router
  .route('/shipper/')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.createLoad,
    shipperController.createShipmentFromAToB
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
    authController.restrictTo('carrier', 'small-carrier'),
    loadController.getLoadsForCarrier
  );

router
  .route('/booking/:id')
  .patch(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.bookingLoads,
    notificationController.createNotification
  );

router
  .route('/loads-within/:distance/unit/:unit')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getLoadWithin
  );

router
  .route('/distances/unit/:unit')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getDistances
  );

router
  .route('/:id/update-status-to-available')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.updateLoadsToAvailable
  );

router
  .route('/:id/update-status-to-inchecksp')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToInchecksp
  );

router
  .route('/:idload/update-status-to-onroad/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToOnRoad
  );

router
  .route('/:id/update-status-to-canceled')
  .patch(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.updateLoadsToCanceled
  );

router
  .route('/:idload/update-status-to-completed/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToCompleted
  );

router
  .route('/')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.getAllLoads
  );

router
  .route('/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.updateLoads
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.getLoad
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.deleteLoad
  );

module.exports = router;
