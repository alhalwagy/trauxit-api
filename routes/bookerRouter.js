const express = require('express');
const bookerController = require('../controllers/bookerController'); // Import admin controller
const carController = require('../controllers/carController');
const loadController = require('../controllers/loadsController');
const authController = require('../controllers/authController');
const router = express.Router();

// //signup For Bookers
// router.post('/signup', bookerController.signup);
// // logout from app to booker
// router.post('/logout', bookerController.protect, bookerController.logout);
// Get booker own Data
// router
//   .route('/getmydata')
//   .get(bookerController.protect, bookerController.getMe);
// // update booker password
// router
//   .route('/updatemypassword')
//   .patch(bookerController.protect, bookerController.updateMyPassword);

// update booker Data
// router
//   .route('/updatemydata/')
//   .patch(
//     bookerController.protect,
//     bookerController.uploadUserImage,
//     bookerController.resizeUserImage,
//     bookerController.updateBookerData
//   );

// create member with booker
router
  .route('/create-member/')
  .post(
    authController.protect,
    authController.restrictTo('teamlead'),
    bookerController.crearteSubCarrier
  );
// create car for member with booker
router
  .route('/create-member-car/')
  .post(
    authController.protect,
    authController.restrictTo('teamlead'),
    carController.createCar
  );

// router
//   .route('/get-available-loads/')
//   .get(
//     authController.protect,
//     authController.restrictTo('carrier'),
//     loadController.getLoadsForCarrier
//   );

router
  .route('/my-members/')
  .get(
    authController.protect,
    authController.restrictTo('teamlead', 'company'),
    bookerController.getMyMembers
  );

router
  .route('/getAllSubcarriers/')
  .get(
    authController.protect,
    authController.restrictTo('teamlead', 'company'),
    bookerController.getAllSubcarriers
  );

router
  .route('/addTeamLeaderToCompany/')
  .post(
    authController.protect,
    authController.restrictTo('teamlead'),
    bookerController.assignTeamLeaderToComany
  );

module.exports = router;
