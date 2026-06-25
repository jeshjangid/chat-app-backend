import cloudinary from '../lib/cloudinary.js';
import { generateAccessToken, generateRefreshToken } from '../lib/utils.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// const cookieOptions = {
//   httpOnly: true,
//   sameSite: 'lax',
//   secure: process.env.NODE_ENV === 'production',
// };

const cookieOptions = {
  httpOnly: true,
  // Change 'lax' to 'none' for cross-site cookie transfers in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  secure: process.env.NODE_ENV === 'production',
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

// sign up new user
export const signUp = async (req, res) => {
  try {
    const { email, password, fullName, bio } = req.body;

    if (!email || !password || !fullName || !bio) {
      return res.status(400).json({
        message: 'Please fill all required fields',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      bio,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
const refreshToken = generateRefreshToken(newUser._id);

setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      userData: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

// login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please fill all required fields',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      userData: user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed',
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export const logout = (req, res) => {
  clearAuthCookies(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// controller to check user authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};