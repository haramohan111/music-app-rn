const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware_test');

router.post('/admin/login', authController.login);
// router.post('/refresh-token', authController.refreshToken);
// router.post('/logout', authMiddleware.protect, authController.logout);

// Protected route example
router.get('/dashboard', authMiddleware.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: `Welcome ${req.user.name}`,
      admin: req.user,
    },
  });
});

module.exports = router;