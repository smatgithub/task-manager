const ChatGroup = require('../models/ChatGroup');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members = [], isPrivate = false } = req.body;
    const currentUserId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const groupData = {
      name,
      description,
      createdBy: currentUserId,
      isPrivate,
      members: [
        { userId: currentUserId, role: 'admin' },
        ...members.map(memberId => ({ userId: memberId, role: 'member' }))
      ]
    };

    const chatGroup = new ChatGroup(groupData);
    await chatGroup.save();

    await chatGroup.populate('members.userId', 'name email');
    await chatGroup.populate('createdBy', 'name email');

    res.status(201).json(chatGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const groups = await ChatGroup.find({
      'members.userId': currentUserId
    })
    .populate('members.userId', 'name email')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

// Get group details
exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findOne({
      _id: groupId,
      'members.userId': currentUserId
    })
    .populate('members.userId', 'name email')
    .populate('createdBy', 'name email')
    .populate('pinnedMessages.messageId');

    if (!group) {
      return res.status(404).json({ message: 'Group not found or access denied' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Failed to fetch group details' });
  }
};

// Add member to group
exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if current user is admin or moderator
    const currentUserMember = group.members.find(
      member => member.userId.toString() === currentUserId
    );
    
    if (!currentUserMember || !['admin', 'moderator'].includes(currentUserMember.role)) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      member => member.userId.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push({ userId, role: 'member' });
    await group.save();

    await group.populate('members.userId', 'name email');

    res.json(group);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
};

// Remove member from group
exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if current user is admin or moderator
    const currentUserMember = group.members.find(
      member => member.userId.toString() === currentUserId
    );
    
    if (!currentUserMember || !['admin', 'moderator'].includes(currentUserMember.role)) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    // Cannot remove the creator
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove group creator' });
    }

    group.members = group.members.filter(
      member => member.userId.toString() !== userId
    );
    await group.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

// Update group settings
exports.updateGroupSettings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, settings, theme } = req.body;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if current user is admin
    const currentUserMember = group.members.find(
      member => member.userId.toString() === currentUserId
    );
    
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update group settings' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (settings) group.settings = { ...group.settings, ...settings };
    if (theme) group.theme = theme;

    await group.save();
    await group.populate('members.userId', 'name email');

    res.json(group);
  } catch (error) {
    console.error('Error updating group settings:', error);
    res.status(500).json({ message: 'Failed to update group settings' });
  }
};

// Join group by invite code
exports.joinGroupByInvite = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    if (group.isPrivate) {
      return res.status(400).json({ message: 'Group is private' });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      member => member.userId.toString() === currentUserId
    );

    if (existingMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push({ userId: currentUserId, role: 'member' });
    await group.save();

    await group.populate('members.userId', 'name email');

    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Failed to join group' });
  }
};

// Leave group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.userId;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Cannot leave if you're the creator
    if (group.createdBy.toString() === currentUserId) {
      return res.status(400).json({ message: 'Group creator cannot leave. Transfer ownership first.' });
    }

    group.members = group.members.filter(
      member => member.userId.toString() !== currentUserId
    );
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Failed to leave group' });
  }
};

// Get group messages
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const currentUserId = req.user.userId;

    // Check if user is member of group
    const group = await ChatGroup.findOne({
      _id: groupId,
      'members.userId': currentUserId
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or access denied' });
    }

    const messages = await ChatMessage.find({
      groupId,
      deleted: { $ne: true }
    })
    .populate('sender', 'name email')
    .populate('replyTo', 'message sender')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
};
