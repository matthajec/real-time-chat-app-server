const rateLimit = require('express-rate-limit');

module.exports = (time, limit) => {
  return rateLimit({
    windowMs: time,
    max: limit
  });
};