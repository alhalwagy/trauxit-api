const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validationMidlleware');
const User = require('../../models/userModel');

exports.signupValidator = [
  check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .notEmpty()
    .withMessage('Email is required')
    .isString()
    .withMessage('Email must be a string'),
  check('userName')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
  check('company_id')
    .notEmpty()
    .withMessage('Company ID is required')
    .isString()
    .withMessage('Company ID must be a string'),
  check('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string'),
  check('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be a string'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .isString()
    .withMessage('Password confirmation must be a string'),
  check('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .isString()
    .withMessage('Company name must be a string'),
  validatorMiddleware,
];


