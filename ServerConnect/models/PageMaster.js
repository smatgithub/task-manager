const mongoose = require('mongoose');

const pageMasterSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true
  },
  pageName: {
    type: String,
    required: true
  },
  pageDescription: {
    type: String,
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['dashboard', 'task-management', 'communication', 'administration', 'profile', 'settings'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiredRole: {
    type: String,
    enum: ['admin', 'hod', 'user', 'any'],
    default: 'any'
  },
  isSystemPage: {
    type: Boolean,
    default: false // System pages cannot be disabled
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PageMaster', pageMasterSchema);
