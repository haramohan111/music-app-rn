// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ error: 'Please authenticate' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    console.log(decoded,"auth decoded");
    // Find user and check if token is still valid
    const user = await User.findOne({
      _id: decoded.userId,
    });

    if (!user) {
      throw new Error();
    }

    // Attach user and token to request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

module.exports = auth;