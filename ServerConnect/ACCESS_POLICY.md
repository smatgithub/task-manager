# E-Flow Task Manager - Access Control Policy

## Overview

This document defines the comprehensive access control policy for the E-Flow Task Manager application. The system implements a **hybrid role-based and permission-based access control** model that ensures security while providing flexibility for administrative control.

## Current Issue Analysis

### Problem Identified
The current system has a critical flaw where:
1. **Role-based restrictions** are enforced at the middleware level (e.g., `adminTaskReview` requires `admin` role)
2. **Permission-based access** can be granted through the UI (admin can toggle access for any user)
3. **Conflict occurs** when a user with insufficient role is granted permission to a role-restricted page
4. **Result**: User appears to have access in the UI but cannot actually access the page due to role restrictions

### Example Case
- User `ru2@eflow.com` has role `user`
- Admin grants access to `adminTaskReview` page (which requires `admin` role)
- User sees the page in UI but gets 403 error when trying to access it
- No role escalation workflow exists

## Access Control Model

### 1. Role Hierarchy

```
ADMIN (Highest)
├── Full access to all pages
├── Can manage user roles
├── Can grant/revoke any permissions
└── Can escalate user roles

HOD (Head of Department)
├── Access to HOD-specific pages
├── Can manage department users
├── Cannot access admin-only pages
└── Requires role escalation to access

USER (Regular User)
├── Access to user-specific pages
├── Cannot access HOD or admin pages
└── Requires role escalation to access higher levels
```

### 2. Page Categories

#### A. System Pages (Always Accessible)
- **Required Role**: `any`
- **Access Control**: Automatic for all authenticated users
- **Examples**: Dashboard, Profile, Basic Chat, User Settings

#### B. Role-Restricted Pages
- **Required Role**: `admin`, `hod`, or `user`
- **Access Control**: Role must match + explicit permission
- **Examples**: 
  - `adminTaskReview` (admin only)
  - `userManagement` (admin only)
  - `userAccessControl` (admin only)

#### C. Permission-Controlled Pages
- **Required Role**: `any`
- **Access Control**: Explicit permission required
- **Examples**: Custom features, special tools

### 3. Access Validation Rules

#### Rule 1: Role Requirement Check
```javascript
if (page.requiredRole !== 'any' && user.role !== page.requiredRole) {
  // Access denied - insufficient role
  return false;
}
```

#### Rule 2: Permission Check
```javascript
if (page.requiredRole === 'any') {
  // Check explicit permission
  return userHasExplicitPermission(user, page);
} else {
  // Role already validated, check explicit permission
  return userHasExplicitPermission(user, page);
}
```

#### Rule 3: Admin Override
```javascript
if (user.role === 'admin') {
  // Admin has access to everything
  return true;
}
```

## Policy Implementation

### 1. Role Escalation Workflow

#### A. User Role Escalation Request
- Users can request role escalation through their profile
- Request includes justification and target role
- Request is sent to admin for approval

#### B. Admin Role Management
- Admin can view pending role escalation requests
- Admin can approve/reject requests with comments
- Admin can directly change user roles
- Role changes trigger permission updates

#### C. Automatic Permission Updates
- When user role is escalated, relevant permissions are auto-granted
- When user role is demoted, restricted permissions are auto-revoked
- System maintains audit log of all role changes

### 2. Permission Assignment Rules

#### A. Valid Permission Assignments
- **Admin**: Can assign any permission to any user
- **HOD**: Can assign permissions within their scope
- **User**: Cannot assign permissions to others

#### B. Invalid Permission Assignments (Prevented)
- Cannot grant `admin`-only page access to `user` or `hod`
- Cannot grant `hod`-only page access to `user`
- System validates role compatibility before allowing permission assignment

#### C. Permission Validation
```javascript
function canAssignPermission(assigner, targetUser, page) {
  // Admin can assign anything
  if (assigner.role === 'admin') return true;
  
  // Check if target user has sufficient role for the page
  if (page.requiredRole !== 'any' && targetUser.role !== page.requiredRole) {
    return false; // Target user needs role escalation first
  }
  
  // HOD can assign within their scope
  if (assigner.role === 'hod' && targetUser.role === 'user') {
    return page.requiredRole === 'any' || page.requiredRole === 'user';
  }
  
  return false;
}
```

### 3. UI/UX Improvements

#### A. Permission Assignment UI
- Show role requirements clearly for each page
- Disable toggle for pages requiring higher role
- Show tooltip explaining why permission cannot be granted
- Provide "Request Role Escalation" button for restricted pages

#### B. Role Management UI
- Add role escalation request interface
- Show pending requests for admins
- Display role change history
- Provide bulk role management tools

#### C. Access Status Indicators
- Clear visual indicators for access status
- Distinguish between "No Permission" and "Insufficient Role"
- Show next steps for gaining access

## Implementation Plan

### Phase 1: Fix Current Issues
1. **Update Permission Validation**
   - Add role compatibility checks in `updateUserPageAccess`
   - Prevent invalid permission assignments
   - Return clear error messages

2. **Enhance UI Validation**
   - Disable toggles for incompatible role-page combinations
   - Show role requirements and current user role
   - Add helpful tooltips and messages

### Phase 2: Add Role Escalation
1. **Create Role Escalation Model**
   - Track escalation requests
   - Store request details and status
   - Maintain audit trail

2. **Build Escalation Workflow**
   - User request interface
   - Admin approval interface
   - Automatic permission updates

### Phase 3: Advanced Features
1. **Bulk Role Management**
   - Import/export role assignments
   - Bulk role changes
   - Department-based role management

2. **Advanced Audit**
   - Detailed access logs
   - Permission change tracking
   - Security alerts

## Security Considerations

### 1. Principle of Least Privilege
- Users get minimum required access by default
- Permissions are explicitly granted, not inherited
- Regular access reviews and cleanup

### 2. Audit and Compliance
- All permission changes are logged
- Role escalations require approval
- Regular access reviews and reports

### 3. Data Protection
- Sensitive pages require appropriate roles
- Access is validated on every request
- No client-side security decisions

## Current Page Analysis

Based on the current system, here are the pages and their access requirements:

### System Pages (requiredRole: 'any')
- Dashboard
- Task Forms
- User Task Dashboard
- Basic Chat
- Enhanced Chat
- Profile
- My Settings

### Admin-Only Pages (requiredRole: 'admin')
- Task Review (adminTaskReview)
- User Management
- User Access Control
- Application Settings

### Missing HOD Pages
The system currently lacks HOD-specific pages. Consider adding:
- Department Task Review
- Department User Management
- Department Reports
- Team Performance Metrics

## Recommendations

### Immediate Actions
1. **Fix Permission Validation**: Prevent invalid role-page combinations
2. **Update UI**: Show clear role requirements and restrictions
3. **Add Role Escalation**: Allow users to request role changes

### Medium Term
1. **Add HOD Role Pages**: Create department-level management features
2. **Enhance Audit**: Add comprehensive logging and reporting
3. **Bulk Management**: Add tools for managing multiple users

### Long Term
1. **Advanced RBAC**: Implement more granular role hierarchies
2. **Integration**: Connect with external identity providers
3. **Automation**: Add rule-based automatic permission assignment

## Conclusion

This access control policy provides a robust framework for managing user access while maintaining security and usability. The key is to ensure that role requirements and permission assignments are always compatible, and that users have clear paths to gain appropriate access through proper role escalation workflows.

The implementation should prioritize fixing the current validation issues while building toward a more comprehensive role management system that scales with the organization's needs.
