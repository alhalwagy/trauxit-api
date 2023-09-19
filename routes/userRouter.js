const express = require('express'); // Import the Express framework
const authController = require('../controllers/authController'); // Import the authentication controller
const reviewRouter = require('../routes/reviewRouter');

const router = express.Router(); // Create an Express router

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Sign up a new user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the user.
 *               ID_card_number:
 *                 type: string
 *                 description: The ID card number of the user.
 *               userName:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirmation of the user's password.
 *               birthDate:
 *                 type: string
 *                 description: The birth date of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               role:
 *                 type: string
 *                 enum:
 *                   - carrier
 *                   - shipper
 *                   - admin
 *                 description: The role of the user ('carrier', 'shipper', or 'admin').
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user.
 *             example:
 *               fullName: Mahmoud Hok
 *               ID_card_number: '12345647327325'
 *               userName: hok38
 *               password: '12345'
 *               passwordConfirm: '12345'
 *               birthDate: '02/22/2001'
 *               address: Gamssa
 *               role: carrier
 *               email: m.salah@trauxit.com
 *               phoneNumber: '01012345578'
 *     responses:
 *       201:
 *         description: User signed up successfully.
 *       400:
 *         description: Bad Request - Invalid request or missing required fields.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/signup').post(authController.signupUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in as a user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *             example:
 *               email: ahmedhalwgy@gmail.com
 *               password: '12345'
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Unauthorized - Invalid email or password.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/login').post(authController.login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/logout').post(authController.protect, authController.logout);

/**
 * @swagger
 * /getmydata:
 *   get:
 *     summary: Get the profile data of the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/getmydata').get(authController.protect, authController.getMe);

/**
 * @swagger
 * /updatemypassword:
 *   post:
 *     summary: Update the password of the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password.
 *               password:
 *                 type: string
 *                 description: The new password.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirmation of the new password.
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Bad Request - Invalid request or missing required fields.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

router
  .route('/updatemypassword')
  .get(authController.protect, authController.updateMyPassword);

/**
 * @swagger
 * /users/{carrierId}/reviews:
 *   summary: Manage reviews for a specific carrier.
 *   tags:
 *     - Reviews
 *   parameters:
 *     - in: path
 *       name: carrierId
 *       schema:
 *         type: string
 *       required: true
 *       description: The ID of the carrier for which reviews are managed.
 *   security:
 *     - bearerAuth: []
 *   requestBody:
 *     required: true
 *     description: Review data to be created or updated.
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             rating:
 *               type: number
 *               description: The rating value for the review.
 *             comment:
 *               type: string
 *               description: Optional comment for the review.
 *           required:
 *             - rating
 *   responses:
 *     200:
 *       description: Review operation successful.
 *     400:
 *       description: Bad Request - Invalid request or missing required fields.
 *     401:
 *       description: Unauthorized - User not authenticated.
 *     500:
 *       description: Internal Server Error.
 */


router.use('/:carrierId/reviews', reviewRouter);
// Export the router for use in other parts of your application

module.exports = router;
