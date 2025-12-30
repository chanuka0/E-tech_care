import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
// import { useApi } from './hooks/useApi';
import { useApi } from '../services/apiService';
import { X, Plus, Search, Filter } from 'lucide-react';

// Main Users Management Component
const UsersManagement = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/api/users/admin/all');
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'ROLE_ADMIN') {
          return user.roles && user.roles.includes('ROLE_ADMIN');
        } else if (roleFilter === 'ROLE_USER') {
          return user.roles && user.roles.includes('ROLE_USER');
        }
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await apiCall(`/api/users/admin/delete-user/${userId}`, { method: 'DELETE' });
        setUsers(users.filter(u => u.userId !== userId));
        setSelectedUser(null);
        alert('User deleted successfully');
      } catch (err) {
        setError(err.message);
        alert('Error deleting user: ' + err.message);
      }
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      const endpoint = userType === 'admin' 
        ? '/api/users/admin/create-admin' 
        : '/api/users/admin/create-user';
      
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      alert(`${userType === 'admin' ? 'Admin' : 'User'} created successfully`);
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      alert('Error creating ' + userType + ': ' + err.message);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users and admins</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add User/Admin</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_ADMIN">Admins Only</option>
              <option value="ROLE_USER">Users Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading users...</p>
        </div>
      )}

      {/* Users List */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Grid */}
          <div className="lg:col-span-2">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <div
                    key={user.userId}
                    onClick={() => setSelectedUser(user)}
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition transform hover:shadow-lg hover:scale-105 ${
                      selectedUser?.userId === user.userId ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.userName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-2 flex gap-2">
                          {user.roles && user.roles.includes('ROLE_ADMIN') && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              Admin
                            </span>
                          )}
                          {user.roles && user.roles.includes('ROLE_USER') && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              User
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ID: {user.userId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Details Panel */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            {selectedUser ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">User Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900">{selectedUser.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 break-all">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-900">{selectedUser.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Roles</label>
                    <div className="mt-2 space-y-1">
                      {selectedUser.roles && selectedUser.roles.map(role => (
                        <div key={role} className="text-sm text-gray-900">
                          {role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 User'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteUser(selectedUser.userId, selectedUser.userName)}
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Delete User
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create User/Admin Modal */}
      {showCreateModal && (
        <CreateUserModal
          userType={userType}
          setUserType={setUserType}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ userType, setUserType, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.userName.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await onCreate(submitData);
      setFormData({ userName: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Create {userType === 'admin' ? 'Admin' : 'User'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                userType === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                userType === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 font-medium py-2 px-4 rounded-lg transition text-white ${
                userType === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersManagement;