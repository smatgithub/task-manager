const PageMaster = require('../models/PageMaster');
const UserPageAccess = require('../models/UserPageAccess');

// Middleware to check if user has access to a specific page
const checkPageAccess = (pageId) => {
  return async (req, res, next) => {
    try {
      // Check if page exists and is active
      const page = await PageMaster.findOne({ pageId, isActive: true });
      if (!page) {
        return res.status(404).json({ 
          error: 'Page not found or inactive',
          hasAccess: false 
        });
      }

      // Check role requirement first
      if (page.requiredRole !== 'any' && req.user.role !== page.requiredRole) {
        return res.status(403).json({ 
          error: 'Insufficient role',
          hasAccess: false,
          requiredRole: page.requiredRole,
          userRole: req.user.role
        });
      }

      // Check specific access permission
      const accessRecord = await UserPageAccess.findOne({ 
        userId: req.user.id, 
        pageId 
      });
      
      // If no access record exists, check if it's a system page or role-based access
      const hasAccess = accessRecord 
        ? accessRecord.hasAccess 
        : (page.requiredRole === 'any' || page.isSystemPage);

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied',
          hasAccess: false,
          pageId,
          pageName: page.pageName
        });
      }

      // Add page info to request for use in controllers
      req.pageInfo = page;
      next();
    } catch (error) {
      console.error('Error checking page access:', error);
      res.status(500).json({ 
        error: 'Failed to check page access',
        hasAccess: false 
      });
    }
  };
};

// Middleware to get user's page access summary
const getUserPageAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all active pages
    const pages = await PageMaster.find({ isActive: true }).sort({ sortOrder: 1 });
    
    // Get user's access records
    const userAccess = await UserPageAccess.find({ userId });
    
    // Create access map
    const accessMap = {};
    userAccess.forEach(access => {
      accessMap[access.pageId] = access.hasAccess;
    });

    // Create page access summary
    const pageAccess = {};
    pages.forEach(page => {
      let hasAccess = false;
      
      // First check if user has sufficient role for the page
      const hasRequiredRole = page.requiredRole === 'any' || req.user.role === page.requiredRole;
      
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
      
      pageAccess[page.pageId] = hasAccess;
    });

    // Add to request object
    req.userPageAccess = pageAccess;
    next();
  } catch (error) {
    console.error('Error getting user page access:', error);
    // Continue without page access info
    req.userPageAccess = {};
    next();
  }
};

module.exports = {
  checkPageAccess,
  getUserPageAccess
};
