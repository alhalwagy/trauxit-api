const express = require('express');
const bookerController = require('../controllers/bookerController'); // Import admin controller

const router = express.Router();

router.post('/signup', bookerController.signup);

router.post('/login', bookerController.login);

router.post('/logout', bookerController.protect, bookerController.logout);

module.exports = router;
