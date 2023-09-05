const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller

const router = express.Router();

// Protect all routes defined in this router using the protect middleware
router.use(adminController.protect);

// Define a route for admin signup accessible only by 'head admin' role
router
  .route('/signup')
  .post(adminController.restrictTo('head admin'), adminController.SignupAdmins);

// Export the router
module.exports = router;
