const Ticket = require('../models/ticketModel');
const User = require('../models/userModel'); // Import the User model
const AppError = require('../utils/appError'); // Import custom error handling utility
const catchAsync = require('../utils/catchAsync'); // Import utility for catching async errors

exports.createTicket = catchAsync(async (req, res, next) => {
  req.body.idUser = req.user.id;

  const newTicket = await Ticket.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      newTicket,
    },
  });
});

exports.replyTicketBySupporter = catchAsync(async (req, res, next) => {
  const ticketCheck = await Ticket.findById(req.params.id);
  if (ticketCheck.type === 'technical') {
    return next(
      new AppError(
        'Invalid To perform Technical Action in this Ticket. Please take it to admins.'
      )
    );
  }
  req.body.idSupport = req.admin.id;
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

exports.replyTicketByAdmin = catchAsync(async (req, res, next) => {
  req.body.idAdmin = req.admin.id;
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

exports.getAllTechTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({});

  res.status(200).json({
    status: 'success',
    result: tickets.length,
    data: {
      tickets,
    },
  });
});

exports.replyTicketByUser = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  ticket.user_reply = req.body.user_reply;

  await ticket.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});
