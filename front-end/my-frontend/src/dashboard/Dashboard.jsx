
// import { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// const useApi = () => {
//   return {
//     apiCall: async (url) => {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:8081${url}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) throw new Error('API call failed');
//       return response.json();
//     }
//   };
// };

// const Dashboard = ({ onNavigate }) => {
//   const { apiCall } = useApi();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [profitData, setProfitData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [currentDateTime, setCurrentDateTime] = useState(new Date());
//   const [dateRange, setDateRange] = useState({
//     start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 16),
//     end: new Date().toISOString().slice(0, 16)
//   });
//   const [showProfitReport, setShowProfitReport] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/reports/dashboard');
//       console.log('📊 Dashboard API Response:', data);
//       console.log('Available fields:', Object.keys(data));
//       setDashboardData(data);
//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//       setError('Failed to load dashboard data');
//     }
//     setLoading(false);
//   };

//   const fetchProfitReport = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall(
//         `/api/reports/profit?start=${dateRange.start}&end=${dateRange.end}`
//       );
//       console.log('Profit data:', data);
//       setProfitData(data);
//       setShowProfitReport(true);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load profit report');
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'LKR'
//     }).format(value || 0);
//   };

//   const formatDateTime = (date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     }).format(date);
//   };

//   const handleQuickAction = (action) => {
//     if (onNavigate) {
//       switch(action) {
//         case 'jobcard':
//           onNavigate('jobcards-create');
//           break;
//         case 'invoice':
//           onNavigate('invoices');
//           break;
//         case 'expense':
//           onNavigate('expenses');
//           break;
//         case 'inventory':
//           onNavigate('inventory');
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   if (loading && !dashboardData) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const chartData = dashboardData ? [
//     {
//       name: 'Today',
//       Revenue: dashboardData.dailyRevenue || 0,
//       Expenses: dashboardData.dailyExpenses || 0,
//       Profit: dashboardData.dailyProfit || 0
//     },
//     {
//       name: 'This Month',
//       Revenue: dashboardData.monthlyRevenue || 0,
//       Expenses: dashboardData.monthlyExpenses || 0,
//       Profit: dashboardData.monthlyProfit || 0
//     }
//   ] : [];

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       {/* Header with Date/Time */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">E Tech Care Dashboard</h1>
//             <p className="text-blue-100">Welcome back! Here's your business overview</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-blue-100">Current Date & Time</p>
//             <p className="text-xl font-semibold">{formatDateTime(currentDateTime)}</p>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={fetchDashboardData} className="text-red-700 hover:text-red-900 font-medium">
//             Retry
//           </button>
//         </div>
//       )}

//       {/* Quick Stats Grid */}
//       {dashboardData && (
//         <>
//           {/* Job Status Cards - Top Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Total Jobs */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Total Jobs</p>
//                   <p className="text-3xl font-bold text-blue-600">{dashboardData.totalJobs || 0}</p>
//                 </div>
//                 <div className="bg-blue-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Pending Jobs */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Pending Jobs</p>
//                   <p className="text-3xl font-bold text-yellow-600">{dashboardData.pendingJobs || 0}</p>
//                 </div>
//                 <div className="bg-yellow-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* In Progress Jobs */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
//                   <p className="text-3xl font-bold text-blue-500">{dashboardData.inProgressJobs || 0}</p>
//                 </div>
//                 <div className="bg-blue-50 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Completed Jobs */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
//                   <p className="text-3xl font-bold text-green-600">{dashboardData.completedJobs || 0}</p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions - MOVED AFTER JOB CARD COUNT */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <button 
//                 onClick={() => handleQuickAction('expense')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Add Expense
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('invoice')}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Create Invoice
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('jobcard')}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 New Job Card
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('inventory')}
//                 className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                 </svg>
//                 Manage Inventory
//               </button>
//             </div>
//           </div>

//           {/* Financial Stats - Second Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Daily Revenue */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
//                   <p className="text-3xl font-bold text-green-600">
//                     {formatCurrency(dashboardData.dailyRevenue)}
//                   </p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Daily Profit */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Profit</p>
//                   <p className={`text-3xl font-bold ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {formatCurrency(dashboardData.dailyProfit)}
//                   </p>
//                 </div>
//                 <div className={`${dashboardData.dailyProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
//                   <svg className={`w-8 h-8 ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Monthly Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-blue-100 mb-2">Monthly Revenue</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</p>
//             </div>

//             <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-red-100 mb-2">Monthly Expenses</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyExpenses)}</p>
//             </div>

//             <div className={`bg-gradient-to-br ${dashboardData.monthlyProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} p-6 rounded-lg shadow-lg text-white`}>
//               <p className={`text-sm font-medium ${dashboardData.monthlyProfit >= 0 ? 'text-green-100' : 'text-red-100'} mb-2`}>Monthly Profit</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyProfit)}</p>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Bar Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="Revenue" fill="#10b981" />
//                   <Bar dataKey="Expenses" fill="#ef4444" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Line Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Custom Date Range Profit Report */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Profit Report</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.start}
//                   onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.end}
//                   onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={fetchProfitReport}
//                   disabled={loading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//                 >
//                   {loading ? 'Loading...' : 'Generate Report'}
//                 </button>
//               </div>
//             </div>

//             {showProfitReport && profitData && (
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <p className="text-sm font-medium text-blue-700 mb-1">Total Revenue</p>
//                   <p className="text-2xl font-bold text-blue-900">{formatCurrency(profitData.totalRevenue)}</p>
//                 </div>
//                 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//                   <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
//                   <p className="text-2xl font-bold text-red-900">{formatCurrency(profitData.totalExpenses)}</p>
//                 </div>
//                 <div className={`${profitData.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
//                   <p className={`text-sm font-medium ${profitData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>Net Profit</p>
//                   <p className={`text-2xl font-bold ${profitData.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
//                     {formatCurrency(profitData.netProfit)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;





// import { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// const useApi = () => {
//   return {
//     apiCall: async (url) => {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:8081${url}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) throw new Error('API call failed');
//       return response.json();
//     }
//   };
// };

// const Dashboard = ({ onNavigate }) => {
//   const { apiCall } = useApi();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [profitData, setProfitData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [currentDateTime, setCurrentDateTime] = useState(new Date());
//   const [dateRange, setDateRange] = useState({
//     start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 16),
//     end: new Date().toISOString().slice(0, 16)
//   });
//   const [showProfitReport, setShowProfitReport] = useState(false);
//   const [filterOneDayService, setFilterOneDayService] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/reports/dashboard');
//       console.log('📊 Dashboard API Response:', data);
//       console.log('Available fields:', Object.keys(data));
//       setDashboardData(data);
//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//       setError('Failed to load dashboard data');
//     }
//     setLoading(false);
//   };

//   const fetchProfitReport = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall(
//         `/api/reports/profit?start=${dateRange.start}&end=${dateRange.end}`
//       );
//       console.log('Profit data:', data);
//       setProfitData(data);
//       setShowProfitReport(true);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load profit report');
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'LKR'
//     }).format(value || 0);
//   };

//   const formatDateTime = (date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     }).format(date);
//   };

//   const handleQuickAction = (action) => {
//     if (onNavigate) {
//       switch(action) {
//         case 'jobcard':
//           onNavigate('jobcards-create');
//           break;
//         case 'invoice':
//           onNavigate('invoices');
//           break;
//         case 'expense':
//           onNavigate('expenses');
//           break;
//         case 'inventory':
//           onNavigate('inventory');
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     const icons = {
//       PENDING: '⏳',
//       IN_PROGRESS: '🔧',
//       WAITING_FOR_PARTS: '📦',
//       WAITING_FOR_APPROVAL: '👥',
//       COMPLETED: '✅',
//       DELIVERED: '🚚',
//       CANCELLED: '❌',
//       ONE_DAY_SERVICE: '🚨'
//     };
//     return icons[status] || '📄';
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'text-yellow-600',
//       IN_PROGRESS: 'text-blue-600',
//       WAITING_FOR_PARTS: 'text-orange-600',
//       WAITING_FOR_APPROVAL: 'text-purple-600',
//       COMPLETED: 'text-green-600',
//       DELIVERED: 'text-indigo-600',
//       CANCELLED: 'text-red-600',
//       ONE_DAY_SERVICE: 'text-red-600'
//     };
//     return colors[status] || 'text-gray-600';
//   };

//   // Get background color for status cards
//   const getStatusBgColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100',
//       IN_PROGRESS: 'bg-blue-100',
//       WAITING_FOR_PARTS: 'bg-orange-100',
//       WAITING_FOR_APPROVAL: 'bg-purple-100',
//       COMPLETED: 'bg-green-100',
//       DELIVERED: 'bg-indigo-100',
//       CANCELLED: 'bg-red-100',
//       ONE_DAY_SERVICE: 'bg-red-100'
//     };
//     return colors[status] || 'bg-gray-100';
//   };

//   if (loading && !dashboardData) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const chartData = dashboardData ? [
//     {
//       name: 'Today',
//       Revenue: dashboardData.dailyRevenue || 0,
//       Expenses: dashboardData.dailyExpenses || 0,
//       Profit: dashboardData.dailyProfit || 0
//     },
//     {
//       name: 'This Month',
//       Revenue: dashboardData.monthlyRevenue || 0,
//       Expenses: dashboardData.monthlyExpenses || 0,
//       Profit: dashboardData.monthlyProfit || 0
//     }
//   ] : [];

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       {/* Header with Date/Time */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">E Tech Care Dashboard</h1>
//             <p className="text-blue-100">Welcome back! Here's your business overview</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-blue-100">Current Date & Time</p>
//             <p className="text-xl font-semibold">{formatDateTime(currentDateTime)}</p>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={fetchDashboardData} className="text-red-700 hover:text-red-900 font-medium">
//             Retry
//           </button>
//         </div>
//       )}

//       {/* One Day Service Filter */}
//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Job Status Overview</h3>
//             <p className="text-sm text-gray-600">View all job card status counts</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <label className="flex items-center space-x-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={filterOneDayService}
//                 onChange={(e) => setFilterOneDayService(e.target.checked)}
//                 className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
//               />
//               <span className="text-sm font-medium text-gray-700">Show Only One Day Service</span>
//             </label>
//             {filterOneDayService && (
//               <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
//                 🚨 ONE DAY SERVICE
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Job Status Cards - Top Row */}
//       {dashboardData && (
//         <>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
//             {/* Total Jobs This Month */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Total Jobs (Month)</p>
//                   <p className="text-2xl font-bold text-blue-600">{dashboardData.totalJobsThisMonth || 0}</p>
//                 </div>
//                 <div className="bg-blue-100 p-2 rounded-full">
//                   <span className="text-lg">📊</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 All jobs this month
//               </div>
//             </div>

//             {/* Pending Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Pending Jobs</p>
//                   <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingJobs || 0}</p>
//                 </div>
//                 <div className="bg-yellow-100 p-2 rounded-full">
//                   <span className="text-lg">⏳</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Waiting to start
//               </div>
//             </div>

//             {/* In Progress Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
//                   <p className="text-2xl font-bold text-blue-500">{dashboardData.inProgressJobs || 0}</p>
//                 </div>
//                 <div className="bg-blue-50 p-2 rounded-full">
//                   <span className="text-lg">🔧</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Currently working
//               </div>
//             </div>

//             {/* Waiting for Parts */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Parts</p>
//                   <p className="text-2xl font-bold text-orange-600">{dashboardData.waitingForPartsJobs || 0}</p>
//                 </div>
//                 <div className="bg-orange-100 p-2 rounded-full">
//                   <span className="text-lg">📦</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Need parts delivery
//               </div>
//             </div>

//             {/* Waiting for Approval */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Approval</p>
//                   <p className="text-2xl font-bold text-purple-600">{dashboardData.waitingForApprovalJobs || 0}</p>
//                 </div>
//                 <div className="bg-purple-100 p-2 rounded-full">
//                   <span className="text-lg">👥</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Customer approval needed
//               </div>
//             </div>

//             {/* Completed Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
//                   <p className="text-2xl font-bold text-green-600">{dashboardData.completedJobs || 0}</p>
//                 </div>
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <span className="text-lg">✅</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Ready for delivery
//               </div>
//             </div>

//             {/* One Day Service */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">One Day Service</p>
//                   <p className="text-2xl font-bold text-red-600">{dashboardData.oneDayServiceJobs || 0}</p>
//                 </div>
//                 <div className="bg-red-100 p-2 rounded-full">
//                   <span className="text-lg">🚨</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 24-hour priority jobs
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <button 
//                 onClick={() => handleQuickAction('expense')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Add Expense
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('invoice')}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Create Invoice
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('jobcard')}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 New Job Card
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('inventory')}
//                 className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                 </svg>
//                 Manage Inventory
//               </button>
//             </div>
//           </div>

//           {/* Financial Stats - Second Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Daily Revenue */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
//                   <p className="text-3xl font-bold text-green-600">
//                     {formatCurrency(dashboardData.dailyRevenue)}
//                   </p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Daily Profit */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Profit</p>
//                   <p className={`text-3xl font-bold ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {formatCurrency(dashboardData.dailyProfit)}
//                   </p>
//                 </div>
//                 <div className={`${dashboardData.dailyProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
//                   <svg className={`w-8 h-8 ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Monthly Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-blue-100 mb-2">Monthly Revenue</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</p>
//             </div>

//             <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-red-100 mb-2">Monthly Expenses</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyExpenses)}</p>
//             </div>

//             <div className={`bg-gradient-to-br ${dashboardData.monthlyProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} p-6 rounded-lg shadow-lg text-white`}>
//               <p className={`text-sm font-medium ${dashboardData.monthlyProfit >= 0 ? 'text-green-100' : 'text-red-100'} mb-2`}>Monthly Profit</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyProfit)}</p>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Bar Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="Revenue" fill="#10b981" />
//                   <Bar dataKey="Expenses" fill="#ef4444" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Line Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Custom Date Range Profit Report */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Profit Report</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.start}
//                   onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.end}
//                   onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={fetchProfitReport}
//                   disabled={loading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//                 >
//                   {loading ? 'Loading...' : 'Generate Report'}
//                 </button>
//               </div>
//             </div>

//             {showProfitReport && profitData && (
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <p className="text-sm font-medium text-blue-700 mb-1">Total Revenue</p>
//                   <p className="text-2xl font-bold text-blue-900">{formatCurrency(profitData.totalRevenue)}</p>
//                 </div>
//                 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//                   <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
//                   <p className="text-2xl font-bold text-red-900">{formatCurrency(profitData.totalExpenses)}</p>
//                 </div>
//                 <div className={`${profitData.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
//                   <p className={`text-sm font-medium ${profitData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>Net Profit</p>
//                   <p className={`text-2xl font-bold ${profitData.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
//                     {formatCurrency(profitData.netProfit)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;




// import { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// const useApi = () => {
//   return {
//     apiCall: async (url) => {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:8081${url}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) throw new Error('API call failed');
//       return response.json();
//     }
//   };
// };

// const Dashboard = ({ onNavigate }) => {
//   const { apiCall } = useApi();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [profitData, setProfitData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [currentDateTime, setCurrentDateTime] = useState(new Date());
//   const [dateRange, setDateRange] = useState({
//     start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 16),
//     end: new Date().toISOString().slice(0, 16)
//   });
//   const [showProfitReport, setShowProfitReport] = useState(false);
//   const [filterOneDayService, setFilterOneDayService] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // NEW: Function to calculate job card counts from the job cards array
//   const calculateJobCardCounts = (jobCards) => {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
//     // Filter job cards for this month
//     const jobCardsThisMonth = jobCards.filter(job => {
//       const jobDate = new Date(job.createdAt);
//       return jobDate >= startOfMonth;
//     });

//     // Count by status
//     const pendingJobs = jobCards.filter(job => job.status === 'PENDING').length;
//     const inProgressJobs = jobCards.filter(job => job.status === 'IN_PROGRESS').length;
//     const waitingForPartsJobs = jobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length;
//     const waitingForApprovalJobs = jobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length;
//     const completedJobs = jobCards.filter(job => job.status === 'COMPLETED').length;
//     const deliveredJobs = jobCards.filter(job => job.status === 'DELIVERED').length;
//     const cancelledJobs = jobCards.filter(job => job.status === 'CANCELLED').length;
//     const oneDayServiceJobs = jobCards.filter(job => job.oneDayService === true).length;

//     return {
//       totalJobsThisMonth: jobCardsThisMonth.length,
//       pendingJobs,
//       inProgressJobs,
//       waitingForPartsJobs,
//       waitingForApprovalJobs,
//       completedJobs,
//       deliveredJobs,
//       cancelledJobs,
//       oneDayServiceJobs
//     };
//   };

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/reports/dashboard');
//       console.log('📊 Dashboard API Response:', data);
//       console.log('Available fields:', Object.keys(data));
      
//       // NEW: Fetch job cards for counts
//       const jobCardsResponse = await apiCall('/api/jobcards');
//       console.log('📋 Job Cards Fetched:', jobCardsResponse.length);
      
//       // NEW: Calculate job card counts
//       const jobCardCounts = calculateJobCardCounts(jobCardsResponse);
//       console.log('📊 Calculated Job Card Counts:', jobCardCounts);
      
//       // NEW: Merge with existing dashboard data
//       const mergedData = {
//         ...data,
//         ...jobCardCounts
//       };
      
//       setDashboardData(mergedData);
//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//       setError('Failed to load dashboard data');
//     }
//     setLoading(false);
//   };

//   const fetchProfitReport = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall(
//         `/api/reports/profit?start=${dateRange.start}&end=${dateRange.end}`
//       );
//       console.log('Profit data:', data);
//       setProfitData(data);
//       setShowProfitReport(true);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load profit report');
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'LKR'
//     }).format(value || 0);
//   };

//   const formatDateTime = (date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     }).format(date);
//   };

//   const handleQuickAction = (action) => {
//     if (onNavigate) {
//       switch(action) {
//         case 'jobcard':
//           onNavigate('jobcards-create');
//           break;
//         case 'invoice':
//           onNavigate('invoices');
//           break;
//         case 'expense':
//           onNavigate('expenses');
//           break;
//         case 'inventory':
//           onNavigate('inventory');
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     const icons = {
//       PENDING: '⏳',
//       IN_PROGRESS: '🔧',
//       WAITING_FOR_PARTS: '📦',
//       WAITING_FOR_APPROVAL: '👥',
//       COMPLETED: '✅',
//       DELIVERED: '🚚',
//       CANCELLED: '❌',
//       ONE_DAY_SERVICE: '🚨'
//     };
//     return icons[status] || '📄';
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'text-yellow-600',
//       IN_PROGRESS: 'text-blue-600',
//       WAITING_FOR_PARTS: 'text-orange-600',
//       WAITING_FOR_APPROVAL: 'text-purple-600',
//       COMPLETED: 'text-green-600',
//       DELIVERED: 'text-indigo-600',
//       CANCELLED: 'text-red-600',
//       ONE_DAY_SERVICE: 'text-red-600'
//     };
//     return colors[status] || 'text-gray-600';
//   };

//   // Get background color for status cards
//   const getStatusBgColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100',
//       IN_PROGRESS: 'bg-blue-100',
//       WAITING_FOR_PARTS: 'bg-orange-100',
//       WAITING_FOR_APPROVAL: 'bg-purple-100',
//       COMPLETED: 'bg-green-100',
//       DELIVERED: 'bg-indigo-100',
//       CANCELLED: 'bg-red-100',
//       ONE_DAY_SERVICE: 'bg-red-100'
//     };
//     return colors[status] || 'bg-gray-100';
//   };

//   if (loading && !dashboardData) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const chartData = dashboardData ? [
//     {
//       name: 'Today',
//       Revenue: dashboardData.dailyRevenue || 0,
//       Expenses: dashboardData.dailyExpenses || 0,
//       Profit: dashboardData.dailyProfit || 0
//     },
//     {
//       name: 'This Month',
//       Revenue: dashboardData.monthlyRevenue || 0,
//       Expenses: dashboardData.monthlyExpenses || 0,
//       Profit: dashboardData.monthlyProfit || 0
//     }
//   ] : [];

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       {/* Header with Date/Time */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">E Tech Care Dashboard</h1>
//             <p className="text-blue-100">Welcome back! Here's your business overview</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-blue-100">Current Date & Time</p>
//             <p className="text-xl font-semibold">{formatDateTime(currentDateTime)}</p>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={fetchDashboardData} className="text-red-700 hover:text-red-900 font-medium">
//             Retry
//           </button>
//         </div>
//       )}

//       {/* One Day Service Filter */}
//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Job Status Overview</h3>
//             <p className="text-sm text-gray-600">View all job card status counts</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <label className="flex items-center space-x-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={filterOneDayService}
//                 onChange={(e) => setFilterOneDayService(e.target.checked)}
//                 className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
//               />
//               <span className="text-sm font-medium text-gray-700">Show Only One Day Service</span>
//             </label>
//             {filterOneDayService && (
//               <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
//                 🚨 ONE DAY SERVICE
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Job Status Cards - Top Row */}
//       {dashboardData && (
//         <>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
//             {/* Total Jobs This Month */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Total Jobs (Month)</p>
//                   <p className="text-2xl font-bold text-blue-600">{dashboardData.totalJobsThisMonth || 0}</p>
//                 </div>
//                 <div className="bg-blue-100 p-2 rounded-full">
//                   <span className="text-lg">📊</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 All jobs this month
//               </div>
//             </div>

//             {/* Pending Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Pending Jobs</p>
//                   <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingJobs || 0}</p>
//                 </div>
//                 <div className="bg-yellow-100 p-2 rounded-full">
//                   <span className="text-lg">⏳</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Waiting to start
//               </div>
//             </div>

//             {/* In Progress Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
//                   <p className="text-2xl font-bold text-blue-500">{dashboardData.inProgressJobs || 0}</p>
//                 </div>
//                 <div className="bg-blue-50 p-2 rounded-full">
//                   <span className="text-lg">🔧</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Currently working
//               </div>
//             </div>

//             {/* Waiting for Parts */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Parts</p>
//                   <p className="text-2xl font-bold text-orange-600">{dashboardData.waitingForPartsJobs || 0}</p>
//                 </div>
//                 <div className="bg-orange-100 p-2 rounded-full">
//                   <span className="text-lg">📦</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Need parts delivery
//               </div>
//             </div>

//             {/* Waiting for Approval */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Approval</p>
//                   <p className="text-2xl font-bold text-purple-600">{dashboardData.waitingForApprovalJobs || 0}</p>
//                 </div>
//                 <div className="bg-purple-100 p-2 rounded-full">
//                   <span className="text-lg">👥</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Customer approval needed
//               </div>
//             </div>

//             {/* Completed Jobs */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
//                   <p className="text-2xl font-bold text-green-600">{dashboardData.completedJobs || 0}</p>
//                 </div>
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <span className="text-lg">✅</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 Ready for delivery
//               </div>
//             </div>

//             {/* One Day Service */}
//             <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-1">One Day Service</p>
//                   <p className="text-2xl font-bold text-red-600">{dashboardData.oneDayServiceJobs || 0}</p>
//                 </div>
//                 <div className="bg-red-100 p-2 rounded-full">
//                   <span className="text-lg">🚨</span>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs text-gray-500">
//                 24-hour priority jobs
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <button 
//                 onClick={() => handleQuickAction('expense')}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Add Expense
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('invoice')}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Create Invoice
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('jobcard')}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 New Job Card
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('inventory')}
//                 className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
//               >
//                 <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                 </svg>
//                 Manage Inventory
//               </button>
//             </div>
//           </div>

//           {/* Financial Stats - Second Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Daily Revenue */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
//                   <p className="text-3xl font-bold text-green-600">
//                     {formatCurrency(dashboardData.dailyRevenue)}
//                   </p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Daily Profit */}
//             <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Today's Profit</p>
//                   <p className={`text-3xl font-bold ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {formatCurrency(dashboardData.dailyProfit)}
//                   </p>
//                 </div>
//                 <div className={`${dashboardData.dailyProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
//                   <svg className={`w-8 h-8 ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Monthly Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-blue-100 mb-2">Monthly Revenue</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</p>
//             </div>

//             <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
//               <p className="text-sm font-medium text-red-100 mb-2">Monthly Expenses</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyExpenses)}</p>
//             </div>

//             <div className={`bg-gradient-to-br ${dashboardData.monthlyProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} p-6 rounded-lg shadow-lg text-white`}>
//               <p className={`text-sm font-medium ${dashboardData.monthlyProfit >= 0 ? 'text-green-100' : 'text-red-100'} mb-2`}>Monthly Profit</p>
//               <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyProfit)}</p>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Bar Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Bar dataKey="Revenue" fill="#10b981" />
//                   <Bar dataKey="Expenses" fill="#ef4444" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Line Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Legend />
//                   <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Custom Date Range Profit Report */}
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Profit Report</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.start}
//                   onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={dateRange.end}
//                   onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={fetchProfitReport}
//                   disabled={loading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//                 >
//                   {loading ? 'Loading...' : 'Generate Report'}
//                 </button>
//               </div>
//             </div>

//             {showProfitReport && profitData && (
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <p className="text-sm font-medium text-blue-700 mb-1">Total Revenue</p>
//                   <p className="text-2xl font-bold text-blue-900">{formatCurrency(profitData.totalRevenue)}</p>
//                 </div>
//                 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//                   <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
//                   <p className="text-2xl font-bold text-red-900">{formatCurrency(profitData.totalExpenses)}</p>
//                 </div>
//                 <div className={`${profitData.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
//                   <p className={`text-sm font-medium ${profitData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>Net Profit</p>
//                   <p className={`text-2xl font-bold ${profitData.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
//                     {formatCurrency(profitData.netProfit)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;




import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const useApi = () => {
  return {
    apiCall: async (url) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('API call failed');
      return response.json();
    }
  };
};

const Dashboard = ({ onNavigate }) => {
  const { apiCall } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 16),
    end: new Date().toISOString().slice(0, 16)
  });
  const [showProfitReport, setShowProfitReport] = useState(false);
  const [filterOneDayService, setFilterOneDayService] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // UPDATED: Function to calculate job card counts from the job cards array
  const calculateJobCardCounts = (jobCards) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter job cards for this month
    const jobCardsThisMonth = jobCards.filter(job => {
      const jobDate = new Date(job.createdAt);
      return jobDate >= startOfMonth;
    });
//
    // Count by status
    const pendingJobs = jobCards.filter(job => job.status === 'PENDING').length;
    const inProgressJobs = jobCards.filter(job => job.status === 'IN_PROGRESS').length;
    const waitingForPartsJobs = jobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length;
    const waitingForApprovalJobs = jobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length;
    const completedJobs = jobCards.filter(job => job.status === 'COMPLETED').length;
    const deliveredJobs = jobCards.filter(job => job.status === 'DELIVERED').length;
    const cancelledJobs = jobCards.filter(job => job.status === 'CANCELLED').length;
    
    // UPDATED: Count One Day Service jobs (EXCLUDES DELIVERED and CANCELLED)
    const oneDayServiceJobs = jobCards.filter(job => 
      job.oneDayService === true && 
      job.status !== 'DELIVERED' && 
      job.status !== 'CANCELLED'
    ).length;

    return {
      totalJobsThisMonth: jobCardsThisMonth.length,
      pendingJobs,
      inProgressJobs,
      waitingForPartsJobs,
      waitingForApprovalJobs,
      completedJobs,
      deliveredJobs,
      cancelledJobs,
      oneDayServiceJobs
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/reports/dashboard');
      console.log('📊 Dashboard API Response:', data);
      console.log('Available fields:', Object.keys(data));
      
      // Fetch job cards for counts
      const jobCardsResponse = await apiCall('/api/jobcards');
      console.log('📋 Job Cards Fetched:', jobCardsResponse.length);
      
      // Calculate job card counts
      const jobCardCounts = calculateJobCardCounts(jobCardsResponse);
      console.log('📊 Calculated Job Card Counts:', jobCardCounts);
      
      // Merge with existing dashboard data
      const mergedData = {
        ...data,
        ...jobCardCounts
      };
      
      setDashboardData(mergedData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  const fetchProfitReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall(
        `/api/reports/profit?start=${dateRange.start}&end=${dateRange.end}`
      );
      console.log('Profit data:', data);
      setProfitData(data);
      setShowProfitReport(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load profit report');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(value || 0);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleQuickAction = (action) => {
    if (onNavigate) {
      switch(action) {
        case 'jobcard':
          onNavigate('jobcards-create');
          break;
        case 'invoice':
          onNavigate('invoices');
          break;
        case 'expense':
          onNavigate('expenses');
          break;
        case 'inventory':
          onNavigate('inventory');
          break;
        default:
          break;
      }
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      IN_PROGRESS: '🔧',
      WAITING_FOR_PARTS: '📦',
      WAITING_FOR_APPROVAL: '👥',
      COMPLETED: '✅',
      DELIVERED: '🚚',
      CANCELLED: '❌',
      ONE_DAY_SERVICE: '🚨'
    };
    return icons[status] || '📄';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-600',
      IN_PROGRESS: 'text-blue-600',
      WAITING_FOR_PARTS: 'text-orange-600',
      WAITING_FOR_APPROVAL: 'text-purple-600',
      COMPLETED: 'text-green-600',
      DELIVERED: 'text-indigo-600',
      CANCELLED: 'text-red-600',
      ONE_DAY_SERVICE: 'text-red-600' // ALWAYS RED for One Day Service
    };
    return colors[status] || 'text-gray-600';
  };

  // Get background color for status cards
  const getStatusBgColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100',
      IN_PROGRESS: 'bg-blue-100',
      WAITING_FOR_PARTS: 'bg-orange-100',
      WAITING_FOR_APPROVAL: 'bg-purple-100',
      COMPLETED: 'bg-green-100',
      DELIVERED: 'bg-indigo-100',
      CANCELLED: 'bg-red-100',
      ONE_DAY_SERVICE: 'bg-red-100' // ALWAYS RED background for One Day Service
    };
    return colors[status] || 'bg-gray-100';
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = dashboardData ? [
    {
      name: 'Today',
      Revenue: dashboardData.dailyRevenue || 0,
      Expenses: dashboardData.dailyExpenses || 0,
      Profit: dashboardData.dailyProfit || 0
    },
    {
      name: 'This Month',
      Revenue: dashboardData.monthlyRevenue || 0,
      Expenses: dashboardData.monthlyExpenses || 0,
      Profit: dashboardData.monthlyProfit || 0
    }
  ] : [];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header with Date/Time */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">E Tech Care Dashboard</h1>
            <p className="text-blue-100">Welcome back! Here's your business overview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Current Date & Time</p>
            <p className="text-xl font-semibold">{formatDateTime(currentDateTime)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="text-red-700 hover:text-red-900 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* One Day Service Filter */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Status Overview</h3>
            <p className="text-sm text-gray-600">View all job card status counts</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOneDayService}
                onChange={(e) => setFilterOneDayService(e.target.checked)}
                className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show Only One Day Service</span>
            </label>
            {filterOneDayService && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                🚨 ONE DAY SERVICE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Job Status Cards - Top Row */}
      {dashboardData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* Total Jobs This Month */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Jobs (Month)</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.totalJobsThisMonth || 0}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <span className="text-lg">📊</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                All jobs this month
              </div>
            </div>

            {/* Pending Jobs */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Pending Jobs</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingJobs || 0}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <span className="text-lg">⏳</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Waiting to start
              </div>
            </div>

            {/* In Progress Jobs */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-blue-500">{dashboardData.inProgressJobs || 0}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-full">
                  <span className="text-lg">🔧</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Currently working
              </div>
            </div>

            {/* Waiting for Parts */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Parts</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardData.waitingForPartsJobs || 0}</p>
                </div>
                <div className="bg-orange-100 p-2 rounded-full">
                  <span className="text-lg">📦</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Need parts delivery
              </div>
            </div>

            {/* Waiting for Approval */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Waiting for Approval</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.waitingForApprovalJobs || 0}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <span className="text-lg">👥</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Customer approval needed
              </div>
            </div>

            {/* Completed Jobs */}
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.completedJobs || 0}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <span className="text-lg">✅</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Ready for delivery
              </div>
            </div>

            {/* UPDATED: One Day Service Card - ALWAYS RED regardless of status */}
            <div className="bg-red-50 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">One Day Service</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.oneDayServiceJobs || 0}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <span className="text-lg text-red-600">🚨</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Urgent 24-hour jobs
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleQuickAction('expense')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
              <button 
                onClick={() => handleQuickAction('invoice')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Invoice
              </button>
              <button 
                onClick={() => handleQuickAction('jobcard')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                New Job Card
              </button>
              <button 
                onClick={() => handleQuickAction('inventory')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Manage Inventory
              </button>
            </div>
          </div>

          {/* Financial Stats - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(dashboardData.dailyRevenue)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Daily Profit */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Today's Profit</p>
                  <p className={`text-3xl font-bold ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(dashboardData.dailyProfit)}
                  </p>
                </div>
                <div className={`${dashboardData.dailyProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
                  <svg className={`w-8 h-8 ${dashboardData.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm font-medium text-blue-100 mb-2">Monthly Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm font-medium text-red-100 mb-2">Monthly Expenses</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyExpenses)}</p>
            </div>

            <div className={`bg-gradient-to-br ${dashboardData.monthlyProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} p-6 rounded-lg shadow-lg text-white`}>
              <p className={`text-sm font-medium ${dashboardData.monthlyProfit >= 0 ? 'text-green-100' : 'text-red-100'} mb-2`}>Monthly Profit</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardData.monthlyProfit)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#10b981" />
                  <Bar dataKey="Expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Custom Date Range Profit Report */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Profit Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchProfitReport}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {loading ? 'Loading...' : 'Generate Report'}
                </button>
              </div>
            </div>

            {showProfitReport && profitData && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(profitData.totalRevenue)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(profitData.totalExpenses)}</p>
                </div>
                <div className={`${profitData.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
                  <p className={`text-sm font-medium ${profitData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>Net Profit</p>
                  <p className={`text-2xl font-bold ${profitData.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(profitData.netProfit)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;