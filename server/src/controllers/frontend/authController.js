// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const generateTokens = require('../../utills/generateToken');
const moment = require('moment-timezone');

const expireTimeIST = moment().tz('Asia/Kolkata').add(1, 'minutes');
console.log('Cookie will expire at (IST):', expireTimeIST.format('YYYY-MM-DD HH:mm:ss'));
const expireTime = expireTimeIST.toDate(); // Convert to Date object for cookie expiration

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { displayName, email, password, confirmPassword, birthDate, gender } = req.body;

    // 1. Validate input
    // 1. Validate required fields
    if (!displayName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }


    // Check if user exists
    let user = await User.findOne({ email }).select('+password');;
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Compare password 
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }


    // 4. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    // 3. Generate tokens


    // Create user
    user = new User({ name: displayName, email, password, birthDate, gender, refreshToken: 'hj' });
    // 4. Store refresh token in database


    await user.save();

    // // 5. Generate tokens
    // const { accessToken, refreshToken } = generateTokens(user);

    // // 6. Store refresh token in database
    // user.refreshToken = refreshToken;
    await user.save();

    // 5. Set cookies
    // res.cookie('accessToken', accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'development',
    //   sameSite: 'strict',
    //   maxAge: 15 * 60 * 1000 // 15 minutes
    // });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'development',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // });

    res.status(201).json({
      message: "SignUp successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log("hi")
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 5. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 6. Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    //5. Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure:  process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      //expires: expireTime, // Set cookie expiration to 1 minute from now
       maxAge: 60 * 1000 // 1 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      refreshToken,
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.verifyUser = async (req, res) => {
  try {
    console.log("verifyrefreshToken", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { accessToken } = generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:  60 * 1000,
    });

    res.json({ user: { _id: user.id, email: user.email, name: user.name, status: user.status, accessToken } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.webrefreshToken = async (req, res) => {

  try {
    console.log("webrefreshToken", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
       const user = await User.findOne({ 
      _id: decoded.userId,
      refreshToken: refreshToken
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { accessToken } = generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:  60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {

    // Clear refresh token from database
    // console.log("refreshToken", req.cookies.refreshToken);
    // const refreshToken = req.cookies.refreshToken;
    // const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    // const uid = await User.findById(decoded.userId);
    // console.log("uid", uid._id);
    // const user = await User.findOne({ _id: uid._id });
    // console.log("user", user);
    // if (user) {
    //   await User.findByIdAndUpdate(uid, { refreshToken: null });

    // }
    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: false,
      secure: true, // HTTPS only — use false in local dev
      sameSite: 'Strict',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: false,
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });




    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
}
