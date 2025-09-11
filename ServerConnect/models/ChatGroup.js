const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
}, { _id: false });

const chatGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  members: [memberSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  settings: {
    allowMemberInvites: { type: Boolean, default: true },
    allowFileSharing: { type: Boolean, default: true },
    allowVoiceMessages: { type: Boolean, default: true },
    messageRetentionDays: { type: Number, default: 30 }
  },
  pinnedMessages: [{
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pinnedAt: { type: Date, default: Date.now }
  }],
  theme: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: true
});

// Indexes
chatGroupSchema.index({ 'members.userId': 1 });
chatGroupSchema.index({ inviteCode: 1 });
chatGroupSchema.index({ createdBy: 1 });

// Generate invite code
chatGroupSchema.pre('save', function(next) {
  if (!this.inviteCode && !this.isPrivate) {
    this.inviteCode = Math.random().toString(36).substring(2, 15);
  }
  next();
});

module.exports = mongoose.model('ChatGroup', chatGroupSchema);
