const express = require('express'); // Import the Express framework
const authController = require('../controllers/authController'); // Import the authentication controller
const reviewRouter = require('../routes/reviewRouter');
const userController = require('../controllers/userController');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const router = express.Router(); // Create an Express router

router.route('/signup').post(authController.signupUser);

router.route('/login').post(authController.login);

router.route('/logout').post(authController.protect, authController.logout);

router.route('/getmydata').get(authController.protect, userController.getMe);

router
  .route('/updatemypassword')
  .patch(authController.protect, userController.updateMyPassword);

router.post('/forgetpassword', authController.forgetPassword);
router.post('/verifyresetcode', authController.verifyResetCode);
router.post('/resetpassword', authController.resetPassword);

router
  .route('/updatemydata/')
  .patch(
    authController.protect,
    userController.uploadUserImage,
    userController.resizeUserImage,
    userController.updateMe
  );

router.use('/:carrierId/reviews', reviewRouter);
// Export the router for use in other parts of your application

module.exports = router;
