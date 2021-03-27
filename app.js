require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { json } = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

app.use(json({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/messages', require('./routes/messages'));
app.use('/auth', require('./routes/auth'));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || 'An unknown error occured...';
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      socket.on('authorization', (_token) => { // listen on authorization channel
        try {

          // handle no token being sent
          if (!_token) {
            const error = new Error('no token provided');
            error.statusCode = 401;
            throw error;
          }

          // extract the actual jwt
          const token = _token.split(' ')[1];

          // test the jwt for validity
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

          // handle invalid token
          if (!decodedToken) {
            const error = new Error('invalid token');
            error.statusCode = 401;
            throw error;
          }

          // join the chatroom
          socket.join('main-chatroom');

          // tell the client they've joined the chatroom
          socket.emit('authorization', { status: 'joined' });
        } catch (err) {
          // send the error to the client
          socket.emit('authorization', { status: 'error', error: err });
        }
      });
    });
  })
  .catch(err => {
    throw err;
  });
