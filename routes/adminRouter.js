const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const loadController = require('../controllers/loadsController');

const router = express.Router();

// Define a route for admin signup accessible only by 'head admin' role
// Protect all routes defined in this router using the protect middleware

router
  .route('/signup')
  .post(
    adminController.protect,
    adminController.restrictTo('head admin'),
    adminController.SignupAdmins
  );

router.route('/login').post(adminController.login);
router.route('/logout').post(adminController.protect, adminController.logout);

// Export the router
module.exports = router;
