const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const carrierController = require('../controllers/carrierController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/calculate-deadmile/:id')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.calcDeadMileForLoad
  );

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

router
  .route('/add-friend')
  .post(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.addfriend
  );

router
  .route('/accept-friend-request')
  .post(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.acceptFriendReq
  );

router
  .route('/toteam-leader')
  .post(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.assignCarrierToTeamlead
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

module.exports = router;
