// import  { useState } from 'react';
// import { useAuth } from './AuthProvider.jsx';

// // Login Component
// const LoginForm = ({ onToggleForm }) => {
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({
//     usernameOrEmail: '',
//     password: ''
//   });
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     login(formData).then(result => {
//       if (!result.success) {
//         setMessage(result.message);
//       }
//       setLoading(false);
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>
        
//         {message && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {message}
//           </div>
//         )}

//         <div className="space-y-6">
//           <div>
//             <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
//               Username or Email
//             </label>
//             <input
//               type="text"
//               id="usernameOrEmail"
//               name="usernameOrEmail"
//               value={formData.usernameOrEmail}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//           >
//             {loading ? 'Signing In...' : 'Sign In'}
//           </button>
//         </div>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Don't have an account?{' '}
//           <button
//             onClick={onToggleForm}
//             className="font-medium text-blue-600 hover:text-blue-500"
//           >
//             Sign up
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };
// export default LoginForm;

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.jsx';

// Login Component
const LoginForm = ({ onToggleForm }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Global Enter key handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if Enter key is pressed and not loading
      if (e.key === 'Enter' && !loading) {
        // Check if form has valid data
        if (formData.usernameOrEmail.trim() && formData.password.trim()) {
          handleSubmit(e);
        }
      }
    };

    // Add event listener to the entire document
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [loading, formData]); // Re-run when loading or formData changes

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!formData.usernameOrEmail.trim() || !formData.password.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    login(formData).then(result => {
      if (!result.success) {
        setMessage(result.message);
      }
      setLoading(false);
    }).catch(error => {
      setMessage('An error occurred during login');
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>
        
        {message && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;