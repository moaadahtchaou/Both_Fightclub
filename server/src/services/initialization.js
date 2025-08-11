const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const memoryStorage = require('./memoryStorage');

class InitializationService {
  constructor() {
    this.adminCredentials = {
      username: 'Bunny#9332',
      password: 'moaad073022+'
    };
  }

  async initialize() {
    try {
      console.log('🔄 Attempting to connect to database...');
      
      // Set a timeout for database connection
      const dbPromise = connectDB();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      );
      
      await Promise.race([dbPromise, timeoutPromise]);
      console.log('✅ Database connected successfully');
      
      // Wait a moment for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.createAdminUser();
      
    } catch (error) {
      console.error('❌ Database initialization error:', error.message);
      console.log('⚠️  Switching to in-memory storage for testing');
      console.log('💡 Make sure MongoDB is running on mongodb://localhost:27017 for persistent storage');
      
      await this.initializeMemoryStorage();
    }
  }

  async createAdminUser() {
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash(this.adminCredentials.password, 12);
      const adminUser = new User({
        username: this.adminCredentials.username,
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log(`✅ Admin user created successfully: ${this.adminCredentials.username}`);
      console.log(`🔑 You can now login with username: ${this.adminCredentials.username}`);
    } else {
      console.log('✅ Admin user already exists: ' + existingAdmin.username);
    }
  }

  async initializeMemoryStorage() {
    memoryStorage.activate();
    
    const hashedPassword = await bcrypt.hash(this.adminCredentials.password, 12);
    const adminUser = {
      _id: 'admin-001',
      username: this.adminCredentials.username,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };
    
    memoryStorage.addUser(adminUser);
    console.log(`✅ Admin user created in memory: ${this.adminCredentials.username}`);
    console.log(`🔑 You can now login with username: ${this.adminCredentials.username}`);
    console.log('📊 Using in-memory storage - data will not persist after restart');
  }
}

module.exports = new InitializationService();