// // src/services/apiService.js
// export const useApi = () => {
//   const getToken = () => localStorage.getItem('token');

//   const apiCall = async (url, options = {}) => {
//     const token = getToken();
//     const headers = {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     };

//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`http://localhost:8081${url}`, {
//       ...options,
//       headers,
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         // Token expired or invalid
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//         throw new Error('Session expired. Please login again.');
//       }
//       const error = await response.json().catch(() => ({ message: 'Unknown error' }));
//       throw new Error(error.message || `HTTP Error: ${response.status}`);
//     }

//     return response.json();
//   };

//   return { apiCall };
// };
// src/services/api.js
// API Configuration with Environment Variables

// Get API Base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📦 Environment:', import.meta.env.MODE);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  CHANGE_PASSWORD: '/api/users/change-password',
  USER_PROFILE: '/api/users/profile',
  
  // Dashboard
  DASHBOARD: '/api/reports/dashboard',
  PROFIT_REPORT: '/api/reports/profit',
  
  // Job Cards
  JOB_CARDS: '/api/jobcards',
  JOB_CARD_CREATE: '/api/jobcards/create',
  
  // Inventory
  INVENTORY: '/api/inventory',
  STOCK_REPORT: '/api/inventory/stock-report',
  
  // Invoices
  INVOICES: '/api/invoices',
  
  // Expenses
  EXPENSES: '/api/expenses',
  EXPENSE_CATEGORIES: '/api/expense-categories',
  
  // Reports
  INCOME_EXPENSE_REPORT: '/api/reports/income-expense',
  
  // Users Management
  USERS: '/api/users',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_READ: '/api/notifications/read-all'
};

// Generic API Call Function
export const apiCall = async (endpoint, options = {}) => {
  const authToken = localStorage.getItem('token');
  
  console.log('📡 Making API call to:', `${API_BASE_URL}${endpoint}`);
  console.log('🔐 Token exists:', !!authToken);
  
  // Skip auth check for login and register endpoints
  const isPublicEndpoint = endpoint === API_ENDPOINTS.LOGIN || endpoint === API_ENDPOINTS.REGISTER;
  
  if (!authToken && !isPublicEndpoint) {
    console.error('❌ No auth token found!');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('No authentication token. Please login again.');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if token exists
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
    console.log('📤 Request config:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: config.method || 'GET',
      hasAuth: !!config.headers.Authorization
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    console.log('📥 Response status:', response.status);

    // Handle unauthorized
    if (response.status === 401 || response.status === 403) {
      console.error('❌ 401/403 Unauthorized - Token invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        
        errorMessage = errorData.message || 
                      errorData.error || 
                      errorData.errorMessage ||
                      errorData.details ||
                      errorMessage;
      } catch (parseError) {
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('Could not parse error response');
        }
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE or 204)
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
    console.error('❌ API call error:', error);
    throw error;
  }
};

export default apiCall;