import { useState } from 'react';
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
import IncomeExpenseReport from './faults/IncomeExpenseReport'; // NEW: Import the income/expenses report

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
    reports: { component: Dashboard, title: 'Reports Dashboard' }, // You can create a dedicated reports dashboard later
    'income-expense-report': { component: IncomeExpenseReport, title: 'Income vs Expenses Report' }, // NEW
    'stock-report': { component: StockReport, title: 'Stock In/Out Report' },
    settings: { component: Settings, title: 'Settings' }
  };

  const CurrentComponent = pages[currentPage]?.component || Dashboard;
  const pageTitle = pages[currentPage]?.title || 'Dashboard';

  const handleJobCardCreated = () => setCurrentPage('jobcards');
  const handleCancelCreate = () => setCurrentPage('jobcards');

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
              {/* Notification Bell */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
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
        <div className={currentPage === 'dashboard' ? '' : 'p-6'}>{renderComponent()}</div>
      </main>
    </div>
  );
};

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

const App = () => (
  <AuthProvider>
    <AuthWrapper />
  </AuthProvider>
);

export default App;