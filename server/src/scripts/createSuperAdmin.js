const mongoose = require('mongoose');
const User = require('../models/User');
const db = require('../config/db');

const createSuperAdmin = async () => {
  try {
    await db();
    const superAdmin = {
      username: 'Bunny#9332',
      password: 'moaad073022+',
      role: 'admin',
    };
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Superadmin already exists.');
      return;
    }
    const user = new User(superAdmin);
    await user.save();
    console.log('Superadmin created successfully.');
  } catch (error) {
    console.error(error.message);
  } finally {
    mongoose.connection.close();
  }
};

createSuperAdmin();