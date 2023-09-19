const express = require('express');
const adminController = require('../controllers/adminController'); // Import admin controller
const carrierController = require('../controllers/carrierController');
const authController = require('../controllers/authController');

/**
 * @swagger
 * /carriers/updatemyrole/:
 *   patch:
 *     summary: Update the role of the carrier to subcarrier
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: string
 *                 description: The ID of the carrier's company.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the carrier.
 *             required:
 *               - company_id
 *               - email
 *     responses:
 *       '200':
 *         description: Role of the carrier has been updated to subcarrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

const router = express.Router();

router
  .route('/updatemyrole/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.updateCarrierToSubcarrier
  );

/**
 * @swagger
 * /carriers/mybookedloads/:
 *   get:
 *     summary: Get booked loads for the carrier
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Booked loads retrieved for the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/mybookedloads/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.getBookedLoadsForCarrier
  );

/**
 * @swagger
 * /carriers/mycompletedloads/:
 *   get:
 *     summary: Get completed loads for the carrier
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Completed loads retrieved for the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/mycompletedloads/')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.getdroupedoutLoadsForCarrier
  );

/**
 * @swagger
 * /carriers/{idload/calcdistancetoshoping/unit/{unit}:
 *   patch:
 *     summary: Calculate distance from the carrier to shopping location
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idload
 *         required: true
 *         description: The ID of the load.
 *       - in: path
 *         name: unit
 *         required: true
 *         description: The unit of distance (e.g., miles, kilometers).
 *     responses:
 *       '200':
 *         description: Distance calculated from the carrier to shopping location.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:idload/calcdistancetoshoping/unit/:unit')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.calcDistFromCarrierToShopping
  );

/**
 * @swagger
 * /carriers/updatelocation/{latlng}:
 *   patch:
 *     summary: Update the location of the carrier
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: latlng
 *         required: true
 *         description: The latitude and longitude coordinates of the carrier's location.
 *     responses:
 *       '200':
 *         description: Location of the carrier has been updated.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/updatelocation/:latlng')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    carrierController.locationdectecd
  );

/**
 * @swagger
 * /carriers/:
 *   get:
 *     summary: Get all carriers by an admin
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All carriers retrieved by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   post:
 *     summary: Create a new carrier by an admin
 *     tags: [Carriers]
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
 *                 description: The full name of the carrier.
 *               ID_card_number:
 *                 type: integer
 *                 description: The ID card number of the carrier.
 *               userName:
 *                 type: string
 *                 description: The username of the carrier.
 *               password:
 *                 type: string
 *                 description: The password for the carrier's account.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirm the password for the carrier's account.
 *               birthDate:
 *                 type: string
 *                 description: The birthdate of the carrier.
 *               companyName:
 *                 type: string
 *                 description: The name of the carrier's company.
 *               address:
 *                 type: string
 *                 description: The address of the carrier.
 *               rating:
 *                 type: number
 *                 description: The rating of the carrier.
 *               role:
 *                 type: string
 *                 description: The role of the carrier (e.g., "carrier").
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
 *         description: A new carrier has been created by the admin.
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
    carrierController.getAllCarriers
  )
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.createCarrier
  );

/**
 * @swagger
 * /carriers/{id}:
 *   patch:
 *     summary: Update a carrier by an admin
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the carrier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The updated full name of the carrier.
 *               ID_card_number:
 *                 type: integer
 *                 description: The updated ID card number of the carrier.
 *               userName:
 *                 type: string
 *                 description: The updated username of the carrier.
 *               password:
 *                 type: string
 *                 description: The updated password for the carrier's account.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirm the updated password for the carrier's account.
 *               birthDate:
 *                 type: string
 *                 description: The updated birthdate of the carrier.
 *               companyName:
 *                 type: string
 *                 description: The updated name of the carrier's company.
 *               address:
 *                 type: string
 *                 description: The updated address of the carrier.
 *               rating:
 *                 type: number
 *                 description: The updated rating of the carrier.
 *               role:
 *                 type: string
 *                 description: The updated role of the carrier (e.g., "carrier").
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
 *         description: The carrier has been updated by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   get:
 *     summary: Get a carrier by an admin
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the carrier.
 *     responses:
 *       '200':
 *         description: A carrier with the specified ID retrieved by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   delete:
 *     summary: Delete a carrier by an admin
 *     tags: [Carriers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the carrier.
 *     responses:
 *       '200':
 *         description: The carrier has been deleted by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.updateCarriers
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.getCarrier
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    carrierController.deleteCarriers
  );

module.exports = router;
