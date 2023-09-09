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
    authController.restrictTo('shipper'),
    loadController.bookingLoads
  );

router
  .route('/loads-within/:distance/center/:latlng/unit/:unit')
  .get(loadController.getLoadWithin);

router.route('/distances/:latlng/unit/:unit').get(loadController.getDistances);

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
  .route('/:id/update-status-to-onroad/:latlng/unit/:unit')
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

// router
//   .route('/:id/update-status-to-completed')
//   .patch(
//     authController.protect,
//     authController.restrictTo('shipper'),
//     loadController.updateLoadsToCanceled
//   );

module.exports = router;
