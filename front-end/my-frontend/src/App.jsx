import React, { useState } from 'react';
import LoginInterface from './LoginInterface.jsx';
import ETechCareDashboard from './dashboard.jsx';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  // Optional: simulate login from LoginInterface
  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  return (
    <>
      {loggedIn ? (
        <ETechCareDashboard />
      ) : (
        <LoginInterface onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
};

export default App;