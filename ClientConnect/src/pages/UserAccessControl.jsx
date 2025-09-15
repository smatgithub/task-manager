import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const UserAccessControl = () => {
  const { user, token } = useAuth();
  const { refreshPageAccess } = useSettings();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/page-access/users-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch users:', errorData);
        setMessage('Failed to fetch users: ' + (errorData.error || 'Unknown error'));
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccess = async (userId) => {
    try {
      const response = await fetch(`/api/page-access/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setUserPages(data.pages);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user access:', errorData);
        setMessage('Failed to fetch user access: ' + (errorData.error || 'Unknown error'));
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
      setMessage('Error fetching user access: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updatePageAccess = async (pageId, hasAccess) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/page-access/user/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId,
          hasAccess
        })
      });

      if (response.ok) {
        // Update local state
        setUserPages(prev => 
          prev.map(page => 
            page.pageId === pageId 
              ? { ...page, hasAccess }
              : page
          )
        );
        
        // Refresh users list to update access counts
        await fetchUsers();
        
        setMessage('Page access updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        
        // Trigger global refresh for all users
        window.dispatchEvent(new CustomEvent('refreshPermissions'));
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          // Role validation error
          setMessage(`Cannot grant access: ${errorData.details.suggestion}`);
        } else {
          setMessage(`Failed to update page access: ${errorData.error || 'Unknown error'}`);
        }
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating page access:', error);
      setMessage('Error updating page access');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const bulkUpdateAccess = async (accesses) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/page-access/user/${selectedUser._id}/bulk`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageAccesses: accesses
        })
      });

      if (response.ok) {
        setMessage('Bulk access update completed successfully!');
        setTimeout(() => setMessage(''), 3000);
        // Refresh user access and users list
        await fetchUserAccess(selectedUser._id);
        await fetchUsers();
      } else {
        const errorData = await response.json();
        if (errorData.validationErrors && errorData.validationErrors.length > 0) {
          // Show validation errors for pages that couldn't be updated
          const errorMessages = errorData.validationErrors.map(err => 
            `${err.pageName}: ${err.suggestion}`
          ).join('; ');
          setMessage(`Some pages couldn't be updated: ${errorMessages}`);
        } else {
          setMessage(`Failed to update page access: ${errorData.error || 'Unknown error'}`);
        }
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error bulk updating page access:', error);
      setMessage('Error updating page access');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectUser = (userId) => {
    fetchUserAccess(userId);
  };

  const handlePageAccessChange = (pageId, hasAccess) => {
    updatePageAccess(pageId, hasAccess);
  };

  const handleBulkAction = (action) => {
    const accesses = userPages.map(page => ({
      pageId: page.pageId,
      hasAccess: action === 'enable' ? true : action === 'disable' ? false : page.hasAccess
    }));
    bulkUpdateAccess(accesses);
  };

  const updateUserRole = async (newRole) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/page-access/user/${selectedUser._id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`User role updated from ${data.user.oldRole.toUpperCase()} to ${data.user.newRole.toUpperCase()} successfully!`);
        setTimeout(() => setMessage(''), 5000);
        
        // Refresh user data and users list
        await fetchUserAccess(selectedUser._id);
        await fetchUsers();
        
        // Close modal
        setShowRoleModal(false);
        setSelectedRole('');
        
        // Trigger global refresh for all users
        window.dispatchEvent(new CustomEvent('refreshPermissions'));
      } else {
        const errorData = await response.json();
        setMessage(`Failed to update role: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage('Error updating user role');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleRoleUpdate = () => {
    if (selectedRole && selectedRole !== selectedUser.role) {
      updateUserRole(selectedRole);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Access Control</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage user page access permissions
            </p>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Users</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user._id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?._id === user._id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-500">{user.role.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {user.accessCount}/{user.totalPages} pages
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.accessPercentage}% access
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Access Control */}
              <div className="lg:col-span-2">
                {selectedUser ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          Page Access for {selectedUser.name}
                        </h2>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedUser.role === 'admin' 
                              ? 'bg-red-100 text-red-800'
                              : selectedUser.role === 'hod'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedUser.role.toUpperCase()}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedRole(selectedUser.role);
                              setShowRoleModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Change Role
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBulkAction('enable')}
                          disabled={saving}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Enable All
                        </button>
                        <button
                          onClick={() => handleBulkAction('disable')}
                          disabled={saving}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {(() => {
                        // Group pages by groupName
                        const groupedPages = userPages.reduce((groups, page) => {
                          const group = page.groupName || 'Other';
                          if (!groups[group]) {
                            groups[group] = [];
                          }
                          groups[group].push(page);
                          return groups;
                        }, {});

                        return Object.entries(groupedPages).map(([groupName, pages]) => (
                          <div key={groupName} className="space-y-3">
                            <div className="border-b border-gray-200 pb-2">
                              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                {groupName}
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {pages.map((page) => (
                                <div
                                  key={page.pageId}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                                >
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {page.pageName}
                                    </h4>
                                    <p className="text-xs text-gray-500">{page.pageDescription}</p>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        page.requiredRole === 'admin' 
                                          ? 'bg-red-100 text-red-800'
                                          : page.requiredRole === 'hod'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {page.requiredRole.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {page.category.replace('-', ' ').toUpperCase()}
                                      </span>
                                      {page.isSystemPage && (
                                        <span className="text-xs text-blue-600 font-medium">
                                          SYSTEM PAGE
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {(() => {
                                      const isRoleIncompatible = page.requiredRole !== 'any' && 
                                        selectedUser.role !== page.requiredRole;
                                      const isDisabled = saving || 
                                        (page.isSystemPage && user?.role !== 'admin') ||
                                        isRoleIncompatible;
                                      
                                      return (
                                        <div className="text-center">
                                          <label className={`relative inline-flex items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input
                                              type="checkbox"
                                              checked={page.hasAccess}
                                              onChange={(e) => handlePageAccessChange(page.pageId, e.target.checked)}
                                              className="sr-only peer"
                                              disabled={isDisabled}
                                            />
                                            <div className={`w-11 h-6 rounded-full peer ${
                                              isDisabled
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300'
                                            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                                          </label>
                                          
                                          {isRoleIncompatible && (
                                            <div className="mt-1">
                                              <p className="text-xs text-red-600 font-medium">
                                                Requires {page.requiredRole.toUpperCase()} role
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                User has {selectedUser.role.toUpperCase()} role
                                              </p>
                                            </div>
                                          )}
                                          
                                          {page.isSystemPage && !isRoleIncompatible && (
                                            <p className="text-xs text-gray-400 mt-1">
                                              {user?.role === 'admin' ? 'Admin can manage' : 'System managed'}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No user selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Select a user to manage their page access.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Change User Role
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedRole('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Current user: <span className="font-medium">{selectedUser?.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current role: <span className="font-medium">{selectedUser?.role?.toUpperCase()}</span>
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={selectedRole === 'user'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">USER</span>
                    <span className="text-xs text-gray-500">Basic user access</span>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="hod"
                    checked={selectedRole === 'hod'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">HOD</span>
                    <span className="text-xs text-gray-500">Head of Department access</span>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === 'admin'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">ADMIN</span>
                    <span className="text-xs text-gray-500">Full administrative access</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedRole('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleUpdate}
                  disabled={saving || !selectedRole || selectedRole === selectedUser?.role}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessControl;
