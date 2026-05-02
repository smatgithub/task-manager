const ChatMessage = require('../models/ChatMessage');
const ChatGroup = require('../models/ChatGroup');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption utilities
const encryptMessage = (text, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptMessage = (encryptedText, key) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Message search
exports.searchMessages = async (req, res) => {
  try {
    const { query, userId, groupId, limit = 50, offset = 0 } = req.query;
    const currentUserId = req.user.id || req.user.userId;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let searchFilter = {
      $text: { $search: query },
      deleted: { $ne: true }
    };

    if (userId) {
      searchFilter.$or = [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ];
    } else if (groupId) {
      searchFilter.groupId = groupId;
      searchFilter.members = { $in: [currentUserId] };
    }

    const messages = await ChatMessage.find(searchFilter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('replyTo', 'message sender')
      .sort({ score: { $meta: 'textScore' }, timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({ messages, total: messages.length });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ message: 'Failed to search messages' });
  }
};

// Send message with all features
exports.sendMessage = async (req, res) => {
  try {
    // Parse FormData fields (all come as strings)
    const receiverId = req.body.receiverId;
    const groupId = req.body.groupId;
    const message = req.body.message;
    const messageType = req.body.messageType || 'text';
    const replyTo = req.body.replyTo;
    const attachments = req.body.attachments ? JSON.parse(req.body.attachments) : [];
    const encrypted = req.body.encrypted === 'true';
    const encryptionKey = req.body.encryptionKey;

    const currentUserId = req.user.id || req.user.userId;

    // Debug logging
    console.log('Received message data:', {
      receiverId,
      groupId,
      message,
      messageType,
      replyTo,
      attachments,
      encrypted,
      encryptionKey
    });

    // Validate input
    if (!receiverId && !groupId) {
      return res.status(400).json({ message: 'Either receiverId or groupId is required' });
    }

    if (!message && attachments.length === 0) {
      return res.status(400).json({ message: 'Message content or attachments required' });
    }

    // Encrypt message if requested
    let processedMessage = message;
    if (encrypted && encryptionKey && message) {
      processedMessage = encryptMessage(message, encryptionKey);
    }

    const messageData = {
      sender: currentUserId,
      message: processedMessage,
      messageType,
      attachments,
      encrypted,
      encryptionKey: encrypted ? encryptionKey : undefined
    };

    if (receiverId) {
      messageData.receiver = receiverId;
    } else {
      messageData.groupId = groupId;
    }

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    const chatMessage = new ChatMessage(messageData);
    await chatMessage.save();
    console.log('Message saved successfully:', chatMessage._id);

    // Populate sender info
    await chatMessage.populate('sender', 'name email');
    if (receiverId) {
      await chatMessage.populate('receiver', 'name email');
    }
    if (replyTo) {
      await chatMessage.populate('replyTo', 'message sender');
    }

    // Emit message via Socket.IO for real-time delivery
    const io = req.app.get('io');
    if (io && receiverId) {
      const receiverRoom = String(receiverId).trim();
      const senderRoom = String(currentUserId).trim();
      const payload = typeof chatMessage.toObject === 'function'
        ? chatMessage.toObject()
        : chatMessage;
      console.log('Emitting message via Socket.IO:', {
        receiverId: receiverRoom,
        currentUserId: senderRoom,
        messageId: chatMessage._id
      });

      io.to(receiverRoom).emit('receive_message', payload);
      io.to(senderRoom).emit('message_sent', payload);

      const receiverSocket = Array.from(io.sockets.sockets.values())
        .find((s) => String(s.userId) === receiverRoom);
      
      if (receiverSocket) {
        chatMessage.delivered = true;
        await chatMessage.save();
        
        io.to(senderRoom).emit('message_delivered', {
          messageId: chatMessage._id,
          receiverId: receiverRoom
        });
      }
    }

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message, encrypted = false, encryptionKey } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (chatMessage.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    if (chatMessage.deleted) {
      return res.status(400).json({ message: 'Cannot edit deleted message' });
    }

    // Store original message
    chatMessage.originalMessage = chatMessage.message;
    chatMessage.message = encrypted && encryptionKey ? 
      encryptMessage(message, encryptionKey) : message;
    chatMessage.edited = true;
    chatMessage.editedAt = new Date();
    chatMessage.encrypted = encrypted;
    chatMessage.encryptionKey = encrypted ? encryptionKey : undefined;

    await chatMessage.save();
    await chatMessage.populate('sender', 'name email');

    res.json(chatMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (chatMessage.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    if (deleteForEveryone) {
      chatMessage.deleted = true;
      chatMessage.deletedAt = new Date();
      chatMessage.deletedBy = currentUserId;
      chatMessage.message = 'This message was deleted';
    } else {
      // Soft delete - only for sender
      chatMessage.deleted = true;
      chatMessage.deletedAt = new Date();
      chatMessage.deletedBy = currentUserId;
    }

    await chatMessage.save();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove existing reaction from this user
    chatMessage.reactions = chatMessage.reactions.filter(
      reaction => reaction.userId.toString() !== currentUserId
    );

    // Add new reaction
    chatMessage.reactions.push({
      emoji,
      userId: currentUserId
    });

    await chatMessage.save();
    await chatMessage.populate('reactions.userId', 'name');

    res.json(chatMessage);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Failed to add reaction' });
  }
};

// Remove reaction from message
exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    chatMessage.reactions = chatMessage.reactions.filter(
      reaction => reaction.userId.toString() !== currentUserId
    );

    await chatMessage.save();
    res.json(chatMessage);
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Failed to remove reaction' });
  }
};

// Forward message
exports.forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { receiverId, groupId } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    const originalMessage = await ChatMessage.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    if (!receiverId && !groupId) {
      return res.status(400).json({ message: 'Either receiverId or groupId is required' });
    }

    const forwardedMessage = new ChatMessage({
      sender: currentUserId,
      receiver: receiverId,
      groupId: groupId,
      message: originalMessage.message,
      messageType: originalMessage.messageType,
      attachments: originalMessage.attachments,
      forwardedFrom: messageId,
      forwardedBy: currentUserId,
      encrypted: originalMessage.encrypted,
      encryptionKey: originalMessage.encryptionKey
    });

    await forwardedMessage.save();
    await forwardedMessage.populate('sender', 'name email');
    if (receiverId) {
      await forwardedMessage.populate('receiver', 'name email');
    }

    res.status(201).json(forwardedMessage);
  } catch (error) {
    console.error('Error forwarding message:', error);
    res.status(500).json({ message: 'Failed to forward message' });
  }
};

// Pin message
exports.pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has permission to pin (admin or message sender)
    const isAdmin = chatMessage.groupId ? 
      await ChatGroup.findOne({
        _id: chatMessage.groupId,
        'members.userId': currentUserId,
        'members.role': { $in: ['admin', 'moderator'] }
      }) : false;

    if (chatMessage.sender.toString() !== currentUserId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to pin this message' });
    }

    chatMessage.pinned = true;
    chatMessage.pinnedBy = currentUserId;
    chatMessage.pinnedAt = new Date();

    await chatMessage.save();
    res.json(chatMessage);
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ message: 'Failed to pin message' });
  }
};

// Unpin message
exports.unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has permission to unpin
    const isAdmin = chatMessage.groupId ? 
      await ChatGroup.findOne({
        _id: chatMessage.groupId,
        'members.userId': currentUserId,
        'members.role': { $in: ['admin', 'moderator'] }
      }) : false;

    if (chatMessage.pinnedBy.toString() !== currentUserId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to unpin this message' });
    }

    chatMessage.pinned = false;
    chatMessage.pinnedBy = undefined;
    chatMessage.pinnedAt = undefined;

    await chatMessage.save();
    res.json(chatMessage);
  } catch (error) {
    console.error('Error unpinning message:', error);
    res.status(500).json({ message: 'Failed to unpin message' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already read by this user
    const alreadyRead = chatMessage.readBy.some(
      read => read.userId.toString() === currentUserId
    );

    if (!alreadyRead) {
      chatMessage.readBy.push({
        userId: currentUserId,
        readAt: new Date()
      });
      await chatMessage.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

// Export chat history
exports.exportChat = async (req, res) => {
  try {
    const { userId, groupId, format = 'json' } = req.query;
    const currentUserId = req.user.id || req.user.userId;

    let filter = { deleted: { $ne: true } };

    if (userId) {
      filter.$or = [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ];
    } else if (groupId) {
      filter.groupId = groupId;
    }

    const messages = await ChatMessage.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = messages.map(msg => ({
        timestamp: msg.timestamp,
        sender: msg.sender.name,
        message: msg.message,
        messageType: msg.messageType
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=chat-export.csv');
      res.json(csv);
    } else {
      res.json({
        exportDate: new Date(),
        messageCount: messages.length,
        messages: messages
      });
    }
  } catch (error) {
    console.error('Error exporting chat:', error);
    res.status(500).json({ message: 'Failed to export chat' });
  }
};

// Get message threads
exports.getMessageThreads = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id || req.user.userId;

    const parentMessage = await ChatMessage.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const threads = await ChatMessage.find({
      $or: [
        { _id: messageId },
        { threadId: messageId }
      ],
      deleted: { $ne: true }
    })
    .populate('sender', 'name email')
    .sort({ timestamp: 1 });

    res.json(threads);
  } catch (error) {
    console.error('Error fetching message threads:', error);
    res.status(500).json({ message: 'Failed to fetch message threads' });
  }
};
