const slowDown = require('express-slow-down');

module.exports = (time, delayAfter, delayTime) => {
  return slowDown({
    windowMs: time,
    delayAfter: delayAfter,
    delayTime: delayTime
  });
};