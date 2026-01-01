const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register new hunter (user)
// @access  Public
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('hunterName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Hunter name must be 2-30 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, hunterName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? '[SYSTEM] This email is already registered' 
          : '[SYSTEM] This username is taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      hunterName: hunterName || username
    });

    await user.save();

    // Create progress record for user
    const progress = new Progress({
      user: user._id
    });
    await progress.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '[SYSTEM] Hunter registration complete. Awakening initiated.',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          hunterName: user.hunterName,
          rank: user.rank,
          level: user.level,
          currentXP: user.currentXP,
          stats: user.stats,
          currentPhase: user.currentPhase,
          zonesUnlocked: user.zonesUnlocked
        }
      }
    });

  } catch (error) {
    console.error('[SYSTEM ERROR] Registration failed:', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate hunter
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '[SYSTEM] Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] Invalid credentials. Hunter not found.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] Invalid credentials. Authentication failed.'
      });
    }

    // Update last active
    user.lastActiveDate = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '[SYSTEM] Authentication successful. Welcome back, Hunter.',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          hunterName: user.hunterName,
          rank: user.rank,
          level: user.level,
          currentXP: user.currentXP,
          totalXP: user.totalXP,
          stats: user.stats,
          currentPhase: user.currentPhase,
          currentZone: user.currentZone,
          zonesUnlocked: user.zonesUnlocked,
          gold: user.gold,
          currentStreak: user.currentStreak,
          totalProblemsSolved: user.totalProblemsSolved
        }
      }
    });

  } catch (error) {
    console.error('[SYSTEM ERROR] Login failed:', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Login failed. Please try again.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current hunter data
// @access  Private
const { auth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const progress = await Progress.findOne({ user: req.user._id });

    res.json({
      success: true,
      data: {
        user,
        progress
      }
    });
  } catch (error) {
    console.error('[SYSTEM ERROR] Failed to fetch user:', error);
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Failed to retrieve hunter data.'
    });
  }
});

module.exports = router;
