const Message = require('../models/message');
const User = require('../models/user');

exports.getMessages = async (req, res, next) => {
  try {
    // get the last 100 messages sorted by date
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100).populate('creator', 'username _id');

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
      const statusCode = 404;
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