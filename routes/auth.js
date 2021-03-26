const express = require('express');
const { body, check } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');
const { checkValidation } = require('../middleware');

router.post(
  '/login',
  [
    body('username')
      .custom(async (value, { req }) => {
        // get the info for the account trying to be logged into
        const user = await User.findOne({ username: value });

        // check if there is a user
        if (!user) {
          return Promise.reject('Username not found');
        }

        // save the user in the request so i don't need to query the database again later
        // a weird name is used to prevent future bugs
        req.USER_FOR_LOGGING_IN = user;

        // resolve the promise
        Promise.resolve();
      }).bail(),
    body('password')
      .custom(async (value, { req }) => {
        // make sure we don't try to validate a password for a user that doesn't exist
        if (!req.USER_FOR_LOGGING_IN) {
          return Promise.resolve();
        }

        // check if the password is correct
        const isEqual = await bcrypt.compare(value, req.USER_FOR_LOGGING_IN.password);
        if (!isEqual) {
          return Promise.reject('Inncorrect password');
        }

        Promise.resolve();
      }).bail()
  ],
  checkValidation,
  authController.postLogin
);

router.post(
  '/signup',
  [
    body('username')
      .custom(async value => {
        if (await User.findOne({ normalizedUsername: value.toLowerCase() })) {
          return Promise.reject('Username already exists');
        }
        Promise.resolve();
      }).bail()
      .isLength({ min: 3, max: 22 }).withMessage('Must be between 3 and 22 characters').bail()
      .isAlphanumeric().withMessage('Must only contain letters and numbers').bail(),
    body('password')
      .isLength({ min: 7 }).withMessage('Password must be at least 7 characters')
      .not().isAlpha().withMessage('Must contain a number or special character')
  ],
  checkValidation,
  authController.postSignup
);

module.exports = router;