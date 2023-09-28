const express = require('express');
const bookerController = require('../controllers/bookerController'); // Import admin controller

const router = express.Router();

/**
 * @swagger
 * /booker/signup:
 *   post:
 *     summary: Sign up a new booker.
 *     tags:
 *       - Booker
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - company
 *                   - teamleader
 *                 description: Role of the booker ('company' or 'teamleader').
 *               companyName:
 *                 type: string
 *                 description: Company name for the 'company' role.
 *               company_id:
 *                 type: string
 *                 description: Company ID for the 'company' role.
 *               password:
 *                 type: string
 *                 description: Password for the booker.
 *               address:
 *                 type: string
 *                 description: Address for the booker.
 *               email:
 *                 type: string
 *                 description: Email address for the booker.
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number for the booker.
 *               userName:
 *                 type: string
 *                 description: User name for the booker.
 *               team_id:
 *                 type: string
 *                 description: Team ID for the 'teamleader' role.
 *               teamName:
 *                 type: string
 *                 description: Team name for the 'teamleader' role.
 *     responses:
 *       201:
 *         description: Booker signed up successfully.
 *       400:
 *         description: Bad Request - Invalid request or missing required fields.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/signup', bookerController.signup);

/**
 * @swagger
 * /booker/login:
 *   post:
 *     summary: Log in as a booker.
 *     tags:
 *       - Booker
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the booker.
 *               password:
 *                 type: string
 *                 description: The password of the booker's account.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Booker logged in successfully.
 *       401:
 *         description: Unauthorized - Invalid credentials.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/login', bookerController.login);

/**
 * @swagger
 * /booker/logout:
 *   post:
 *     summary: Log out as a booker.
 *     tags:
 *       - Booker
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Booker logged out successfully.
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/logout', bookerController.protect, bookerController.logout);

module.exports = router;
