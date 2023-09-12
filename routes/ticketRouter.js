const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('carrier', 'shipper'),
    ticketController.createTicket
  )
  .get(
    adminController.protect,
    adminController.restrictTo('admin'),
    ticketController.getAllTechTickets
  );

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

router
  .route('/:id')
  .post(
    authController.protect,
    authController.restrictTo('carrier', 'shipper'),
    ticketController.createTicket
  )
  .get(
    authController.protect,
    authController.restrictTo('carrier', 'shipper'),
    ticketController.getTicket
  );

  
module.exports = router;
