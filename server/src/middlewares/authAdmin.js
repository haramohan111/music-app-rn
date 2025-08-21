// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    // 1. Get access token from cookies
    const accessToken = req.cookies.accessToken;
    console.log("Cookies from request:", req.cookies);

    if (!accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // 2. Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};