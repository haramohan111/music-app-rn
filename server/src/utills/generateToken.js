const jwt = require('jsonwebtoken');

const generateTokens = (admin) => {


  const accessToken = jwt.sign({ userId: admin._id }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '1h' });

  const refreshToken = jwt.sign({ userId: admin._id },process.env.JWT_REFRESH_TOKEN,{ expiresIn: '7d' });



  return { accessToken, refreshToken };
};

module.exports = generateTokens;