const PageMaster = require('../models/PageMaster');
const UserPageAccess = require('../models/UserPageAccess');
const User = require('../models/User');

// Initialize page master with default pages
const initializePageMaster = async () => {
  try {
    const existingPages = await PageMaster.countDocuments();
    if (existingPages === 0) {
      const defaultPages = [
        {
          pageId: 'dashboard',
          pageName: 'Dashboard',
          pageDescription: 'Main dashboard with overview and statistics',
          pageUrl: '/dashboard',
          category: 'dashboard',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 1
        },
        {
          pageId: 'taskBoard',
          pageName: 'Task Board',
          pageDescription: 'View and manage task board',
          pageUrl: '/UserTasksBoard',
          category: 'task-management',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 2
        },
        {
          pageId: 'taskCreation',
          pageName: 'Task Creation',
          pageDescription: 'Create new tasks',
          pageUrl: '/tasksForm',
          category: 'task-management',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 3
        },
        {
          pageId: 'profile',
          pageName: 'User Profile',
          pageDescription: 'Manage user profile information',
          pageUrl: '/profile',
          category: 'profile',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 4
        },
        {
          pageId: 'chat',
          pageName: 'Chat',
          pageDescription: 'Access chat features',
          pageUrl: '/chat',
          category: 'communication',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 5
        },
        {
          pageId: 'userManagement',
          pageName: 'User Management',
          pageDescription: 'Manage users and their access',
          pageUrl: '/users',
          category: 'administration',
          requiredRole: 'admin',
          isSystemPage: false,
          sortOrder: 6
        },
        {
          pageId: 'adminTaskReview',
          pageName: 'Admin Task Review',
          pageDescription: 'Review and manage all tasks',
          pageUrl: '/admin',
          category: 'administration',
          requiredRole: 'admin',
          isSystemPage: false,
          sortOrder: 7
        },
        {
          pageId: 'userSettings',
          pageName: 'User Settings',
          pageDescription: 'Personal settings and preferences',
          pageUrl: '/settings',
          category: 'settings',
          requiredRole: 'any',
          isSystemPage: true,
          sortOrder: 8
        },
        {
          pageId: 'adminSettings',
          pageName: 'Admin Settings',
          pageDescription: 'Application settings and configuration',
          pageUrl: '/admin-settings',
          category: 'settings',
          requiredRole: 'admin',
          isSystemPage: false,
          sortOrder: 9
        },
        {
          pageId: 'userAccessControl',
          pageName: 'User Access Control',
          pageDescription: 'Control user page access permissions',
          pageUrl: '/user-access-control',
          category: 'administration',
          requiredRole: 'admin',
          isSystemPage: false,
          sortOrder: 10
        }
      ];

      await PageMaster.insertMany(defaultPages);
      console.log('Page master initialized with default pages');
    }
  } catch (error) {
    console.error('Error initializing page master:', error);
  }
};

// Get all pages
const getAllPages = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const pages = await PageMaster.find().sort({ sortOrder: 1, pageName: 1 });
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get user access control list
const getUserAccessControl = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId } = req.params;
    
    // Get all pages
    const pages = await PageMaster.find({ isActive: true }).sort({ sortOrder: 1 });
    
    // Get user's current access
    const userAccess = await UserPageAccess.find({ userId }).populate('grantedBy', 'name email');
    
    // Create access map
    const accessMap = {};
    userAccess.forEach(access => {
      accessMap[access.pageId] = {
        hasAccess: access.hasAccess,
        grantedBy: access.grantedBy,
        grantedAt: access.grantedAt,
        notes: access.notes
      };
    });

    // Get user details
    const user = await User.findById(userId).select('name email role department');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine pages with access status
    const pagesWithAccess = pages.map(page => ({
      ...page.toObject(),
      hasAccess: accessMap[page.pageId]?.hasAccess || false,
      grantedBy: accessMap[page.pageId]?.grantedBy || null,
      grantedAt: accessMap[page.pageId]?.grantedAt || null,
      notes: accessMap[page.pageId]?.notes || ''
    }));

    res.json({
      user,
      pages: pagesWithAccess
    });
  } catch (error) {
    console.error('Error fetching user access control:', error);
    res.status(500).json({ error: 'Failed to fetch user access control' });
  }
};

// Update user page access
const updateUserPageAccess = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId, pageId, hasAccess, notes } = req.body;

    // Check if page exists
    const page = await PageMaster.findOne({ pageId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create access record
    const accessRecord = await UserPageAccess.findOneAndUpdate(
      { userId, pageId },
      {
        hasAccess,
        grantedBy: req.user.id,
        grantedAt: new Date(),
        notes: notes || ''
      },
      { upsert: true, new: true }
    ).populate('grantedBy', 'name email');

    res.json(accessRecord);
  } catch (error) {
    console.error('Error updating user page access:', error);
    res.status(500).json({ error: 'Failed to update user page access' });
  }
};

// Get all users with their access summary
const getAllUsersAccessSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const users = await User.find({}, 'name email role department createdAt').sort({ name: 1 });
    
    const usersWithAccess = await Promise.all(
      users.map(async (user) => {
        const accessCount = await UserPageAccess.countDocuments({ 
          userId: user._id, 
          hasAccess: true 
        });
        const totalPages = await PageMaster.countDocuments({ isActive: true });
        
        return {
          ...user.toObject(),
          accessCount,
          totalPages,
          accessPercentage: totalPages > 0 ? Math.round((accessCount / totalPages) * 100) : 0
        };
      })
    );

    res.json(usersWithAccess);
  } catch (error) {
    console.error('Error fetching users access summary:', error);
    res.status(500).json({ error: 'Failed to fetch users access summary' });
  }
};

// Bulk update user access
const bulkUpdateUserAccess = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId, pageAccesses } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update multiple page accesses
    const updatePromises = pageAccesses.map(access => 
      UserPageAccess.findOneAndUpdate(
        { userId, pageId: access.pageId },
        {
          hasAccess: access.hasAccess,
          grantedBy: req.user.id,
          grantedAt: new Date(),
          notes: access.notes || ''
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({ message: 'User access updated successfully' });
  } catch (error) {
    console.error('Error bulk updating user access:', error);
    res.status(500).json({ error: 'Failed to update user access' });
  }
};

// Check if user has access to a specific page
const checkUserPageAccess = async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user.id;

    // Check if page exists and is active
    const page = await PageMaster.findOne({ pageId, isActive: true });
    if (!page) {
      return res.status(404).json({ error: 'Page not found or inactive' });
    }

    // Check role requirement
    if (page.requiredRole !== 'any' && req.user.role !== page.requiredRole) {
      return res.json({ hasAccess: false, reason: 'Insufficient role' });
    }

    // Check specific access permission
    const accessRecord = await UserPageAccess.findOne({ userId, pageId });
    const hasAccess = accessRecord ? accessRecord.hasAccess : page.requiredRole === 'any';

    res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking user page access:', error);
    res.status(500).json({ error: 'Failed to check page access' });
  }
};

module.exports = {
  initializePageMaster,
  getAllPages,
  getUserAccessControl,
  updateUserPageAccess,
  getAllUsersAccessSummary,
  bulkUpdateUserAccess,
  checkUserPageAccess
};
