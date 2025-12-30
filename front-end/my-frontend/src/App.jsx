
// import { useState } from 'react';
// import AuthProvider, { useAuth } from './auth/AuthProvider';
// import LoginForm from './auth/LoginForm';
// import RegisterForm from './auth/RegisterForm';
// import Sidebar from './Sidebar';
// import Dashboard from './dashboard/Dashboard';
// import JobCards from './jobcards/JobCards';
// import JobCardCreate from './jobcards/JobCardCreate';
// import InventoryManagement from './inventory/InventoryManagement';
// import InvoiceList from './invoices/InvoiceList';
// import Settings from './faults/Settings';
// import ExpenseManagement from './expenses/ExpenseManagement';
// import StockReport from './inventory/StockReport';
// import IncomeExpenseReport from './faults/IncomeExpenseReport';
// import UserProfile from './components/UserProfile';
// import NotificationBell from './components/NotificationBell';

// const MainContent = () => {
//   const { user } = useAuth();
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   const pages = {
//     dashboard: { component: Dashboard, title: 'Dashboard' },
//     jobcards: { component: JobCards, title: 'Job Cards' },
//     'jobcards-create': { component: JobCardCreate, title: 'Create Job Card' },
//     inventory: { component: InventoryManagement, title: 'Inventory' },
//     invoices: { component: InvoiceList, title: 'Invoices' },
//     expenses: { component: ExpenseManagement, title: 'Expenses' },
//     reports: { component: Dashboard, title: 'Reports Dashboard' },
//     'income-expense-report': { component: IncomeExpenseReport, title: 'Income vs Expenses Report' },
//     'stock-report': { component: StockReport, title: 'Stock In/Out Report' },
//     settings: { component: Settings, title: 'Settings' },
//     profile: { component: UserProfile, title: 'User Profile' }
//   };

//   const pageTitle = pages[currentPage]?.title || 'Dashboard';

//   const handleJobCardCreated = () => setCurrentPage('jobcards');
//   const handleCancelCreate = () => setCurrentPage('jobcards');
//   const handleNavigateToProfile = () => setCurrentPage('profile');

//   const renderComponent = () => {
//     if (currentPage === 'jobcards-create') {
//       return <JobCardCreate onSuccess={handleJobCardCreated} onCancel={handleCancelCreate} />;
//     }
//     if (currentPage === 'jobcards') {
//       return <JobCards onCreateNew={() => setCurrentPage('jobcards-create')} />;
//     }
//     if (currentPage === 'dashboard') {
//       return <Dashboard onNavigate={setCurrentPage} />;
//     }
//     if (currentPage === 'profile') {
//       return <UserProfile />;
//     }
//     const CurrentComponent = pages[currentPage]?.component || Dashboard;
//     return <CurrentComponent />;
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

//       {/* Main Content Area */}
//       <main className="flex-1 overflow-auto">
//         {/* Top Bar */}
//         <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
//               <p className="text-sm text-gray-500 mt-1">
//                 {new Date().toLocaleDateString('en-US', {
//                   weekday: 'long',
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 })}
//               </p>
//             </div>

//             {/* Notifications and User Info */}
//             <div className="flex items-center space-x-4">
//               {/* Notification Bell Component */}
//               <NotificationBell />

//               {/* User Info with Profile Navigation */}
//               <button
//                 onClick={handleNavigateToProfile}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
//                   {user?.username?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div className="text-left">
//                   <span className="font-medium text-gray-700 block">{user?.username || 'User'}</span>
//                   <span className="text-xs text-gray-500 block">View Profile</span>
//                 </div>
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className={currentPage === 'dashboard' ? '' : 'p-6'}>
//           {renderComponent()}
//         </div>
//       </main>
//     </div>
//   );
// };

// const AuthWrapper = () => {
//   const { isAuthenticated } = useAuth();
//   const [showRegister, setShowRegister] = useState(false);

//   if (!isAuthenticated) {
//     return showRegister ? (
//       <RegisterForm onToggleForm={() => setShowRegister(false)} />
//     ) : (
//       <LoginForm onToggleForm={() => setShowRegister(true)} />
//     );
//   }

//   return <MainContent />;
// };

// const App = () => (
//   <AuthProvider>
//     <AuthWrapper />
//   </AuthProvider>
// );

// export default App;












import { useState, useEffect } from 'react';
import AuthProvider, { useAuth } from './auth/AuthProvider';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import Sidebar from './Sidebar';
import Dashboard from './dashboard/Dashboard';
import JobCards from './jobcards/JobCards';
import JobCardCreate from './jobcards/JobCardCreate';
import InventoryManagement from './inventory/InventoryManagement';
import InvoiceList from './invoices/InvoiceList';
import Settings from './faults/Settings';
import ExpenseManagement from './expenses/ExpenseManagement';
import StockReport from './inventory/StockReport';
import IncomeExpenseReport from './faults/IncomeExpenseReport';
import UserProfile from './components/UserProfile';
import NotificationBell from './components/NotificationBell';
import UsersManagement from './pages/UsersManagement';

// In your main component or routing section:


const MainContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pages = {
    dashboard: { component: Dashboard, title: 'Dashboard' },
    jobcards: { component: JobCards, title: 'Job Cards' },
    'jobcards-create': { component: JobCardCreate, title: 'Create Job Card' },
    inventory: { component: InventoryManagement, title: 'Inventory' },
    invoices: { component: InvoiceList, title: 'Invoices' },
    expenses: { component: ExpenseManagement, title: 'Expenses' },
    reports: { component: Dashboard, title: 'Reports Dashboard' },
    'income-expense-report': { component: IncomeExpenseReport, title: 'Income vs Expenses Report' },
    'stock-report': { component: StockReport, title: 'Stock In/Out Report' },
    settings: { component: Settings, title: 'Settings' },
    profile: { component: UserProfile, title: 'User Profile' }
  };

  const pageTitle = pages[currentPage]?.title || 'Dashboard';

  const handleJobCardCreated = () => setCurrentPage('jobcards');
  const handleCancelCreate = () => setCurrentPage('jobcards');
  const handleNavigateToProfile = () => setCurrentPage('profile');

  const renderComponent = () => {
    if (currentPage === 'jobcards-create') {
      return <JobCardCreate onSuccess={handleJobCardCreated} onCancel={handleCancelCreate} />;
    }
    if (currentPage === 'jobcards') {
      return <JobCards onCreateNew={() => setCurrentPage('jobcards-create')} />;
    }
    if (currentPage === 'dashboard') {
      return <Dashboard onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'profile') {
      return <UserProfile />;
    }
    if (currentPage === 'users') {
      return <UsersManagement />;
    }

    const CurrentComponent = pages[currentPage]?.component || Dashboard;
    return <CurrentComponent />;
  };

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
              {/* Notification Bell Component */}
              <NotificationBell />

              {/* User Info with Profile Navigation */}
              <button
                onClick={handleNavigateToProfile}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <span className="font-medium text-gray-700 block">{user?.username || 'User'}</span>
                  <span className="text-xs text-gray-500 block">View Profile</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={currentPage === 'dashboard' ? '' : 'p-6'}>
          {renderComponent()}
        </div>
      </main>
    </div>
  );
};

const AuthWrapper = () => {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // If NOT authenticated, show login/register forms
  if (!isAuthenticated) {
    return (
      <div>
        {showRegister ? (
          <RegisterForm onToggleForm={() => setShowRegister(false)} />
        ) : (
          <LoginForm onToggleForm={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  // If authenticated, show the main application
  return <MainContent />;
};

const App = () => (
  <AuthProvider>
    <AuthWrapper />
  </AuthProvider>
);

export default App;