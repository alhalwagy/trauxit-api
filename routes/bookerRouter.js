const express = require('express');
const bookerController = require('../controllers/bookerController'); // Import admin controller
const validatorSignup = require('../utils/validators/signupcompanyValidation');

const router = express.Router();

router.route('/signup').post(bookerController.signup);
router.route('/login').post(bookerController.login);
router.route('/logout').post(bookerController.protect, bookerController.logout);

module.exports = router;
