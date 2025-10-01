const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendSuccess, sendError, sendValidationError, sendUnauthorized } = require('../utils/responseHelper');

const router = express.Router();

// CRITICAL: Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Validation
    if (!name || !email || !password || !company) {
      return sendValidationError(res, 'All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 400, 'DUPLICATE_EMAIL');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      company
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Registration failed', 500, 'INTERNAL_ERROR', error);
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        type: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        type: 'INVALID_CREDENTIALS',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        type: 'ACCOUNT_DEACTIVATED',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        type: 'INVALID_CREDENTIALS',
        timestamp: new Date().toISOString()
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        lastLogin: user.lastLogin
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      return sendUnauthorized(res, 'Account is deactivated');
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Profile error:', error);
    sendError(res, 'Failed to get profile', 500, 'INTERNAL_ERROR', error);
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Verify token and return user data (POST to match test expectations)
router.post('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Invalid or inactive user',
        type: 'INVALID_USER',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      },
      message: 'Token verified successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Token verification failed',
      type: 'VERIFICATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
