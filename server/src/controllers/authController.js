const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const generateTokens = require('../utills/generateToken');

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN
} = require('../config/jwt');


// Helper function to sign tokens
const signToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email, password);

    // 1. Check if admin exists
    const admin = await Admin.findOne({ email }).select('+password');

    //const admin = await Admin.findOne({ email }).select('+passwordHash +refreshToken');
    if (!admin) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // 2. Verify password
    if (await admin.matchPassword(password) === false) {
      console.log('password mismatch');
      return res.status(401).json({ message: "Invalid credentials" });
    }


    // 3. Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    // 4. Store refresh token in database
    admin.refreshToken = refreshToken;
    await admin.save();

    // 5. Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge:  24 * 60 * 60 * 1000, // 1 day,
      path: '/',
   
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 1000,
      path: '/', // 7 days
      
    });

    res.status(200).json({
      message: "Login successful", admin: { _id: admin._id, email: admin.email },
      accessToken, status: true
    });

  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  try {
    // const refreshToken = req.cookies.refreshToken;
    //       const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    //       const uid = decoded.userId
    //   console.log(decoded.userId,"decoded");
    // await Admin.findOneAndUpdate(
    //     { uid },
    //     { $set: { refreshToken: null } }
    //   );

    // 1. Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only — use false in local dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
     
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      
    });

    // 2. Remove refresh token from database if exists
    // if (refreshToken) {

    //}

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    console.log(decoded.userId, "decoded");
    //const user = await User.find(user => user.id === decoded.userId);
    const user = await Admin.findOne({ _id: decoded.userId });

    //console.log(user,"user");
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ admin: { _id: user._id, email: user.email, name: user.name, status: user.status } });
  } catch (error) {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // 1. Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    // 2. Find user in database
    const user = await Admin.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // 3. Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: '15m' }
    );

    // 4. Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 60 * 1000 // 1 minutes
    });

    res.json({ accessToken });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// exports.logout = async (req, res, next) => {
//   try {
//     await Admin.findByIdAndUpdate(req.user.id, { refreshToken: null });

//     res.status(200).json({
//       status: 'success',
//       message: 'Logged out successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };


exports.createDummyAdmin = async () => {


  const dummyAdmin = {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: await bcrypt.hash('123123', 10)
  };

  const existingAdmin = await Admin.findOne({ email: dummyAdmin.email });
  if (!existingAdmin) {
    await Admin.create(dummyAdmin);
    console.log('Dummy admin created:', dummyAdmin.email);
  }
};