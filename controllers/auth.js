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
    const user = req.temp.user;


    // generate a token
    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // give the user their token
    res.status(200).json({ message: "Logged in successfully", token: 'Bearer ' + token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    // extract username and password from the request body
    const username = req.body.username;
    const password = req.body.password;

    // hash the password
    const hashedPw = await bcrypt.hash(password, 12);

    // create a new user
    const user = new User({
      username: username,
      normalizedUsername: username.toLowerCase(),
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