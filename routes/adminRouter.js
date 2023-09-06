const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller

const router = express.Router();

// Protect all routes defined in this router using the protect middleware


// Define a route for admin signup accessible only by 'head admin' role
router
  .route('/signup')
  .post(
    adminController.protect,
    adminController.restrictTo('head admin'),
    adminController.SignupAdmins
  );

router.route('/login').post(adminController.login);

// Export the router
module.exports = router;
