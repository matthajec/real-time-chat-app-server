const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // get the authorization header
    const authHeader = req.get('Authorization');

    // check if the authorization header is a falsy value
    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }

    // get the actual token
    const token = authHeader.split(' ')[1];

    // initalize a variable to store the decoded token
    let decodedToken;

    // verify and decode the token
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // handle there not being a token
    if (!decodedToken) {
      const error = new Error('Not authenticated');
      error.statusCode(401);
      throw error;
    }

    // set the userId on the request object to the userId from the verified token
    req.userId = decodedToken.userId;

    // go on to the next handler
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

