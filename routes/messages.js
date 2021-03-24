const express = require('express');

const router = express.Router();

const messagesController = require('../controllers/messages');
const isAuth = require('../middleware/is-auth');

router.get('/', isAuth, messagesController.getMessages);
router.post('/', isAuth, messagesController.postMessage);
router.delete('/', isAuth, messagesController.deleteMessage);

module.exports = router;