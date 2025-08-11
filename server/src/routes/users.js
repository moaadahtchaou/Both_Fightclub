const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper functions to handle both database and memory storage
const getStorageInfo = () => {
  // Access the global variables from server.js
  const isUsingMemory = global.isUsingMemoryStorage || false;
  const memoryUsers = global.memoryUsers || [];
  return { isUsingMemory, memoryUsers };
};

const findUser = async (query) => {
  const { isUsingMemory, memoryUsers } = getStorageInfo();
  
  if (isUsingMemory) {
    if (query.username) {
      return memoryUsers.find(user => user.username === query.username);
    }
    return memoryUsers.find(user => user._id === query._id);
  } else {
    return await User.findOne(query);
  }
};

const findAllUsers = async () => {
  const { isUsingMemory, memoryUsers } = getStorageInfo();
  
  if (isUsingMemory) {
    return memoryUsers.map(user => ({
      _id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }));
  } else {
    return await User.find().select('-password').sort({ createdAt: -1 });
  }
};

const saveUser = async (userData) => {
  const { isUsingMemory, memoryUsers } = getStorageInfo();
  
  if (isUsingMemory) {
    const newUser = {
      _id: 'user-' + Date.now(),
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user',
      createdAt: new Date()
    };
    memoryUsers.push(newUser);
    return newUser;
  } else {
    const user = new User(userData);
    await user.save();
    return user;
  }
};

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user = await findUser({ username });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await saveUser({
      username,
      password: hashedPassword,
      role: role || 'user'
    });

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      'jwtSecret',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await findUser({ username });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      'jwtSecret',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await findAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;