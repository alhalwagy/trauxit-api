const express = require('express');
const companyController = require('../controllers/companyController'); // Import admin controller

const router = express.Router();

router.route('/signup').post(companyController.signup);
router.route('/login').post(companyController.login);
router
  .route('/logout')
  .post(companyController.protect, companyController.logout);

module.exports = router;
