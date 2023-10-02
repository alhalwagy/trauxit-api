const express = require('express');
const carController = require('../controllers/carController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router
  .route('/mycars')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carController.getMyCar
  );

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('carrier', 'small-carrier'),
    carController.createCar
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.getAllCars
  );

router
  .route('/admin/')
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.createCarForAdmin
  );

router
  .route('/:id')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.getCar
  )
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.updateCar
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.deleteCar
  );

module.exports = router;
