const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  try {
    //check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};