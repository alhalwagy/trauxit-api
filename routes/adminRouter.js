const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const loadController = require('../controllers/loadsController');

const router = express.Router();

router
  .route('/signup')
  .post(
    adminController.protect,
    adminController.restrictTo('head admin'),
    adminController.SignupAdmins
  );

router.route('/login').post(adminController.login);

router.route('/logout').post(adminController.protect, adminController.logout);

router.post('/forgetpassword', adminController.forgetPassword);
router.post('/verifyresetcode', adminController.verifyResetCode);
router.post('/resetpassword', adminController.resetPassword);

// Export the router
module.exports = router;
