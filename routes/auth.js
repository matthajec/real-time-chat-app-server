const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');

router.post('/login', authController.postLogin);

router.post(
  '/signup',
  [
    body('username')
      .isLength({ min: 3, max: 32 })
      .isAlphanumeric(),
    body('password')
      .isLength({ min: 7 })
      .not().isAlpha()
  ],
  authController.postSignup
);

module.exports = router;