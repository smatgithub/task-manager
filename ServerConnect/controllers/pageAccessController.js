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
    const pagesWithAccess = pages.map(page => {
      let hasAccess = false;
      
      // First check if user has sufficient role for the page
      const hasRequiredRole = page.requiredRole === 'any' || user.role === page.requiredRole;
      
      if (hasRequiredRole) {
        // Check if there's an explicit access record
        if (accessMap[page.pageId]) {
          hasAccess = accessMap[page.pageId].hasAccess;
        } else {
          // No explicit record - use default based on page type
          if (page.isSystemPage && page.requiredRole === 'any') {
            hasAccess = true; // System pages with 'any' role are accessible by default
          } else {
            hasAccess = false; // All other pages require explicit permission
          }
        }
      } else {
        // User doesn't have required role
        hasAccess = false;
      }
      
      return {
        ...page.toObject(),
        hasAccess,
        grantedBy: accessMap[page.pageId]?.grantedBy || 
                   (user.role === 'admin' ? user : 
                    (page.isSystemPage && page.requiredRole === 'any' ? user : null)),
        grantedAt: accessMap[page.pageId]?.grantedAt || 
                   (user.role === 'admin' ? new Date() : 
                    (page.isSystemPage && page.requiredRole === 'any' ? new Date() : null)),
        notes: accessMap[page.pageId]?.notes || 
               (user.role === 'admin' ? 'Admin access - full permissions' : 
                (page.isSystemPage && page.requiredRole === 'any' ? 'System page - default access' : '')),
        groupName: page.groupName || 'Other'
      };
    });

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

    const { userId } = req.params;
    const { pageId, hasAccess, notes } = req.body;

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

    // Validate role compatibility for permission assignment
    if (hasAccess && page.requiredRole !== 'any' && user.role !== page.requiredRole) {
      return res.status(400).json({ 
        error: 'Cannot grant access: User role insufficient',
        details: {
          userRole: user.role,
          requiredRole: page.requiredRole,
          pageName: page.pageName,
          suggestion: `User needs to be escalated to '${page.requiredRole}' role first`
        }
      });
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
        const totalPages = await PageMaster.countDocuments({ isActive: true });
        
        // Calculate access count based on role and individual permissions
        const allPages = await PageMaster.find({ isActive: true });
        const userAccess = await UserPageAccess.find({ userId: user._id });
        
        // Create access map
        const accessMap = {};
        userAccess.forEach(access => {
          accessMap[access.pageId] = access.hasAccess;
        });
        
        let accessCount = 0;
        allPages.forEach(page => {
          let hasAccess = false;
          
          // First check if user has sufficient role for the page
          const hasRequiredRole = page.requiredRole === 'any' || user.role === page.requiredRole;
          
          if (hasRequiredRole) {
            // Check if there's an explicit access record
            if (accessMap[page.pageId] !== undefined) {
              // Use explicit permission (true or false)
              hasAccess = accessMap[page.pageId];
            } else {
              // No explicit record - use default based on page type
              if (page.isSystemPage && page.requiredRole === 'any') {
                hasAccess = true; // System pages with 'any' role are accessible by default
              } else {
                hasAccess = false; // All other pages require explicit permission
              }
            }
          } else {
            // User doesn't have required role
            hasAccess = false;
          }
          
          if (hasAccess) accessCount++;
        });
        
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

    const { userId } = req.params;
    const { pageAccesses } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate all page accesses before updating
    const validationErrors = [];
    for (const access of pageAccesses) {
      if (access.hasAccess) {
        const page = await PageMaster.findOne({ pageId: access.pageId });
        if (page && page.requiredRole !== 'any' && user.role !== page.requiredRole) {
          validationErrors.push({
            pageId: access.pageId,
            pageName: page.pageName,
            userRole: user.role,
            requiredRole: page.requiredRole,
            suggestion: `User needs to be escalated to '${page.requiredRole}' role first`
          });
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot grant access: User role insufficient for some pages',
        validationErrors
      });
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

// Get role escalation information for a user
const getUserRoleEscalationInfo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all pages that require higher roles than the user currently has
    const allPages = await PageMaster.find({ isActive: true }).sort({ sortOrder: 1 });
    
    const roleEscalationInfo = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentRole: user.role
      },
      pagesRequiringEscalation: [],
      roleHierarchy: {
        user: ['user'],
        hod: ['user', 'hod'],
        admin: ['user', 'hod', 'admin']
      }
    };

    // Find pages that require higher roles
    allPages.forEach(page => {
      if (page.requiredRole !== 'any' && page.requiredRole !== user.role) {
        const isHigherRole = ['user', 'hod', 'admin'].indexOf(page.requiredRole) > 
                            ['user', 'hod', 'admin'].indexOf(user.role);
        
        if (isHigherRole) {
          roleEscalationInfo.pagesRequiringEscalation.push({
            pageId: page.pageId,
            pageName: page.pageName,
            pageDescription: page.pageDescription,
            requiredRole: page.requiredRole,
            category: page.category,
            groupName: page.groupName
          });
        }
      }
    });

    res.json(roleEscalationInfo);
  } catch (error) {
    console.error('Error fetching user role escalation info:', error);
    res.status(500).json({ error: 'Failed to fetch role escalation info' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId } = req.params;
    const { newRole } = req.body;

    // Validate role
    if (!['user', 'hod', 'admin'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be user, hod, or admin' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldRole = user.role;
    
    // Update user role
    user.role = newRole;
    await user.save();

    // Auto-grant permissions based on new role, but respect existing individual permissions
    const allPages = await PageMaster.find({ isActive: true });
    const permissionUpdates = [];

    for (const page of allPages) {
      let shouldHaveAccess = false;
      
      // Check if user has sufficient role for the page
      const hasRequiredRole = page.requiredRole === 'any' || newRole === page.requiredRole;
      
      if (hasRequiredRole) {
        // Check if there's already an explicit access record
        const existingAccess = await UserPageAccess.findOne({ userId, pageId: page.pageId });
        
        if (existingAccess) {
          // Keep existing individual permission, but update notes
          permissionUpdates.push(
            UserPageAccess.findOneAndUpdate(
              { userId, pageId: page.pageId },
              {
                grantedBy: req.user.id,
                grantedAt: new Date(),
                notes: `Role changed from ${oldRole} to ${newRole} - existing permission maintained`
              },
              { new: true }
            )
          );
        } else {
          // No existing record - grant based on page type
          if (page.isSystemPage && page.requiredRole === 'any') {
            shouldHaveAccess = true; // System pages with 'any' role are accessible by default
          } else {
            shouldHaveAccess = false; // All other pages require explicit permission
          }
          
          // Create access record
          permissionUpdates.push(
            UserPageAccess.findOneAndUpdate(
              { userId, pageId: page.pageId },
              {
                hasAccess: shouldHaveAccess,
                grantedBy: req.user.id,
                grantedAt: new Date(),
                notes: `Auto-granted due to role change from ${oldRole} to ${newRole}`
              },
              { upsert: true, new: true }
            )
          );
        }
      } else {
        // User doesn't have required role - revoke access
        permissionUpdates.push(
          UserPageAccess.findOneAndUpdate(
            { userId, pageId: page.pageId },
            {
              hasAccess: false,
              grantedBy: req.user.id,
              grantedAt: new Date(),
              notes: `Access revoked due to role change from ${oldRole} to ${newRole} - insufficient role`
            },
            { upsert: true, new: true }
          )
        );
      }
    }

    await Promise.all(permissionUpdates);

    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        oldRole,
        newRole
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

module.exports = {
  initializePageMaster,
  getAllPages,
  getUserAccessControl,
  updateUserPageAccess,
  getAllUsersAccessSummary,
  bulkUpdateUserAccess,
  checkUserPageAccess,
  getUserRoleEscalationInfo,
  updateUserRole
};
