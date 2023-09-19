const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       '201':
 *         description: A new ticket has been created.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('carrier', 'shipper'),
    ticketController.createTicket
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin', 'supporter'),
    ticketController.getAllTechTickets
  );

/**
 * @swagger
 * /tickets/supporter/{id}:
 *   patch:
 *     summary: Reply to a ticket by a supporter
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ticket.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       '200':
 *         description: The ticket has been replied to by the supporter.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *
 *   get:
 *     summary: Get a ticket by ID (for supporters)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ticket.
 *     responses:
 *       '200':
 *         description: A ticket with the specified ID.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/supporter/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('supporter'),
    ticketController.replyTicketBySupporter
  )
  .get(
    adminController.protect,
    adminController.restrictTo('supporter'),
    ticketController.getTicket
  );

/**
 * @swagger
 * /tickets/admin/{id}:
 *   patch:
 *     summary: Reply to a ticket by an admin
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ticket.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       '200':
 *         description: The ticket has been replied to by the admin.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *
 *   get:
 *     summary: Get a ticket by ID (for admins)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ticket.
 *     responses:
 *       '200':
 *         description: A ticket with the specified ID.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/admin/:id')
  .patch(
    adminController.protect,
    adminController.restrictTo('admin'),
    ticketController.replyTicketByAdmin
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    ticketController.getTicket
  );

/**
 * @swagger
 * tags:
 *   name: Tickets
 *
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ticket.
 *     responses:
 *       '200':
 *         description: A ticket with the specified ID.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 */

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('carrier', 'shipper'),
    ticketController.getTicket
  );

module.exports = router;
