const express = require('express'); // Import the Express framework
const authController = require('../controllers/authController'); // Import the authentication controller
const reviewRouter = require('../routes/reviewRouter');

const router = express.Router(); // Create an Express router

// Define a route for user signup at the path '/signup'
// When a POST request is made to this route, it will be handled by the 'signupUser' function from the 'authController'
router.route('/signup').post(authController.signupUser);

// Define a route for user login at the path '/login'
// When a POST request is made to this route, it will be handled by the 'login' function from the 'authController'
router.route('/login').post(authController.login);

//Logout User From Application and remove token from DataBase

router.route('/logout').post(authController.protect, authController.logout);
router.route('/getmydata').get(authController.protect, authController.getMe);
router
  .route('/updatemypassword')
  .get(authController.protect, authController.updateMyPassword);

router.use('/:carrierId/reviews', reviewRouter);
// Export the router for use in other parts of your application

module.exports = router;
