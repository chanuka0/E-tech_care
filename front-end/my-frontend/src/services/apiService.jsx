import { useAuth } from '../auth/AuthProvider';

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    // Get token from localStorage as primary source (more reliable)
    const authToken = localStorage.getItem('token');
    
    console.log('Making API call to:', endpoint);
    console.log('Token exists:', !!authToken);
    
    if (!authToken) {
      console.error('No auth token found!');
      logout();
      throw new Error('No authentication token. Please login again.');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // CRITICAL: Ensure Bearer prefix
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('Request config:', {
        url: `http://localhost:8081${endpoint}`,
        method: config.method || 'GET',
        hasAuth: !!config.headers.Authorization
      });

      const response = await fetch(`http://localhost:8081${endpoint}`, config);

      console.log('Response status:', response.status);

      // Handle unauthorized (token expired or invalid)
      if (response.status === 401 || response.status === 403) {
        console.error('401/403 Unauthorized - Token invalid or expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return null;
      }

      // Handle JSON responses
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