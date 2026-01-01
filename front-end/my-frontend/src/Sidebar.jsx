import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';

const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'jobcards', 
      label: 'Job Cards',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'inventory', 
      label: 'Inventory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      id: 'invoices', 
      label: 'Invoices',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'expenses', 
      label: 'Expenses',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'reports-menu',
      label: 'Reports',
      hasSubmenu: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenu: [
        { id: 'income-expense-report', label: 'Income vs Expenses' },
        { id: 'stock-report', label: 'Stock In/Out' }
      ]
    },
    { 
      id: 'settings-menu', 
      label: 'Settings',
      hasSubmenu: true,
      adminOnly: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      submenu: [
        { id: 'users', label: 'Users Management' },
        { id: 'settings', label: 'System Settings' }
      ]
    },
  ];

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 flex flex-col shadow-xl`}>
      {/* Header */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold tracking-wide">E Tech Care</h1>
          )}
          {!isSidebarOpen && (
            <h1 className="text-xl font-bold">E</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
        {menuItems.map(item => {
          // Hide admin-only items from non-admins
          if (item.adminOnly && !isAdmin()) return null;

          if (item.hasSubmenu) {
            const isActive = item.submenu.some(sub => currentPage === sub.id);
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    const stateKey = item.id === 'settings-menu' ? 'settingsOpen' : 'reportsOpen';
                    if (stateKey === 'settingsOpen') {
                      if (isSidebarOpen) {
                        setSettingsOpen(!settingsOpen);
                      } else {
                        setIsSidebarOpen(true);
                        setSettingsOpen(true);
                      }
                    } else {
                      if (isSidebarOpen) {
                        setReportsOpen(!reportsOpen);
                      } else {
                        setIsSidebarOpen(true);
                        setReportsOpen(true);
                      }
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 shadow-lg'
                      : 'hover:bg-blue-700'
                  }`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    {isSidebarOpen && (
                      <span className="font-medium text-base">{item.label}</span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${
                        item.id === 'settings-menu' 
                          ? (settingsOpen ? 'rotate-180' : '')
                          : (reportsOpen ? 'rotate-180' : '')
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {isSidebarOpen && (
                  <div className={`ml-4 mt-2 space-y-1 overflow-hidden transition-all ${
                    item.id === 'settings-menu'
                      ? (settingsOpen ? 'max-h-96' : 'max-h-0')
                      : (reportsOpen ? 'max-h-96' : 'max-h-0')
                  }`}>
                    {item.submenu.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => onNavigate(subItem.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                          currentPage === subItem.id
                            ? 'bg-blue-500'
                            : 'hover:bg-blue-700/50'
                        }`}
                      >
                        <span>•</span>
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 shadow-lg'
                  : 'hover:bg-blue-700'
              }`}
              title={!isSidebarOpen ? item.label : ''}
            >
              {item.icon}
              {isSidebarOpen && (
                <span className="font-medium text-base">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-blue-700">
        {isSidebarOpen ? (
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'profile' 
                  ? 'bg-blue-600' 
                  : 'bg-blue-700 hover:bg-blue-600'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate">{user?.username}</p>
                <p className="text-xs text-blue-300">
                  {isAdmin() ? 'Admin' : 'User'}
                </p>
              </div>
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('profile')}
              className={`w-full p-3 rounded-lg transition-colors ${
                currentPage === 'profile'
                  ? 'bg-blue-600'
                  : 'bg-blue-700 hover:bg-blue-600'
              }`}
              title="Profile"
            >
              <div className="w-8 h-8 mx-auto rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </button>

            <button
              onClick={logout}
              className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;