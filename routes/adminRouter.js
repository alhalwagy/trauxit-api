const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const loadController = require('../controllers/loadsController');

const router = express.Router();

/**
 * @swagger
 * /admin/signup:
 *   post:
 *     summary: Sign up a new admin (accessible only by 'head admin' role).
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: HOK
 *                 description: Full Name of the admin.
 *               userName:
 *                 type: string
 *                 example: HOK
 *                 description: User Name of the admin.
 *               password:
 *                 type: string
 *                 example: 12345
 *                 description: Password for the admin.
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 02/22/2001
 *                 description: Birth Date of the admin (optional).
 *               companyName:
 *                 type: string
 *                 example: trauxit
 *                 description: Company Name of the admin.
 *               email:
 *                 type: string
 *                 format: email
 *                 example: HOK@TRAUXIT.com
 *                 description: Email address of the admin.
 *               role:
 *                 type: string
 *                 enum:
 *                   - head admin
 *                   - admin
 *                   - supporter
 *                 example: admin
 *                 description: Role of the admin.
 *     responses:
 *       200:
 *         description: Admin signed up successfully.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       403:
 *         description: Forbidden - User does not have 'head admin' role.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/signup').post(
  // adminController.protect,
  // adminController.restrictTo('head admin'),
  adminController.SignupAdmins
);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Log in as an admin.
 *     tags:
 *       - Admin
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
 *     responses:
 *       200:
 *         description: Admin logged in successfully.
 *       401:
 *         description: Unauthorized - Invalid credentials.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/login').post(adminController.login);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Log out as an admin.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

router.route('/logout').post(adminController.protect, adminController.logout);
/**
 * @swagger
 * /forgetpassword:
 *   post:
 *     summary: Request Password Reset
 *     description: Request a password reset.
 *     tags:
 *       - Admin
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
 *       - Admin
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
 *       - Admin
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

router.post('/forgetpassword', adminController.forgetPassword);
router.post('/verifyresetcode', adminController.verifyResetCode);
router.post('/resetpassword', adminController.resetPassword);

// Export the router
module.exports = router;
