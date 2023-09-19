/**
 * @swagger
 * tags:
 *   name: Shippers
 */

const express = require('express');
const shipperController = require('../controllers/shipperController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /shippers:
 *   get:
 *     summary: Get all shippers
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of all shippers.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   post:
 *     summary: Create a new shipper
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the shipper.
 *               ID_card_number:
 *                 type: integer
 *                 description: The ID card number of the shipper.
 *               userName:
 *                 type: string
 *                 description: The username of the shipper.
 *               password:
 *                 type: string
 *                 description: The password for the shipper's account.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirm the password for the shipper's account.
 *               birthDate:
 *                 type: string
 *                 description: The birthdate of the shipper.
 *               companyName:
 *                 type: string
 *                 description: The name of the shipper's company.
 *               address:
 *                 type: string
 *                 description: The address of the shipper.
 *               rating:
 *                 type: number
 *                 description: The rating of the shipper.
 *               role:
 *                 type: string
 *                 description: The role of the shipper (e.g., "shipper").
 *             required:
 *               - fullName
 *               - ID_card_number
 *               - userName
 *               - password
 *               - passwordConfirm
 *               - birthDate
 *               - companyName
 *               - address
 *               - rating
 *               - role
 *     responses:
 *       '201':
 *         description: A new shipper has been created.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getAllShippers
  )
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.createShipper
  );

/**
 * @swagger
 * /shippers/{id}:
 *   get:
 *     summary: Get a shipper by ID
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the shipper.
 *     responses:
 *       '200':
 *         description: A shipper with the specified ID.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   patch:
 *     summary: Update a shipper by ID
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the shipper.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The updated full name of the shipper.
 *               ID_card_number:
 *                 type: integer
 *                 description: The updated ID card number of the shipper.
 *               userName:
 *                 type: string
 *                 description: The updated username of the shipper.
 *               password:
 *                 type: string
 *                 description: The updated password for the shipper's account.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirm the updated password for the shipper's account.
 *               birthDate:
 *                 type: string
 *                 description: The updated birthdate of the shipper.
 *               companyName:
 *                 type: string
 *                 description: The updated name of the shipper's company.
 *               address:
 *                 type: string
 *                 description: The updated address of the shipper.
 *               rating:
 *                 type: number
 *                 description: The updated rating of the shipper.
 *               role:
 *                 type: string
 *                 description: The updated role of the shipper (e.g., "shipper").
 *             required:
 *               - fullName
 *               - ID_card_number
 *               - userName
 *               - password
 *               - passwordConfirm
 *               - birthDate
 *               - companyName
 *               - address
 *               - rating
 *               - role
 *     responses:
 *       '200':
 *         description: The shipper has been updated.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   delete:
 *     summary: Delete a shipper by ID
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the shipper.
 *     responses:
 *       '204':
 *         description: The shipper has been deleted.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id')
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.getShipper
  )
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.updateShipper
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    shipperController.deleteShipper
  );

router
  .route('/:idload/createshipment/unit/:unit')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    shipperController.createShipmentFromAToB
  );

module.exports = router;
