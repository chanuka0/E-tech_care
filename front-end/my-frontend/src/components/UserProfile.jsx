// import { useState, useEffect } from 'react';
// import { useAuth } from '../auth/AuthProvider';

// const UserProfile = () => {
//   const { user, token, logout } = useAuth();
//   const [profileData, setProfileData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://localhost:8081/api/users/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setProfileData(data);
//         setError('');
//       } else {
//         setError('Failed to load profile');
//       }
//     } catch (err) {
//       console.error('Error fetching profile:', err);
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRoleDisplayName = (role) => {
//     if (role === 'ROLE_ADMIN') return 'Administrator';
//     if (role === 'ROLE_USER') return 'User';
//     return role.replace('ROLE_', '');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
//           <div className="text-center">
//             <div className="text-red-500 text-5xl mb-4">⚠️</div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
//             <p className="text-gray-600 mb-6">{error}</p>
//             <button
//               onClick={fetchUserProfile}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
//           <div className="px-8 pb-8">
//             <div className="flex items-end -mt-16 mb-6">
//               <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
//                 <span className="text-5xl font-bold text-blue-600">
//                   {profileData?.userName?.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <div className="ml-6 mb-2">
//                 <h1 className="text-3xl font-bold text-gray-800">{profileData?.userName}</h1>
//                 <p className="text-gray-600">{profileData?.email}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Profile Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Personal Information */}
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">User ID</label>
//                 <p className="text-lg text-gray-800">{profileData?.userId}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Username</label>
//                 <p className="text-lg text-gray-800">{profileData?.userName}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Email Address</label>
//                 <p className="text-lg text-gray-800">{profileData?.email}</p>
//               </div>
//             </div>
//           </div>

//           {/* Account Information */}
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//               </svg>
//               <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Account Status</label>
//                 <div className="flex items-center mt-1">
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
//                     <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
//                     Active
//                   </span>
//                 </div>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Roles</label>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {profileData?.roles?.map((role, index) => (
//                     <span
//                       key={index}
//                       className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                         role === 'ROLE_ADMIN'
//                           ? 'bg-purple-100 text-purple-800'
//                           : 'bg-blue-100 text-blue-800'
//                       }`}
//                     >
//                       {role === 'ROLE_ADMIN' && (
//                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                         </svg>
//                       )}
//                       {getRoleDisplayName(role)}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Member Since</label>
//                 <p className="text-lg text-gray-800">
//                   {new Date().toLocaleDateString('en-US', { 
//                     year: 'numeric', 
//                     month: 'long'
//                   })}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
//             <button
//               onClick={logout}
//               className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>

//         {/* System Information */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">System Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <div className="flex justify-between py-2 border-b">
//               <span className="text-gray-600">Last Login</span>
//               <span className="text-gray-800 font-medium">
//                 {new Date().toLocaleString('en-US')}
//               </span>
//             </div>
//             <div className="flex justify-between py-2 border-b">
//               <span className="text-gray-600">Session Status</span>
//               <span className="text-green-600 font-medium">Active</span>
//             </div>
//             <div className="flex justify-between py-2 border-b">
//               <span className="text-gray-600">Authentication Method</span>
//               <span className="text-gray-800 font-medium">JWT Token</span>
//             </div>
//             <div className="flex justify-between py-2 border-b">
//               <span className="text-gray-600">Account Type</span>
//               <span className="text-gray-800 font-medium">
//                 {profileData?.roles?.includes('ROLE_ADMIN') ? 'Administrator' : 'Standard User'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;

import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import ChangePasswordModal from './ChangePasswordModal';

const UserProfile = () => {
  const { apiCall } = useApi();
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
      const response = await apiCall('/api/users/profile');
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