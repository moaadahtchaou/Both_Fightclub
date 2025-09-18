const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['youtube', 'instagram', 'facebook', 'direct_upload', 'url_import', 'other']
  },
  sourceUrl: {
    type: String,
    default: null
  },
  youtubeVideoId: {
    type: String,
    default: null,
    index: true // Index for faster duplicate detection
  },
  // Added for Instagram/Facebook deduplication
  igfbvideoId: {
    type: String,
    default: null,
    index: true // Index for IG/FB duplicate detection
  },
  sharedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadUrl: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
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
audioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find public audio files
audioSchema.statics.findPublic = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username');
};

// Static method to find recent audio files
audioSchema.statics.findRecent = function(limit = 10) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username');
};

// Compound index to speed up global IG/FB duplicate lookups
audioSchema.index({ source: 1, igfbvideoId: 1 });

module.exports = mongoose.model('Audio', audioSchema);