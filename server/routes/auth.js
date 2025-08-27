const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const validator = require('validator')
const User = require('../models/User')

const router = express.Router()

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    msg: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body.username) {
    req.body.username = validator.escape(req.body.username.trim());
  }
  if (req.body.password) {
    // Don't escape password, but ensure it's a string
    req.body.password = String(req.body.password);
  }
  next();
};

// Validation middleware
const validateLoginInput = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      msg: 'Username and password are required'
    });
  }
  
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({
      success: false,
      msg: 'Username must be between 3 and 30 characters'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      msg: 'Password must be at least 6 characters'
    });
  }
  
  next();
};



// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Login route
router.post('/login', loginLimiter, sanitizeInput, validateLoginInput, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        success: false, 
        msg: 'Account temporarily locked due to too many failed attempts' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, msg: 'Account is inactive' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    await user.updateLastLogin();

    // Create JWT token
    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        credits: user.credits,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
})

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, msg: 'User not found' });
    }
    
    // Check if user is still active
    if (!user.isActive) {
      return res.status(403).json({ success: false, msg: 'Account is inactive' });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ success: false, msg: 'Account is locked' });
    }
    
    // Add user info to request
    req.user = {
      ...decoded,
      credits: user.credits,
      permissions: user.permissions,
      isActive: user.isActive,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, msg: 'Token expired' });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, msg: 'Server error during authentication' });
  }
}

// Verify token route
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        credits: user.credits,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        totalCreditsUsed: user.totalCreditsUsed
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Logout route
router.post('/logout', verifyToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Credit usage route
router.post('/use-credits', verifyToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, msg: 'Invalid credit amount' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    if (user.credits < amount) {
      return res.status(400).json({ success: false, msg: 'Insufficient credits' });
    }
    
    // Use credits
    await user.useCredits(amount, description || 'API usage');
    
    res.json({
      success: true,
      message: 'Credits used successfully',
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('Credit usage error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});



// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }
  next()
}

// Admin route example
router.get('/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    res.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

module.exports = router
module.exports.verifyToken = verifyToken
module.exports.requireAdmin = requireAdmin