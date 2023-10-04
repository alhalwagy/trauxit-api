const express = require('express');
const bookerController = require('../controllers/bookerController'); // Import admin controller

const router = express.Router();

router.post('/signup', bookerController.signup);

router.post('/logout', bookerController.protect, bookerController.logout);
router
  .route('/getmydata')
  .get(bookerController.protect, bookerController.getMe);

router
  .route('/updatemypassword')
  .patch(bookerController.protect, bookerController.updateMyPassword);

module.exports = router;
