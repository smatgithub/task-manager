const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  // Application-wide feature controls
  features: {
    chatEnabled: {
      type: Boolean,
      default: true
    },
    taskCreationEnabled: {
      type: Boolean,
      default: true
    },
    userRegistrationEnabled: {
      type: Boolean,
      default: true
    },
    oauthEnabled: {
      google: {
        type: Boolean,
        default: true
      },
      microsoft: {
        type: Boolean,
        default: true
      }
    },
    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Application is currently under maintenance. Please try again later.'
      }
    }
  },
  // Security settings
  security: {
    sessionTimeout: {
      type: Number, // in minutes
      default: 480 // 8 hours
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      }
    }
  },
  // Application configuration
  appConfig: {
    maxFileUploadSize: {
      type: Number, // in MB
      default: 10
    },
    allowedFileTypes: {
      type: [String],
      default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt']
    },
    taskAutoArchiveDays: {
      type: Number,
      default: 90
    },
    chatMessageRetentionDays: {
      type: Number,
      default: 365
    }
  },
  // Last updated by admin
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
appSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('AppSettings', appSettingsSchema);
