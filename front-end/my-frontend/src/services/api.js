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