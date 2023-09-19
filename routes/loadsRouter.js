const express = require('express');

const authController = require('../controllers/authController');
const loadController = require('../controllers/loadsController');
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const carrierController = require('../controllers/carrierController');
const router = express.Router();

//Route Add & Get Loads From Shipper
/**
 * @swagger
 * tags:
 *   name: Loads
 */

/**
 * @swagger
 * /loads/shipper:
 *   post:
 *     summary: Create a new load for a shipper
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeLoads:
 *                 type: string
 *                 description: The type of the load (e.g., "electronics").
 *               nameLoads:
 *                 type: string
 *                 description: The name of the load (e.g., "laptop").
 *               Weight:
 *                 type: number
 *                 description: The weight of the load (e.g., 20.5).
 *               PickupLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Description of the pickup location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Address of the pickup location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *               DropoutLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Description of the dropout location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Address of the dropout location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *             required:
 *               - typeLoads
 *               - nameLoads
 *               - Weight
 *               - PickupLocation
 *               - DropoutLocation
 *     responses:
 *       '201':
 *         description: A new load has been created for the shipper.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   get:
 *     summary: Get loads for a shipper
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Loads for the shipper.
 *       '401':
 *         description: Unauthorized access.
 */

router
  .route('/shipper/')
  .post(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.createLoad
  )
  .get(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.getLoadsForShipper
  );

/**
 * @swagger
 * /loads/admin:
 *   post:
 *     summary: Create a new load by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeLoads:
 *                 type: string
 *                 description: The type of the load (e.g., "electronics").
 *               nameLoads:
 *                 type: string
 *                 description: The name of the load (e.g., "laptop").
 *               Weight:
 *                 type: number
 *                 description: The weight of the load (e.g., 20.5).
 *               PickupLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Description of the pickup location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Address of the pickup location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *               DropoutLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Description of the dropout location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Address of the dropout location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *             required:
 *               - typeLoads
 *               - nameLoads
 *               - Weight
 *               - PickupLocation
 *               - DropoutLocation
 *     responses:
 *       '201':
 *         description: A new load has been created by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/admin/')
  .post(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.createLoad
  );

/**
 * @swagger
 * /loads/carrier:
 *   get:
 *     summary: Get loads for a carrier
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Loads for the carrier.
 *       '401':
 *         description: Unauthorized access.
 */

router
  .route('/carrier/')
  .get(
    authController.protect,
    authController.restrictTo('carrier', 'small-carrier'),
    loadController.getLoadsForCarrier
  );

/**
 * @swagger
 * /loads/booking/{id}:
 *   patch:
 *     summary: Book a load by a shipper
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to book.
 *     responses:
 *       '200':
 *         description: The load has been booked by the shipper.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/booking/:id')
  .patch(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.bookingLoads,
    notificationController.createNotification
  );

/**
 * @swagger
 * /loads/loads-within/{distance}/unit/{unit}:
 *   get:
 *     summary: Get loads within a certain distance for a carrier
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: distance
 *         required: true
 *         description: The maximum distance in specified units.
 *         schema:
 *           type: number
 *       - in: path
 *         name: unit
 *         required: true
 *         description: The unit of distance (e.g., miles, kilometers).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Loads within the specified distance for the carrier.
 *       '401':
 *         description: Unauthorized access.
 */

router
  .route('/loads-within/:distance/unit/:unit')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getLoadWithin
  );

/**
 * @swagger
 * /loads/distances/unit/{unit}:
 *   get:
 *     summary: Get distances for loads in a specific unit
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unit
 *         required: true
 *         description: The unit of distance (e.g., miles, kilometers).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Distances for loads in the specified unit.
 *       '401':
 *         description: Unauthorized access.
 */

router
  .route('/distances/unit/:unit')
  .get(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.getDistances
  );

/**
 * @swagger
 * /loads/{id}/update-status-to-available:
 *   patch:
 *     summary: Update load status to available by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to update.
 *     responses:
 *       '200':
 *         description: Load status has been updated to available by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id/update-status-to-available')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.updateLoadsToAvailable
  );

/**
 * @swagger
 * /loads/{id}/update-status-to-inchecksp:
 *   patch:
 *     summary: Update load status to in-check by a carrier
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to update.
 *     responses:
 *       '200':
 *         description: Load status has been updated to in-check by the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id/update-status-to-inchecksp')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToInchecksp
  );

/**
 * @swagger
 * /loads/{idload}/update-status-to-onroad:
 *   patch:
 *     summary: Update load status to on-road by a carrier
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idload
 *         required: true
 *         description: The ID of the load to update.
 *     responses:
 *       '200':
 *         description: Load status has been updated to on-road by the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:idload/update-status-to-onroad/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToOnRoad
  );

/**
 * @swagger
 * /loads/{id}/update-status-to-canceled:
 *   patch:
 *     summary: Update load status to canceled by a shipper
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to update.
 *     responses:
 *       '200':
 *         description: Load status has been updated to canceled by the shipper.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id/update-status-to-canceled')
  .patch(
    authController.protect,
    authController.restrictTo('shipper'),
    loadController.updateLoadsToCanceled
  );

/**
 * @swagger
 * /loads/{idload}/update-status-to-completed:
 *   patch:
 *     summary: Update load status to completed by a carrier
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idload
 *         required: true
 *         description: The ID of the load to update.
 *     responses:
 *       '200':
 *         description: Load status has been updated to completed by the carrier.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:idload/update-status-to-completed/')
  .patch(
    authController.protect,
    authController.restrictTo('carrier'),
    loadController.updateLoadsToCompleted
  );

/**
 * @swagger
 * /loads:
 *   get:
 *     summary: Get all loads by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All loads retrieved by the admin.
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
    loadController.getAllLoads
  );

/**
 * @swagger
 * /loads/{id}:
 *   patch:
 *     summary: Update a load by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeLoads:
 *                 type: string
 *                 description: The updated type of the load (e.g., "electronics").
 *               nameLoads:
 *                 type: string
 *                 description: The updated name of the load (e.g., "laptop").
 *               Weight:
 *                 type: number
 *                 description: The updated weight of the load (e.g., 20.5).
 *               PickupLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Updated description of the pickup location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Updated geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Updated address of the pickup location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *               DropoutLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Updated description of the dropout location.
 *                   type:
 *                     type: string
 *                     description: Type of location (e.g., "Point").
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Updated geographic coordinates [longitude, latitude].
 *                   address:
 *                     type: string
 *                     description: Updated address of the dropout location.
 *                 required:
 *                   - description
 *                   - type
 *                   - coordinates
 *                   - address
 *             required:
 *               - typeLoads
 *               - nameLoads
 *               - Weight
 *               - PickupLocation
 *               - DropoutLocation
 *     responses:
 *       '200':
 *         description: Load has been updated by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   get:
 *     summary: Get a load by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to retrieve.
 *     responses:
 *       '200':
 *         description: Load retrieved by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   delete:
 *     summary: Delete a load by an admin
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the load to delete.
 *     responses:
 *       '204':
 *         description: Load has been deleted by the admin.
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
    loadController.updateLoads
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.getLoad
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    loadController.deleteLoad
  );

module.exports = router;
