const io = require('../socket');

const Message = require('../models/message');
const User = require('../models/user');

exports.getMessages = async (req, res, next) => {
  try {
    // get the last 100 messages sorted by date
    const messages = await Message
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('creator', 'username _id');

    // send the messages
    res.status(200).json({
      message: 'Succesfully fetched messages',
      data: messages
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postMessage = async (req, res, next) => {
  try {
    // find the creator of the message
    const creator = await User.findOne({ _id: req.userId });

    // make sure the user exists
    if (!creator) {
      const error = new Error('User does not exist');
      error.statusCode = 404;
      throw error;
    }

    // create a new message
    const message = new Message({
      message: req.body.message,
      creator: creator._id
    });

    // save the new message
    const savedMessage = await message.save();

    // add the objectId of the message to the creators messages
    creator.messages.push(savedMessage._id);

    // save the creator
    await creator.save();

    // populate the creator field
    const populatedMessage = await Message.findById(savedMessage._id).populate('creator', 'username _id');

    // emit the event using the websocket to the main-chatroom
    io.getIO().to('main-chatroom').emit('messages', {
      action: 'post',
      message: populatedMessage
    });

    // send a response
    res.status(200).json({
      message: 'Sent Message',
      data: req.body.message
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    // extract the message id from the request body
    const messageId = req.body.messageId;

    // find the message in the database
    const message = await Message.findById(messageId);

    // check if the request came from the creator of the message
    if (message.creator.toString() !== req.userId.toString()) {
      const error = new Error('You do not own this message');
      error.statusCode = 401;
      throw error;
    }

    // remove the message from the database
    await Message.findByIdAndRemove(messageId);

    // find the user who's deleting a message
    const user = await User.findById(req.userId);

    // find the index of the message in the array of messages
    const messageIndex = user.messages.findIndex(_id => _id.toString === messageId);

    // remove the message
    user.messages.splice(messageIndex, 1);

    // save the user back to the database with the deleted message removed
    await user.save();

    // emit the event using the websocket
    io.getIO().to('main-chatroom').emit('messages', {
      action: 'delete',
      messageId: messageId
    });

    res.status(200).json({
      message: 'Deleted message',
      data: message
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};