import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import ChangePasswordModal from './ChangePasswordModal';
import { API_ENDPOINTS, apiCall } from '../services/api';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // ✅ Now uses correct API base URL from environment variable
      const response = await apiCall(API_ENDPOINTS.USER_PROFILE);
      setUserProfile(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile.roles && userProfile.roles.includes('ROLE_ADMIN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {userProfile.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{userProfile.userName}</h1>
                <p className="text-blue-100 mt-1">@{userProfile.userName.toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6 space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-sm font-medium text-gray-600 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Username</p>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.userName}</p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 break-all">{userProfile.email}</p>
                </div>

                {/* User ID */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                  <p className="text-lg font-semibold text-gray-900">#{userProfile.userId}</p>
                </div>

                {/* Roles */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role(s)</p>
                  <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                        👑 Admin
                      </span>
                    )}
                    {userProfile.roles && userProfile.roles.includes('ROLE_USER') && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                        👤 User
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Account Status</h3>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Active Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Change Password Button */}
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-md"
          >
            <span>🔐</span>
            <span>Change Password</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-md"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Account Security</h4>
              <p className="text-sm text-blue-700">
                We recommend changing your password regularly to keep your account secure. 
                If you notice any suspicious activity, change your password immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        username={userProfile.userName}
      />
    </div>
  );
};

export default UserProfile;