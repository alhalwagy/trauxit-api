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
  )
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.createShipper
  );

router
  .route('/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.updateShipper
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getShipper
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.deleteShipper
  );

module.exports = router;
