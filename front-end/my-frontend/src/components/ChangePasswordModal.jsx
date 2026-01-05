// import { useState } from 'react';
// import { useApi } from '../services/apiService';
// import { X, Eye, EyeOff } from 'lucide-react';

// // ============================================
// // ChangePasswordModal Component
// // ============================================
// const ChangePasswordModal = ({ isOpen, onClose, username }) => {
//   const { apiCall } = useApi();
//   const [formData, setFormData] = useState({
//     oldPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [showPasswords, setShowPasswords] = useState({
//     oldPassword: false,
//     newPassword: false,
//     confirmPassword: false
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

//   const togglePasswordVisibility = (field) => {
//     setShowPasswords(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!formData.oldPassword.trim()) {
//       setError('Please enter your old password');
//       return;
//     }

//     if (!formData.newPassword.trim()) {
//       setError('Please enter your new password');
//       return;
//     }

//     if (formData.newPassword.length < 6) {
//       setError('New password must be at least 6 characters');
//       return;
//     }

//     if (formData.newPassword !== formData.confirmPassword) {
//       setError('New passwords do not match');
//       return;
//     }

//     if (formData.oldPassword === formData.newPassword) {
//       setError('New password cannot be the same as old password');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await apiCall('/api/users/change-password', {
//         method: 'POST',
//         body: JSON.stringify({
//           oldPassword: formData.oldPassword,
//           newPassword: formData.newPassword,
//           confirmPassword: formData.confirmPassword
//         })
//       });

//       setSuccess('✅ Password changed successfully!');
//       setFormData({
//         oldPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       });

//       // Close modal after 2 seconds
//       setTimeout(() => {
//         onClose();
//       }, 2000);
//     } catch (err) {
//       setError(err.message || 'Failed to change password');
//       console.error('Error changing password:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
//           <h2 className="text-2xl font-bold">Change Password</h2>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
//               <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-start">
//               <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span>{success}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Old Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Old Password *
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPasswords.oldPassword ? 'text' : 'password'}
//                   name="oldPassword"
//                   value={formData.oldPassword}
//                   onChange={handleChange}
//                   placeholder="Enter your current password"
//                   className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => togglePasswordVisibility('oldPassword')}
//                   className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//                   disabled={loading}
//                 >
//                   {showPasswords.oldPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* New Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 New Password *
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPasswords.newPassword ? 'text' : 'password'}
//                   name="newPassword"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   placeholder="Enter your new password (min. 6 characters)"
//                   className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => togglePasswordVisibility('newPassword')}
//                   className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//                   disabled={loading}
//                 >
//                   {showPasswords.newPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {formData.newPassword && formData.newPassword.length >= 6 && (
//                 <p className="text-xs text-green-600 mt-1">✓ Password length is valid</p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm New Password *
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPasswords.confirmPassword ? 'text' : 'password'}
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="Confirm your new password"
//                   className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => togglePasswordVisibility('confirmPassword')}
//                   className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//                   disabled={loading}
//                 >
//                   {showPasswords.confirmPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
//                 <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
//               )}
//               {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
//                 <p className="text-xs text-red-600 mt-1">✗ Passwords do not match</p>
//               )}
//             </div>

//             {/* Password Requirements */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
//               <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
//               <ul className="text-xs text-blue-700 space-y-1">
//                 <li className={formData.newPassword.length >= 6 ? 'text-green-600' : ''}>
//                   ✓ At least 6 characters
//                 </li>
//                 <li className={formData.newPassword && formData.newPassword !== formData.oldPassword ? 'text-green-600' : ''}>
//                   ✓ Different from current password
//                 </li>
//                 <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'text-green-600' : ''}>
//                   ✓ Passwords match
//                 </li>
//               </ul>
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Changing...
//                   </>
//                 ) : (
//                   'Change Password'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChangePasswordModal;



import { useState } from 'react';
import { useApi } from '../services/apiService';

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, username }) => {
  const { apiCall } = useApi();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.oldPassword.trim()) {
      setError('Please enter your old password');
      return;
    }

    if (!formData.newPassword.trim()) {
      setError('Please enter your new password');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('New password cannot be the same as old password');
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      setSuccess('✅ Password changed successfully!');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Change Password</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Old Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? 'text' : 'password'}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.oldPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password (min. 6 characters)"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.newPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.newPassword && formData.newPassword.length >= 6 && (
                <p className="text-xs text-green-600 mt-1">✓ Password length is valid</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.confirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">✗ Passwords do not match</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className={formData.newPassword.length >= 6 ? 'text-green-600' : ''}>
                  ✓ At least 6 characters
                </li>
                <li className={formData.newPassword && formData.newPassword !== formData.oldPassword ? 'text-green-600' : ''}>
                  ✓ Different from current password
                </li>
                <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'text-green-600' : ''}>
                  ✓ Passwords match
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;