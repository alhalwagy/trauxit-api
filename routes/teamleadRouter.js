const express = require('express');
const teamleadController = require('../controllers/teamleadController'); // Import admin controller

const router = express.Router();

router.route('/signup').post(teamleadController.signup);
router.route('/login').post(teamleadController.login);
router
  .route('/logout')
  .post(teamleadController.protect, teamleadController.logout);

module.exports = router;
