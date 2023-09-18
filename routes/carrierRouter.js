const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const carrierController = require('../controllers/carrierController');
const authController = require('../controllers/authController');
const router = express.Router();
router
  .route('/updatemyrole/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.updateCarrierToSubcarrier
  );

router
  .route('/mybookedloads/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.getBookedLoadsForCarrier
  );

router
  .route('/mycompletedloads/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.getdroupedoutLoadsForCarrier
  );

router
  .route('/:idload/calcdistancetoshoping/unit/:unit')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.calcDistFromCarrierToShopping
  );

router
  .route('/updatelocation/:latlng')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.locationdectecd
  );
router
  .route('/')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.getAllCarriers
  )
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.createCarrier
  );

router
  .route('/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.updateCarriers
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.getCarrier
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.deleteCarriers
  );

module.exports = router;
