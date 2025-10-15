// // import { useAuth } from '../auth/AuthProvider';
// import { useAuth } from '../auth/AuthProvider.jsx';


// export const useApi = () => {
//   const { token } = useAuth();

//   const apiCall = async (endpoint, options = {}) => {
//     const config = {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       },
//     };
//     const response = await fetch(`http://localhost:8080${endpoint}`, config);
//     if (!response.ok) {
//       const error = await response.json().catch(() => ({ error: 'Request failed' }));
//       throw new Error(error.error || 'Request failed');
//     }
//     return response.json();
//   };

//   return { apiCall };
// };
import { useAuth } from './AuthProvider';

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`http://localhost:8081${endpoint}`, config);

      // Handle unauthorized (token expired or invalid)
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { apiCall };
};