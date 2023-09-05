const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();
router.use(adminController.protect);
router
  .route('/signup')
  .post(adminController.restrictTo('head admin'), adminController.SignupAdmins);

// router.route('/login').post(adminController.login);
module.exports = router;
//  .post()
