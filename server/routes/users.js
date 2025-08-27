const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('./auth');

const router = express.Router();

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body.username) {
    req.body.username = validator.escape(req.body.username.trim());
  }
  if (req.body.password) {
    req.body.password = String(req.body.password);
  }
  if (req.body.role) {
    req.body.role = validator.escape(req.body.role.trim());
  }
  next();
};

// Validation middleware for user creation
const validateUserInput = (req, res, next) => {
  const { username, password, role } = req.body;
  
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
      msg: 'Password must be at least 6 characters long'
    });
  }
  
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      msg: 'Role must be either "user" or "admin"'
    });
  }
  
  next();
};

// GET /api/users - Get all users (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// POST /api/users/register - Public user registration
router.post('/register', sanitizeInput, validateUserInput, async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    
    // Only allow 'user' role for public registration
    const userRole = 'user';
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role: userRole,
      credits: 100, // Default credits for new users
      isActive: true
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        credits: newUser.credits,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// POST /api/users/create - Create new user (admin only)
router.post('/create', verifyToken, requireAdmin, sanitizeInput, validateUserInput, async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      credits: role === 'admin' ? 1000 : 100, // Give admins more credits
      isActive: true
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      msg: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        credits: newUser.credits,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// GET /api/users/:id - Get specific user (admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', verifyToken, requireAdmin, sanitizeInput, async (req, res) => {
  try {
    const { username, role, credits, isActive } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (typeof credits === 'number') updateData.credits = credits;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    res.json({
      success: true,
      msg: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// PUT /api/users/:id/password - Reset user password (admin only)
router.put('/:id/password', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        msg: 'New password must be at least 6 characters long'
      });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    res.json({
      success: true,
      msg: 'Password updated successfully',
      user
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// PUT /api/users/:id/credits - Modify user credits (admin only)
router.put('/:id/credits', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { action, amount } = req.body;
    
    if (!action || !['set', 'add', 'subtract'].includes(action)) {
      return res.status(400).json({
        success: false,
        msg: 'Action must be "set", "add", or "subtract"'
      });
    }
    
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        msg: 'Amount must be a positive number'
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    const previousCredits = user.credits;
    let updatedUser;
    
    switch (action) {
      case 'set':
        // For set action, we need to calculate the difference and use appropriate method
        const difference = amount - user.credits;
        if (difference > 0) {
          await user.addCredits(difference, `Admin set credits to ${amount}`);
        } else if (difference < 0) {
          await user.useCredits(Math.abs(difference), `Admin set credits to ${amount}`);
        }
        break;
      case 'add':
        await user.addCredits(amount, `Admin added ${amount} credits`);
        break;
      case 'subtract':
        // Use the useCredits method but ensure we don't go below 0
        const creditsToSubtract = Math.min(amount, user.credits);
        if (creditsToSubtract > 0) {
          await user.useCredits(creditsToSubtract, `Admin subtracted ${creditsToSubtract} credits`);
        }
        break;
    }
    
    // Refresh user data after operations
    updatedUser = await User.findById(req.params.id).select('-password');
    
    res.json({
      success: true,
      msg: `Credits ${action}ed successfully`,
      user: updatedUser,
      previousCredits: previousCredits,
      newCredits: updatedUser.credits
    });
  } catch (error) {
    console.error('Modify credits error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    res.json({
      success: true,
      msg: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

module.exports = router;