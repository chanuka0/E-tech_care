import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import FaultManagement from './FaultManagement';
import ExpenseCategoryManagement from '../expenses/ExpenseCategoryManagement';
import ServiceCategoryManagement from '../faults/Servicecategorymanagement.jsx';
import BrandManagement from './BrandManagement';
import ModelManagement from './ModelManagement';
import ModelNumberManagement from './ModelNumberManagement';
import ProcessorManagement from './ProcessorManagement';
import DeviceConditionManagement from './DeviceConditionManagement';

const Settings = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('faults');

  const tabs = [
    { id: 'faults', label: 'Fault Management', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'expenses', label: 'Expense Categories', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'services', label: 'Service Categories', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'brands', label: 'Brand Management', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { id: 'models', label: 'Model Management', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'model-numbers', label: 'Model Numbers', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'processors', label: 'Processors', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { id: 'conditions', label: 'Device Conditions', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'system', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  // System Settings data
  const systemSettings = [
    {
      id: 'general',
      name: 'General Settings',
      description: 'Configure basic system preferences and defaults',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      status: 'active'
    },
    {
      id: 'notifications',
      name: 'Notification Settings',
      description: 'Manage email and system notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      status: 'active'
    },
    {
      id: 'security',
      name: 'Security Settings',
      description: 'Configure authentication and access control',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      status: 'active'
    },
    {
      id: 'backup',
      name: 'Backup & Restore',
      description: 'Manage data backups and restoration',
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      status: 'active'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Connect with third-party services and APIs',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      status: 'inactive'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      description: 'Customize theme and display preferences',
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      status: 'active'
    }
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
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage system configuration and data - Select a category below</p>
      </div>

      {/* Tabs - Grid Layout for Easy Access */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 shadow-2xl scale-105'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-102'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all ${
              activeTab === tab.id
                ? 'bg-white bg-opacity-20'
                : 'bg-blue-50 group-hover:bg-blue-100'
            }`}>
              <svg className={`w-7 h-7 ${activeTab === tab.id ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
            </div>
            <span className={`text-sm font-semibold text-center transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
            }`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tabs.find(t => t.id === activeTab)?.icon} />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-sm text-gray-600">Manage and configure settings</p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'faults' && <FaultManagement />}
          
          {activeTab === 'expenses' && <ExpenseCategoryManagement />}

          {activeTab === 'services' && <ServiceCategoryManagement />}

          {activeTab === 'brands' && <BrandManagement />}

          {activeTab === 'models' && <ModelManagement />}

          {activeTab === 'model-numbers' && <ModelNumberManagement />}

          {activeTab === 'processors' && <ProcessorManagement />}

          {activeTab === 'conditions' && <DeviceConditionManagement />}
          
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">System Configuration</h3>
                <p className="text-gray-600">Configure system-wide preferences and options</p>
              </div>

              {/* System Settings List */}
              <div className="grid gap-4">
                {systemSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={setting.icon} />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {setting.name}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            setting.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {setting.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Click on any setting to configure its options. Some settings may require system restart to take effect.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">About E Tech Care POS System</h3>
                <p className="text-gray-600">Comprehensive Point of Sale system for electronics repair and service management</p>
              </div>

              {/* System Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Version</p>
                      <p className="text-2xl font-bold text-gray-900">1.0.0</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Latest stable release</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Release Date</p>
                      <p className="text-2xl font-bold text-gray-900">Dec 2024</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Current version release</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-indigo-900 mb-3">System Description</h4>
                <p className="text-indigo-800 leading-relaxed">
                  E Tech Care is a comprehensive Point of Sale system designed specifically for electronics repair shops and service centers. 
                  It streamlines operations with features including job card management, inventory tracking, invoicing, fault diagnosis, 
                  service categorization, and financial management. The system provides a complete solution for managing device repairs, 
                  tracking customer information, managing parts inventory, and generating detailed reports for business insights.
                </p>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Job Card Management',
                    'Inventory Management',
                    'Invoice Generation',
                    'Fault Tracking',
                    'Service Categories',
                    'Brand Management',
                    'Model Management',
                    'Model Number Management',
                    'Processor Management',
                    'Device Condition Management',
                    'Expense Management',
                    'Admin Dashboard'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">Support</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    For technical support and assistance, please contact your system administrator or IT support team.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">Updates</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    System updates are deployed automatically. Check the version number above to ensure you're running the latest release.
                  </p>
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
