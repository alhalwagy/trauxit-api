const express = require('express'); // Import the Express framework
const authController = require('../controllers/authController'); // Import the authentication controller
const reviewRouter = require('../routes/reviewRouter');
const userController = require('../controllers/userController');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           description: The full name of the user.
 *                         userName:
 *                           type: string
 *                           description: The username of the user.
 *                         birthDate:
 *                           type: string
 *                           description: The birth date of the user.
 *                         address:
 *                           type: string
 *                           description: The address of the user.
 *                         role:
 *                           type: string
 *                           description: The role of the user.
 *                         email:
 *                           type: string
 *                           format: email
 *                           description: The email address of the user.
 *                         _id:
 *                           type: string
 *                           description: The user's unique identifier.
 *                         createdAt:
 *                           type: string
 *                           description: The date and time when the user was created.
 *                         updatedAt:
 *                           type: string
 *                           description: The date and time when the user was last updated.
 *                         slug:
 *                           type: string
 *                           description: A unique slug for the user.
 *                         __v:
 *                           type: integer
 *                           description: Version number of the user document.
 *                 example:
 *                   status: success
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   data:
 *                     user:
 *                       fullName: Mahmoud Hok
 *                       userName: hok303
 *                       birthDate: "2001-02-21T22:00:00.000Z"
 *                       address: Gamssa
 *                       role: shipper
 *                       currentLocation:
 *                         type: Point
 *                         coordinates: []
 *                       email: a.haslwgy@trauxit.com
 *                       _id: "650ad8082a8034b2c0939bd8"
 *                       createdAt: "2023-09-20T11:31:20.980Z"
 *                       updatedAt: "2023-09-20T11:31:25.600Z"
 *                       slug: hok303
 *                       __v: 0
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

router.route('/getmydata').get(authController.protect, userController.getMe);

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
  .get(authController.protect, userController.updateMyPassword);

/**
 * @swagger
 * /forgetpassword:
 *   post:
 *     summary: Request Password Reset
 *     description: Request a password reset.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'a.halwgy@trauxit.com'
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset request has been sent successfully.
 *       400:
 *         description: Bad Request. Invalid email or request not sent.
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /verifyresetcode:
 *   post:
 *     summary: Verify Password Reset Code
 *     description: Verify a password reset code.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passwordResetCode:
 *                 type: string
 *                 example: '690621'
 *             required:
 *               - passwordResetCode
 *     responses:
 *       200:
 *         description: Password reset code is valid.
 *       400:
 *         description: Bad Request. Invalid password reset code.
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /resetpassword:
 *   post:
 *     summary: Reset Password
 *     description: Reset the password using a valid reset code.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'a.halwgy@trauxit.com'
 *               password:
 *                 type: string
 *                 example: '1234567'
 *               passwordConfirm:
 *                 type: string
 *                 example: '1234567'
 *             required:
 *               - email
 *               - password
 *               - passwordConfirm
 *     responses:
 *       200:
 *         description: Password has been successfully reset.
 *       400:
 *         description: Bad Request. Invalid password reset code or password.
 *       404:
 *         description: User not found
 */
router.post('/forgetpassword', authController.forgetPassword);
router.post('/verifyresetcode', authController.verifyResetCode);
router.post('/resetpassword', authController.resetPassword);

router
  .route('/updatemydata/:id')
  .patch(
    authController.protect,
    userController.uploadUserImage,
    userController.resizeUserImage,
    userController.updateMe
  );

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
