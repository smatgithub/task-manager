const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const fileAttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String } // For images
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatGroup'
  },
  message: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice', 'system'],
    default: 'text'
  },
  // New features
  reactions: [reactionSchema],
  attachments: [fileAttachmentSchema],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalMessage: {
    type: String
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  forwardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: {
    type: Date
  },
  encrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String
  },
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
chatMessageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
chatMessageSchema.index({ receiver: 1, read: 1 });
chatMessageSchema.index({ groupId: 1, timestamp: -1 });
chatMessageSchema.index({ message: 'text' }); // For text search
chatMessageSchema.index({ threadId: 1 });
chatMessageSchema.index({ pinned: 1, groupId: 1 });
chatMessageSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
