const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.route('/signup').post(authController.signupUser);
router.route('/login').post(authController.login);
module.exports = router;
