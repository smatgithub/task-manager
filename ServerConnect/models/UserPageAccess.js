const mongoose = require('mongoose');

const userPageAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  hasAccess: {
    type: Boolean,
    default: false
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grantedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure unique combination of user and page
userPageAccessSchema.index({ userId: 1, pageId: 1 }, { unique: true });

module.exports = mongoose.model('UserPageAccess', userPageAccessSchema);
