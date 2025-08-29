const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Credit System Fields
  credits: {
    type: Number,
    default: 100, // Starting credits for new users
    min: 0
  },
  totalCreditsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  creditHistory: [{
    action: {
      type: String,
      enum: ['used', 'added', 'refunded'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    remainingCredits: {
      type: Number,
      required: true
    }
  }],

  // Security Fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin', 'premium_features']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Credit Management Methods
userSchema.methods.useCredits = function(amount, description) {
  if (this.credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  this.credits -= amount;
  this.totalCreditsUsed += amount;
  
  this.creditHistory.push({
    action: 'used',
    amount: amount,
    description: description,
    remainingCredits: this.credits
  });
  
  return this.save();
};

userSchema.methods.addCredits = function(amount, description) {
  this.credits += amount;
  
  this.creditHistory.push({
    action: 'added',
    amount: amount,
    description: description,
    remainingCredits: this.credits
  });
  
  return this.save();
};



// Security Methods
userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 10 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 1000 }; // 2 minutes
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Permission Methods
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'admin';
};

userSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users with sufficient credits
userSchema.statics.findWithCredits = function(minCredits = 1) {
  return this.find({ credits: { $gte: minCredits }, isActive: true });
};

module.exports = mongoose.model('User', userSchema);