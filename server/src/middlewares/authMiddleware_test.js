const { protect } = require('../controllers/authController');

// Wrapper function to catch async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  protect: catchAsync(protect),
};