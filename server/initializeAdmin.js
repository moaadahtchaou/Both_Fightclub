const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

// Secure admin initialization - runs only when explicitly called
const initializeAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fightclub');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      process.exit(0);
    }

    // Get credentials from environment variables or prompt
    const adminUsername = process.env.ADMIN_USERNAME || 'Bunny#9332';
    const adminPassword = process.env.ADMIN_PASSWORD || 'moaad073022+';

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = new User({
      username: adminUsername,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log(`✅ Admin user '${adminUsername}' created successfully!`);
    console.log('🔒 Please delete this script after use for security.');
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Only run if called directly
if (require.main === module) {
  initializeAdmin();
}

module.exports = initializeAdmin;