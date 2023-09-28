const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createCarValidator = [
  check('lisence')
    .isLength({ min: 3 })
    .withMessage('Too short lisence ')
    .isLength({ max: 32 })
    .withMessage('Too long lisence '),
  check('USDot')
    .notEmpty()
    .withMessage('USDot is required.')
    .isLength({ min: 3 })
    .withMessage('Too short USDot')
    .isLength({ max: 32 })
    .withMessage('Too long USDot'),
  check('type')
    .notEmpty()
    .withMessage('Type is required.')
    .isLength({ min: 3 })
    .withMessage('Too short type')
    .isLength({ max: 32 })
    .withMessage('Too long type'),

  validatorMiddleware,
];
