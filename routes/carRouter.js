/**
 * @swagger
 * tags:
 *   name: Cars
 */

const express = require('express');
const carController = require('../controllers/carController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car (for carriers and small carriers)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               USDot:
 *                 type: integer
 *                 description: The USDot identifier for the vehicle.
 *               type:
 *                 type: string
 *                 description: The type of the vehicle (e.g., "Ferrari").
 *               maxWeight:
 *                 type: number
 *                 description: The maximum weight of the vehicle.
 *             required:
 *               - USDot
 *               - type
 *               - maxWeight
 *     responses:
 *       '201':
 *         description: A new car has been created.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   get:
 *     summary: Get all cars (for admins)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of cars.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('carrier', 'small-carrier'),
    carController.createCar
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.getAllCars
  );

/**
 * @swagger
 * /cars/admin:
 *   post:
 *     summary: Create a new car (for admins)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               USDot:
 *                 type: integer
 *                 description: The USDot identifier for the vehicle.
 *               type:
 *                 type: string
 *                 description: The type of the vehicle (e.g., "Ferrari").
 *               maxWeight:
 *                 type: number
 *                 description: The maximum weight of the vehicle.
 *             required:
 *               - USDot
 *               - type
 *               - maxWeight
 *     responses:
 *       '201':
 *         description: A new car has been created.
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
    carController.createCarForAdmin
  );
/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a car by ID (for admins)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The car details.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   patch:
 *     summary: Update a car by ID (for admins)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               USDot:
 *                 type: integer
 *                 description: The updated USDot identifier for the vehicle.
 *               type:
 *                 type: string
 *                 description: The updated type of the vehicle (e.g., "Ferrari").
 *               maxWeight:
 *                 type: number
 *                 description: The updated maximum weight of the vehicle.
 *             required:
 *               - USDot
 *               - type
 *               - maxWeight
 *     responses:
 *       '200':
 *         description: The car has been updated.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *   delete:
 *     summary: Delete a car by ID (for admins)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: The car has been deleted.
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
    carController.getCar
  )
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.updateCar
  )
  .delete(
    adminController.protect,
    adminController.restrictTo('admin'),
    carController.deleteCar
  );

module.exports = router;
