const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.postLogin = async (req, res, next) => {
  try {
    // extract username and password from the request body
    const username = req.body.username;
    const password = req.body.password;

    // find the user with the given username
    const user = await User.findOne({ username: username });

    // check to see if the user exists
    if (!user) {
      const error = new Error('An account with that username could not be found');
      error.statusCode = 404;
      throw error;
    }

    // check if the password hash from the user matches the one in the database
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }

    // generate a token
    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // give the user their token
    res.status(200).json({ message: "Logged in successfully", token: token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    //check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    // extract username and password from the request body
    const username = req.body.username;
    const password = req.body.password;

    // throw an error if the username already exists
    if (await User.findOne({ username: username })) {
      const error = new Error('Username already exists.');
      error.statusCode = 422;
      throw error;
    }

    // hash the password
    const hashedPw = await bcrypt.hash(password, 12);

    // create a new user
    const user = new User({
      username: username,
      password: hashedPw
    });

    // save the new user
    const savedUser = await user.save();

    // send a response
    res.status(201).json({ message: 'User created.', userId: savedUser._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};