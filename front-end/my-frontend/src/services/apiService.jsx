
import { useAuth } from '../auth/AuthProvider';


export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage as backup
    const authToken = token || localStorage.getItem('token');
    
    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('API Call:', endpoint, config); // Debug log
      const response = await fetch(`http://localhost:8081${endpoint}`, config);

      // Handle unauthorized (token expired or invalid)
      if (response.status === 401) {
        console.error('401 Unauthorized - Token invalid or expired');
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