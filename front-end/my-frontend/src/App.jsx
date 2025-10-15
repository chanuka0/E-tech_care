// // // import { useState } from 'react'
// // // import reactLogo from './assets/react.svg'
// // // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {

  
// // }

// // export default App
// // Main App Component

// //import React, { useState } from "react";




// // import { useState } from "react";
// // import { useAuth } from "./auth/AuthProvider.jsx";  // ✅ Import useAuth


// // import './App.css'
// // import Dashboard from './dashboard/Dashboard.jsx'
// // import LoginForm from './auth/LoginForm.jsx'
// // import RegisterForm from './auth/RegisterForm.jsx'
// // //import AuthContext from './auth/AuthContext.jsx'
// // import AuthProvider from './auth/AuthProvider.jsx'
// // import MainNavigation from './navigation/MainNavigation.jsx'






// import { useState } from "react";
// import { useAuth } from "./auth/AuthProvider.jsx";

// import './App.css';

// import Dashboard from './dashboard/Dashboard.jsx';
// import InventoryManagement from './inventory/InventoryManagement.jsx';
// import JobCardsManagement from './jobcards/JobCardsManagement.jsx';
// import LoginForm from './auth/LoginForm.jsx';
// import RegisterForm from './auth/RegisterForm.jsx';
// import AuthProvider from './auth/AuthProvider.jsx';
// import MainNavigation from './navigation/MainNavigation.jsx';

// // const App = () => {
// //   const [showLogin, setShowLogin] = useState(true);

// //   return (
// //     <AuthProvider>
// //       <AuthenticatedApp showLogin={showLogin} setShowLogin={setShowLogin} />
// //     </AuthProvider>
// //   );
// // };

// // const AuthenticatedApp = ({ showLogin, setShowLogin }) => {
// //   const { isAuthenticated } = useAuth();

// //   if (isAuthenticated) {
// //     return <Dashboard />;
// //   }

// //   return showLogin ? (
// //     <LoginForm onToggleForm={() => setShowLogin(false)} />
// //   ) : (
// //     <RegisterForm onToggleForm={() => setShowLogin(true)} />
// //   );
// // };

// // export default App;



// const MainApp = () => {
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   const renderCurrentPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'inventory':
//         return <InventoryManagement />;
//       case 'jobcards':
//         return <JobCardsManagement />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <MainNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
//       <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         {renderCurrentPage()}
//       </div>
//     </div>
//   );
// };

// // Root App Component
// const App = () => {
//   const [showLogin, setShowLogin] = useState(true);

//   return (
//     <AuthProvider>
//       <AuthenticatedApp showLogin={showLogin} setShowLogin={setShowLogin} />
//     </AuthProvider>
//   );
// };

// const AuthenticatedApp = ({ showLogin, setShowLogin }) => {
//   const { isAuthenticated } = useAuth();

//   if (isAuthenticated) {
//     return <MainApp />;
//   }

//   return showLogin ? (
//     <LoginForm onToggleForm={() => setShowLogin(false)} />
//   ) : (
//     <RegisterForm onToggleForm={() => setShowLogin(true)} />
//   );
// };

// export default App;


import { useState } from 'react';
import AuthProvider, { useAuth } from './auth/AuthProvider.jsx';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import Sidebar from './Sidebar';
import Dashboard from './dashboard/Dashboard';

// Placeholder components - replace with your actual components when ready
const JobCards = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Cards Management</h2>
    <p className="text-gray-600">Job cards component will go here</p>
  </div>
);

const Inventory = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management</h2>
    <p className="text-gray-600">Inventory component will go here</p>
  </div>
);

const Invoices = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Invoice Management</h2>
    <p className="text-gray-600">Invoices component will go here</p>
  </div>
);

const Expenses = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Expense Tracking</h2>
    <p className="text-gray-600">Expenses component will go here</p>
  </div>
);

const Damages = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Damaged Items</h2>
    <p className="text-gray-600">Damages component will go here</p>
  </div>
);

const Settings = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">System Settings</h2>
    <p className="text-gray-600">Settings component will go here</p>
  </div>
);

// Main content component (replaces MainLayout)
const MainContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pages = {
    dashboard: { component: Dashboard, title: 'Dashboard' },
    jobcards: { component: JobCards, title: 'Job Cards' },
    inventory: { component: Inventory, title: 'Inventory' },
    invoices: { component: Invoices, title: 'Invoices' },
    expenses: { component: Expenses, title: 'Expenses' },
    damages: { component: Damages, title: 'Damages' },
    settings: { component: Settings, title: 'Settings' },
  };

  const CurrentComponent = pages[currentPage]?.component || Dashboard;
  const pageTitle = pages[currentPage]?.title || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Notifications and User Info */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Info */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{user?.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <CurrentComponent />
        </div>
      </main>
    </div>
  );
};

// Auth wrapper to handle login/register
const AuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterForm onToggleForm={() => setShowRegister(false)} />
    ) : (
      <LoginForm onToggleForm={() => setShowRegister(true)} />
    );
  }

  return <MainContent />;
};

// Main App
const App = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;