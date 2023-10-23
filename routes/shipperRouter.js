const express = require('express');
const shipperController = require('../controllers/shipperController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getAllShippers
  )
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.createShipper
  );

router
  .route('/:id')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getShipper
  )
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.updateShipper
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.deleteShipper 
  );

router
  .route('/:idload/createshipment/unit/:unit')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    shipperController.createShipmentFromAToB
  );

module.exports = router;
