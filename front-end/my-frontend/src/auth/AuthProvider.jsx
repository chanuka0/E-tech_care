// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Auth Context
// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // Auth Provider Component
// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedToken = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user');
//     console.log('Checking saved auth:', { savedToken: !!savedToken, savedUser: !!savedUser });
    
//     if (savedToken && savedUser) {
//       setToken(savedToken);
//       setUser(JSON.parse(savedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await fetch('http://localhost:8081/api/users/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const userData = {
//           username: data.username,
//           roles: data.roles
//         };
        
//         console.log('Login successful, saving token:', data.token); // Debug
        
//         // Set state first
//         setToken(data.token);
//         setUser(userData);
        
//         // Then save to localStorage
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(userData));
        
//         return { success: true };
//       } else {
//         const error = await response.json();
//         return { success: false, message: error.error || 'Login failed' };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return { success: false, message: 'Network error. Please try again.' };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await fetch('http://localhost:8081/api/users/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       if (response.ok) {
//         return { success: true, message: 'Registration successful! Please login.' };
//       } else {
//         const error = await response.json();
//         return { success: false, message: error.error || 'Registration failed' };
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       return { success: false, message: 'Network error. Please try again.' };
//     }
//   };

//   const logout = () => {
//     console.log('Logging out...');
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   };

//   const isAdmin = () => {
//     return user?.roles?.some(role => role.authority === 'ROLE_ADMIN');
//   };

//   const value = {
//     user,
//     token,
//     login,
//     register,
//     logout,
//     isAdmin,
//     isAuthenticated: !!user
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;







import React, { createContext, useContext, useState, useEffect } from 'react';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Changed back to true for checking saved auth

  // Load saved credentials on mount (for page refresh)
  // But clear them when tab/window closes
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('Checking saved auth:', { savedToken: !!savedToken, savedUser: !!savedUser });
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Use sessionStorage flag to detect actual close vs refresh
    const wasPageRefresh = sessionStorage.getItem('pageRefresh');
    
    if (!wasPageRefresh) {
      // First load after browser/tab open - clear any old session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
    
    // Mark that page has been loaded in this session
    sessionStorage.setItem('pageRefresh', 'true');

  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:8081/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          username: data.username,
          roles: data.roles
        };
        
        console.log('Login successful, saving token:', data.token);
        
        // Set state first
        setToken(data.token);
        setUser(userData);
        
        // Save to localStorage (but will be cleared on next app open)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        return { success: true, message: 'Registration successful! Please login.' };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user?.roles?.some(role => role.authority === 'ROLE_ADMIN');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;