const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const chatController = require('../controllers/chatController');
const groupChatController = require('../controllers/groupChatController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|mp4|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get chat history between two users
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    console.log('Fetching messages between users:', { currentUserId, targetUserId: userId });

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ timestamp: 1 });

    console.log('Found messages:', messages.length);
    console.log('Messages data:', messages.map(m => ({
      id: m._id,
      message: m.message,
      sender: m.sender.name,
      receiver: m.receiver.name,
      timestamp: m.timestamp
    })));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.userId;
    console.log('Fetching conversations for user:', currentUserId);

    // Get all unique users that the current user has chatted with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email'
          },
          lastMessage: {
            message: '$lastMessage.message',
            timestamp: '$lastMessage.timestamp',
            sender: '$lastMessage.sender'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    console.log('Found conversations:', conversations.length);
    console.log('Conversations data:', conversations.map(c => ({
      userId: c.user._id,
      userName: c.user.name,
      lastMessage: c.lastMessage?.message,
      unreadCount: c.unreadCount
    })));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Mark messages as read
router.put('/messages/:userId/read', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    await ChatMessage.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Get all users for chat
router.get('/users', async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.userId;
    console.log('Fetching users for current user:', currentUserId);
    
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      'name email'
    ).sort({ name: 1 });

    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Message search
router.get('/search', chatController.searchMessages);

// Send message with attachments
router.post('/send', upload.array('attachments', 5), chatController.sendMessage);

// Edit message
router.put('/messages/:messageId', chatController.editMessage);

// Delete message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Message reactions
router.post('/messages/:messageId/reactions', chatController.addReaction);
router.delete('/messages/:messageId/reactions', chatController.removeReaction);

// Forward message
router.post('/messages/:messageId/forward', chatController.forwardMessage);

// Pin/Unpin message
router.post('/messages/:messageId/pin', chatController.pinMessage);
router.delete('/messages/:messageId/pin', chatController.unpinMessage);

// Mark as read
router.put('/messages/:messageId/read', chatController.markAsRead);

// Export chat
router.get('/export', chatController.exportChat);

// Message threads
router.get('/messages/:messageId/threads', chatController.getMessageThreads);

// Group chat routes
router.post('/groups', groupChatController.createGroup);
router.get('/groups', groupChatController.getUserGroups);
router.get('/groups/:groupId', groupChatController.getGroupDetails);
router.post('/groups/:groupId/members', groupChatController.addMember);
router.delete('/groups/:groupId/members/:userId', groupChatController.removeMember);
router.put('/groups/:groupId/settings', groupChatController.updateGroupSettings);
router.post('/groups/join', groupChatController.joinGroupByInvite);
router.post('/groups/:groupId/leave', groupChatController.leaveGroup);
router.get('/groups/:groupId/messages', groupChatController.getGroupMessages);

module.exports = router;
