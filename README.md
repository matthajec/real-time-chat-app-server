# Real Time Chat App Server
This is the server for a real time chat app with message history and user accounts. It's intended to be paired with [this](https://github.com/matthajec/real-time-chat-app-client) client.

## Framework(s)/Package(s)
* Express
* SocketIO
* Json web token
* bcryptjs
* mongoose/mongodb

## Challenges
* Verifying the socket connection. At first, even though unauthenticated users couldn't get message history or post new messges, they could still snoop in on new messages. To prevent this I created a room in socket.io called 'main-chatroom', which is where all the message activity goes. In order to join this room you need to send a valid JWT to the server. 
An issue with this is that a user with an invalid/expired token can still listen to messages (if they joined with a good token). Code: 
  ```javascript
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
  ```
