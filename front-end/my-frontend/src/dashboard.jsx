import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Monitor,
  Smartphone,
  Laptop,
  Package,
  Bell,
  Search,
  Calendar,
  DollarSign,
  FileText,
  ShoppingCart,
  Star,
  Battery,
  HardDrive,
  Cpu,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  Zap,
  User,
  Phone,
  Mail,
  MapPin,
  Clock4,
  IndianRupee,
  Package2,
  Activity,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ETechCareDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user] = useState({ 
    name: 'Rajesh Kumar', 
    role: 'ADMIN', 
    email: 'admin@etechcare.com' 
  });

  const dashboardStats = [
    { 
      title: 'Pending Jobs', 
      value: '15', 
      change: '+3 today', 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      trend: 'up'
    },
    { 
      title: 'Completed Today', 
      value: '12', 
      change: '+4 from yesterday', 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      trend: 'up'
    },
    { 
      title: 'Total Revenue', 
      value: '₹1,25,240', 
      change: '+18% this month', 
      icon: IndianRupee, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: 'up'
    },
    { 
      title: 'Low Stock Alerts', 
      value: '8', 
      change: '3 critical', 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      trend: 'down'
    }
  ];

  const recentJobCards = [
    { 
      id: 'JC001', 
      jobCardNumber: 'JC-2024-001',
      customerName: 'Priya Sharma', 
      contactNumber: '+91 98765 43210',
      laptopBrand: 'Dell',
      serialNumber: 'DL789456123',
      specialNote: 'Screen flickering, possible display cable issue',
      status: 'IN_PROGRESS', 
      priority: 'High',
      expectedDeliveryDate: '2024-01-22',
      advanceAmount: 2500,
      totalAmount: 8500,
      withCharger: true,
      oneDayService: false
    },
    { 
      id: 'JC002', 
      jobCardNumber: 'JC-2024-002',
      customerName: 'Amit Singh', 
      contactNumber: '+91 87654 32109',
      laptopBrand: 'HP',
      serialNumber: 'HP456789012',
      specialNote: 'Keyboard not working, spilled water',
      status: 'PENDING', 
      priority: 'Medium',
      expectedDeliveryDate: '2024-01-23',
      advanceAmount: 1000,
      totalAmount: 3500,
      withCharger: false,
      oneDayService: true
    },
    { 
      id: 'JC003', 
      jobCardNumber: 'JC-2024-003',
      customerName: 'Sneha Patel', 
      contactNumber: '+91 76543 21098',
      laptopBrand: 'Lenovo',
      serialNumber: 'LN123456789',
      specialNote: 'Hard disk making noise, backup required',
      status: 'COMPLETED', 
      priority: 'High',
      expectedDeliveryDate: '2024-01-19',
      advanceAmount: 2000,
      totalAmount: 7200,
      withCharger: true,
      oneDayService: false
    }
  ];

  const inventoryItems = [
    { 
      itemId: 1, 
      name: '8GB DDR4 RAM', 
      description: '8GB DDR4 2400MHz memory module',
      category: 'RAM', 
      stockQuantity: 12, 
      thresholdLevel: 10, 
      purchasePrice: 3200, 
      sellingPrice: 4500, 
      supplier: 'Tech Components Ltd'
    },
    { 
      itemId: 2, 
      name: '15.6" LCD Display', 
      description: '15.6 inch Full HD LCD display panel',
      category: 'DISPLAY', 
      stockQuantity: 6, 
      thresholdLevel: 5, 
      purchasePrice: 4800, 
      sellingPrice: 7200, 
      supplier: 'Display Solutions Inc'
    },
    { 
      itemId: 3, 
      name: '1TB SSD', 
      description: '1TB SATA SSD solid state drive',
      category: 'STORAGE', 
      stockQuantity: 3, 
      thresholdLevel: 5, 
      purchasePrice: 6400, 
      sellingPrice: 8000, 
      supplier: 'Storage World'
    },
    { 
      itemId: 4, 
      name: 'Laptop Keyboard', 
      description: 'Generic laptop keyboard replacement',
      category: 'INPUT', 
      stockQuantity: 15, 
      thresholdLevel: 8, 
      purchasePrice: 1200, 
      sellingPrice: 2000, 
      supplier: 'Input Devices Co'
    }
  ];

  const recentInvoices = [
    { 
      id: 'INV001', 
      invoiceNumber: 'INV-2024-001',
      jobCardId: 'JC003', 
      customerName: 'Sneha Patel', 
      customerContact: '+91 76543 21098',
      totalAmount: 7200,
      balanceAmount: 5200,
      status: 'PAID', 
      createdDate: '2024-01-19'
    },
    { 
      id: 'INV002', 
      invoiceNumber: 'INV-2024-002',
      jobCardId: 'JC004', 
      customerName: 'Rohit Gupta', 
      customerContact: '+91 65432 10987',
      totalAmount: 3800,
      balanceAmount: 2300,
      status: 'PENDING', 
      createdDate: '2024-01-20'
    },
    { 
      id: 'INV003', 
      invoiceNumber: 'INV-2024-003',
      jobCardId: 'JC005', 
      customerName: 'Kavya Reddy', 
      customerContact: '+91 54321 09876',
      totalAmount: 3400,
      balanceAmount: 2400,
      status: 'PARTIALLY_PAID', 
      createdDate: '2024-01-20'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBrandIcon = (brand) => {
    switch (brand) {
      case 'Dell': return <Monitor className="h-4 w-4 text-blue-600" />;
      case 'HP': return <Laptop className="h-4 w-4 text-blue-800" />;
      case 'Lenovo': return <Cpu className="h-4 w-4 text-red-600" />;
      case 'ASUS': return <Zap className="h-4 w-4 text-yellow-600" />;
      default: return <Monitor className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'RAM': return <Cpu className="h-4 w-4 text-blue-600" />;
      case 'STORAGE': return <HardDrive className="h-4 w-4 text-green-600" />;
      case 'DISPLAY': return <Monitor className="h-4 w-4 text-purple-600" />;
      case 'BATTERY': return <Battery className="h-4 w-4 text-yellow-600" />;
      case 'INPUT': return <Package className="h-4 w-4 text-orange-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    E Tech Care
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Device Repair Shop POS</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs, customers, items..."
                  className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              
              <button className="relative p-2 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  8
                </span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl px-2 sm:px-4 py-1 sm:py-2 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-2 sm:px-6 shadow-sm overflow-x-auto">
        <div className="flex space-x-1 sm:space-x-8 min-w-max">
          {[
            { id: 'overview', label: 'Dashboard', icon: BarChart3 },
            { id: 'job-cards', label: 'Jobs', icon: FileText },
            { id: 'inventory', label: 'Stock', icon: Package },
            { id: 'invoices', label: 'Bills', icon: DollarSign },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'reports', label: 'Reports', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-3 sm:py-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-3 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold mb-2">
                    Welcome back, {user.name.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-lg">
                    Here's what's happening at E Tech Care today
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Wrench className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">{stat.title}</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                      <p className={`text-xs sm:text-sm mt-1 sm:mt-2 flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" /> : <TrendingDown className="h-3 w-3 mr-1 flex-shrink-0" />}
                        <span className="truncate">{stat.change}</span>
                      </p>
                    </div>
                    <div className={`p-2 sm:p-4 rounded-lg sm:rounded-xl ${stat.bg} shadow-sm flex-shrink-0 ml-2`}>
                      <stat.icon className={`h-5 w-5 sm:h-8 sm:w-8 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Job Cards and Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Jobs</h3>
                    <button 
                      onClick={() => setActiveTab('job-cards')}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold bg-blue-50 px-2 sm:px-3 py-1 rounded-lg transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {recentJobCards.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getBrandIcon(job.laptopBrand)}
                            <span className="font-bold text-gray-900">{job.jobCardNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(job.totalAmount)}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-800">{job.customerName}</p>
                          <p className="text-sm text-gray-600">{job.contactNumber}</p>
                          <p className="text-sm text-gray-600">{job.specialNote}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4" />
                      <span>New Job</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Package className="h-4 w-4" />
                      <span>Add Stock</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'job-cards' && <FileText className="h-8 w-8 text-gray-600" />}
                {activeTab === 'inventory' && <Package className="h-8 w-8 text-gray-600" />}
                {activeTab === 'invoices' && <DollarSign className="h-8 w-8 text-gray-600" />}
                {activeTab === 'customers' && <Users className="h-8 w-8 text-gray-600" />}
                {activeTab === 'reports' && <BarChart3 className="h-8 w-8 text-gray-600" />}
                {activeTab === 'settings' && <Settings className="h-8 w-8 text-gray-600" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                {activeTab.replace('-', ' ')} Section
              </h3>
              <p className="text-gray-600">
                This section will contain your {activeTab.replace('-', ' ')} management features.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ETechCareDashboard;