const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  [
   body('username').trim().notEmpty().withMessage('Username is required').escape(),
   body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must include a number')
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

module.exports = router;