const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pageAccess: {
    dashboard: {
      type: Boolean,
      default: true
    },
    taskManagement: {
      type: Boolean,
      default: true
    },
    taskCreation: {
      type: Boolean,
      default: true
    },
    taskBoard: {
      type: Boolean,
      default: true
    },
    profileManagement: {
      type: Boolean,
      default: true
    },
    chatAccess: {
      type: Boolean,
      default: true
    },
    adminPages: {
      type: Boolean,
      default: false
    },
    userManagement: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      taskUpdates: {
        type: Boolean,
        default: true
      },
      chatMessages: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
