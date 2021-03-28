const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const messagesController = require('../controllers/messages');
const { isAuth, slowDown, rateLimit, checkValidation } = require('../middleware');

router.get(
  '/',
  rateLimit(1000 * 60, 10), // limit message history GET requests to 10 a minute
  isAuth,
  messagesController.getMessages
);

router.post(
  '/',
  slowDown(1000 * 60 * 2, 29, 250), // slow down new messages by 200ms per message after 29 messages in 2 minutes
  isAuth,
  body('message')
    .not().isEmpty().withMessage('Message cannot be empty'),
  checkValidation,
  messagesController.postMessage,
);

router.delete(
  '/',
  rateLimit(1000 * 60, 200), // limit message DELETE requests to 200 a minute
  isAuth,
  messagesController.deleteMessage
);

module.exports = router;