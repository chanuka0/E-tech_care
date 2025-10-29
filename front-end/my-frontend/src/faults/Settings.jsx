
// import { useState } from 'react';
// import { useAuth } from '../auth/AuthProvider';
// import FaultManagement from './FaultManagement';
// import ExpenseCategoryManagement from './ExpenseCategoryManagement';

// const Settings = () => {
//   const { isAdmin } = useAuth();
//   const [activeTab, setActiveTab] = useState('faults');

//   const tabs = [
//     { id: 'faults', label: 'Fault Management', icon: 'M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7m0 0v2' },
//     { id: 'expenses', label: 'Expense Categories', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//     { id: 'system', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M9 11a2 2 0 11 4 0 2 2 0 01-4 0z' },
//     { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
//   ];

//   if (!isAdmin()) {
//     return (
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           <p className="font-medium">Access Denied</p>
//           <p className="text-sm mt-1">You do not have permission to access Settings. Only administrators can access this section.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
//         <p className="text-gray-600 mt-1">Manage system configuration and settings</p>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="border-b border-gray-200">
//           <div className="flex overflow-x-auto">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
//                   activeTab === tab.id
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
//                 </svg>
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6">
//           {activeTab === 'faults' && <FaultManagement />}
          
//           {activeTab === 'expenses' && <ExpenseCategoryManagement />}
          
//           {activeTab === 'system' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-blue-900 mb-2">System Settings</h3>
//                 <p className="text-blue-800">System configuration options will be available here.</p>
//               </div>
//             </div>
//           )}
          
//           {activeTab === 'about' && (
//             <div className="space-y-6">
//               <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-indigo-900 mb-4">About E Tech Care POS System</h3>
//                 <div className="text-indigo-800 space-y-3">
//                   <div>
//                     <p className="font-medium">Version</p>
//                     <p className="text-sm">1.0.0</p>
//                   </div>
//                   <div>
//                     <p className="font-medium">Description</p>
//                     <p className="text-sm">E Tech Care is a comprehensive Point of Sale system designed for electronics repair and service management.</p>
//                   </div>
//                   <div>
//                     <p className="font-medium">Features</p>
//                     <ul className="text-sm list-disc list-inside space-y-1">
//                       <li>Job Card Management</li>
//                       <li>Inventory Management</li>
//                       <li>Invoice Generation</li>
//                       <li>Fault Tracking</li>
//                       <li>Expense Management</li>
//                       <li>Admin Dashboard</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;

import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import FaultManagement from './FaultManagement';
import ExpenseCategoryManagement from './ExpenseCategoryManagement';
import ServiceCategoryManagement from './ServiceCategoryManagement';

const Settings = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('faults');

  const tabs = [
    { id: 'faults', label: 'Fault Management', icon: 'M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7m0 0v2' },
    { id: 'expenses', label: 'Expense Categories', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'services', label: 'Service Categories', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'system', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M9 11a2 2 0 11 4 0 2 2 0 01-4 0z' },
    { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Settings. Only administrators can access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'faults' && <FaultManagement />}
          
          {activeTab === 'expenses' && <ExpenseCategoryManagement />}

          {activeTab === 'services' && <ServiceCategoryManagement />}
          
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">System Settings</h3>
                <p className="text-blue-800">System configuration options will be available here.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">About E Tech Care POS System</h3>
                <div className="text-indigo-800 space-y-3">
                  <div>
                    <p className="font-medium">Version</p>
                    <p className="text-sm">1.0.0</p>
                  </div>
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm">E Tech Care is a comprehensive Point of Sale system designed for electronics repair and service management.</p>
                  </div>
                  <div>
                    <p className="font-medium">Features</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      <li>Job Card Management</li>
                      <li>Inventory Management</li>
                      <li>Invoice Generation</li>
                      <li>Fault Tracking</li>
                      <li>Service Categories</li>
                      <li>Expense Management</li>
                      <li>Admin Dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;