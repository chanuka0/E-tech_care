

// import { useState, useEffect } from 'react';
// import { apiCall } from '../services/api';

// const IncomeExpenseReport = () => {
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [expandedDates, setExpandedDates] = useState({});
//   const [dailyDetails, setDailyDetails] = useState({});
//   const [loadingDetails, setLoadingDetails] = useState({});

//   // ✅ Filter States (like InvoiceList)
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1; // 1-12
  
//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [showDateFilter, setShowDateFilter] = useState(false);
//   const [availableYears, setAvailableYears] = useState([]);

//   // ✅ Month options with "All Months"
//   const MONTHS = [
//     { value: 'ALL', label: 'All Months' },
//     { value: 1, label: 'January' },
//     { value: 2, label: 'February' },
//     { value: 3, label: 'March' },
//     { value: 4, label: 'April' },
//     { value: 5, label: 'May' },
//     { value: 6, label: 'June' },
//     { value: 7, label: 'July' },
//     { value: 8, label: 'August' },
//     { value: 9, label: 'September' },
//     { value: 10, label: 'October' },
//     { value: 11, label: 'November' },
//     { value: 12, label: 'December' }
//   ];

//   // Generate year options (last 5 years + current + next year)
//   const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

//   // ✅ Fetch report - handles both monthly and yearly (all months)
//   const fetchReport = async (year, month) => {
//     setLoading(true);
//     setError('');
//     setExpandedDates({}); // Reset expanded dates
//     setDailyDetails({}); // Reset cached details
    
//     try {
//       let data;
      
//       if (month === 'ALL') {
//         // ✅ Fetch entire year data
//         console.log(`📊 Fetching ALL MONTHS report for year ${year}`);
        
//         const startDate = `${year}-01-01`;
//         const endDate = `${year}-12-31`;
        
//         data = await apiCall(
//           `/api/reports/income-expenses?startDate=${startDate}&endDate=${endDate}`
//         );
//       } else {
//         // ✅ Fetch specific month data
//         console.log(`📊 Fetching report for ${year}-${month}`);
        
//         data = await apiCall(
//           `/api/reports/income-expenses/monthly?year=${year}&month=${month}`
//         );
//       }
      
//       if (data) {
//         setReport(data);
//         console.log('Report data:', data);
//       } else {
//         setError('No data received from server');
//       }
//     } catch (error) {
//       console.error('Failed to fetch report:', error);
//       setError(error.message || 'Failed to load report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Fetch daily details when date row is expanded
//   const fetchDailyDetails = async (date) => {
//     if (dailyDetails[date]) {
//       return;
//     }

//     setLoadingDetails(prev => ({ ...prev, [date]: true }));
//     try {
//       console.log(`📋 Fetching daily details for ${date}`);
      
//       const data = await apiCall(
//         `/api/reports/daily-details?date=${date}`
//       );
      
//       if (data) {
//         setDailyDetails(prev => ({ ...prev, [date]: data }));
//         console.log('Daily details:', data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch daily details:', error);
//       setError(error.message || 'Failed to load daily details');
//     } finally {
//       setLoadingDetails(prev => ({ ...prev, [date]: false }));
//     }
//   };

//   // ✅ Toggle date row expansion
//   const toggleDateExpansion = async (date) => {
//     const isExpanded = expandedDates[date];
    
//     setExpandedDates(prev => ({
//       ...prev,
//       [date]: !isExpanded
//     }));

//     if (!isExpanded && !dailyDetails[date]) {
//       await fetchDailyDetails(date);
//     }
//   };

//   // Load data on component mount
//   useEffect(() => {
//     // Set available years
//     setAvailableYears(yearOptions);
//     fetchReport(selectedYear, selectedMonth);
//   }, []);

//   // Load data when year/month changes
//   useEffect(() => {
//     fetchReport(selectedYear, selectedMonth);
//   }, [selectedYear, selectedMonth]);

//   const handleYearChange = (e) => {
//     setSelectedYear(parseInt(e.target.value));
//   };

//   const handleMonthChange = (e) => {
//     const value = e.target.value;
//     setSelectedMonth(value === 'ALL' ? 'ALL' : parseInt(value));
//   };

//   // ✅ Reset all filters
//   const handleResetFilters = () => {
//     setSelectedYear(currentYear);
//     setSelectedMonth(currentMonth);
//   };

//   const loadCurrentMonth = () => {
//     setSelectedYear(currentYear);
//     setSelectedMonth(currentMonth);
//   };

//   // ✅ New: Load entire current year
//   const loadCurrentYear = () => {
//     setSelectedYear(currentYear);
//     setSelectedMonth('ALL');
//   };

//   const exportToCSV = () => {
//     if (!report) return;

//     const monthLabel = selectedMonth === 'ALL' 
//       ? 'All Months' 
//       : MONTHS.find(m => m.value === selectedMonth)?.label;

//     const rows = [
//       ['Income & Expense Report'],
//       [`Year: ${selectedYear}, Period: ${monthLabel}`],
//       [`From: ${report.startDate} To: ${report.endDate}`],
//       [''],
//       ['Summary'],
//       ['Total Income', report.totalIncome.toFixed(2)],
//       ['Total Expenses', report.totalExpenses.toFixed(2)],
//       ['Net Profit/Loss', report.netProfit.toFixed(2)],
//       [''],
//       ['Daily Breakdown'],
//       ['Date', 'Income', 'Expenses', 'Net']
//     ];

//     Object.entries(report.dailyBreakdown || {}).forEach(([date, daily]) => {
//       rows.push([
//         date,
//         daily.income.toFixed(2),
//         daily.expenses.toFixed(2),
//         (daily.income - daily.expenses).toFixed(2)
//       ]);
//     });

//     const csvContent = rows
//       .map(row => row.map(cell => `"${cell}"`).join(','))
//       .join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
    
//     const filename = selectedMonth === 'ALL'
//       ? `income-expense-${selectedYear}-all-months.csv`
//       : `income-expense-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`;
    
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   };

//   if (loading && !report) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading income & expense report...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">💰 Income & Expenses Report</h1>
//           <p className="text-gray-600 mt-1">Track your business income and expenses by month or year</p>
//         </div>
//         <div className="flex space-x-3">
//           <button
//             onClick={loadCurrentYear}
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
//           >
//             Current Year
//           </button>
//           <button
//             onClick={loadCurrentMonth}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Current Month
//           </button>
//           {report && (
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Export CSV</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
//           <span>{error}</span>
//           <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">✕</button>
//         </div>
//       )}

//       {/* ✅ Year/Month Filter Section (Invoice List Style) */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border border-blue-200">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-2">
//             <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
//             <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
//               Showing: {selectedMonth === 'ALL' ? 'All Months' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
//             </span>
//           </div>
//           <button
//             onClick={() => setShowDateFilter(!showDateFilter)}
//             className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
//           >
//             <span>{showDateFilter ? 'Hide' : 'Show'} Filters</span>
//             <svg 
//               className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>
//         </div>

//         {showDateFilter && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-lg border border-blue-100">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 Select Year
//               </label>
//               <select
//                 value={selectedYear}
//                 onChange={handleYearChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
//               >
//                 {yearOptions.map(year => (
//                   <option key={year} value={year}>
//                     {year} {year === currentYear && '(Current)'}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 Select Month
//               </label>
//               <select
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
//               >
//                 {MONTHS.map(month => (
//                   <option key={month.value} value={month.value}>
//                     {month.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={handleResetFilters}
//                 className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm flex items-center justify-center space-x-2"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 <span>Reset to Current Month</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ✅ Date Summary */}
//         <div className="mt-3 flex items-center justify-between text-sm">
//           <div className="flex items-center space-x-4 text-gray-700">
//             <span className="flex items-center space-x-1">
//               <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               <strong>
//                 {report ? Object.keys(report.dailyBreakdown || {}).length : 0} days
//               </strong>
//             </span>
//             <span className="text-blue-600 font-medium">
//               in {selectedMonth === 'ALL' ? 'entire year' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
//             </span>
//             {selectedYear === currentYear && selectedMonth === currentMonth && (
//               <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
//                 Current Month
//               </span>
//             )}
//             {selectedYear === currentYear && selectedMonth === 'ALL' && (
//               <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
//                 Current Year
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {report && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {/* Total Income */}
//             <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-xl shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-green-600 text-sm font-medium">Total Income</p>
//                   <p className="text-3xl font-bold text-green-900 mt-2">
//                     Rs.{report.totalIncome.toFixed(2)}
//                   </p>
//                   <p className="text-green-700 text-xs mt-2">
//                     ✅ From {report.totalInvoices} paid invoices
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Total Expenses */}
//             <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-6 rounded-xl shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-red-600 text-sm font-medium">Total Expenses</p>
//                   <p className="text-3xl font-bold text-red-900 mt-2">
//                     Rs.{report.totalExpenses.toFixed(2)}
//                   </p>
//                   <p className="text-red-700 text-xs mt-2">
//                     From {report.totalExpensesCount} transactions
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Net Profit */}
//             <div className={`bg-gradient-to-br ${report.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-300' : 'from-orange-50 to-orange-100 border-orange-300'} border-2 p-6 rounded-xl shadow-sm`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
//                     {report.netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
//                   </p>
//                   <p className={`text-3xl font-bold mt-2 ${report.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
//                     Rs.{Math.abs(report.netProfit).toFixed(2)}
//                   </p>
//                   <p className={`text-xs mt-2 ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
//                     {report.netProfit >= 0 ? 'Profit' : 'Loss'}
//                   </p>
//                 </div>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${report.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Selected Period Info */}
//             <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-purple-600 text-sm font-medium">Selected Period</p>
//                   <p className="text-lg font-bold text-purple-900 mt-2">
//                     {selectedMonth === 'ALL' ? 'Entire Year' : MONTHS.find(m => m.value === selectedMonth)?.label}
//                   </p>
//                   <p className="text-purple-700 text-xs mt-2">
//                     {report.startDate} to {report.endDate}
//                   </p>
//                 </div>
//                 <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Daily Breakdown Table - keeping your existing detailed expandable table */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b bg-gray-50">
//               <h2 className="text-xl font-semibold text-gray-900 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 Daily Breakdown
//               </h2>
//               <p className="text-sm text-gray-600 mt-1">Click on any date to view detailed income and expense breakdown</p>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Income</th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Expenses</th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Daily Net</th>
//                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Details</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {Object.entries(report.dailyBreakdown || {})
//                     .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
//                     .map(([date, daily]) => {
//                       const net = daily.income - daily.expenses;
//                       const isExpanded = expandedDates[date];
//                       const details = dailyDetails[date];
//                       const isLoadingDetails = loadingDetails[date];

//                       return (
//                         <>
//                           {/* Main Row */}
//                           <tr 
//                             key={date} 
//                             className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
//                             onClick={() => toggleDateExpansion(date)}
//                           >
//                             <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                               <div className="flex items-center space-x-2">
//                                 <span className={isExpanded ? 'text-blue-600' : ''}>
//                                   {new Date(date).toLocaleDateString('en-GB', {
//                                     weekday: 'short',
//                                     day: '2-digit',
//                                     month: 'short',
//                                     year: 'numeric'
//                                   })}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right">
//                               <span className="text-green-600 font-semibold">
//                                 Rs.{daily.income.toFixed(2)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right">
//                               <span className="text-red-600 font-semibold">
//                                 Rs.{daily.expenses.toFixed(2)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right">
//                               <span className={`font-semibold ${net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
//                                 Rs.{net.toFixed(2)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-center">
//                               <button className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-600' : 'text-gray-400'}`}>
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                 </svg>
//                               </button>
//                             </td>
//                           </tr>

//                           {/* Expanded Details Row - Your existing detailed design */}
//                           {isExpanded && (
//                             <tr>
//                               <td colSpan="5" className="px-6 py-4 bg-gray-50">
//                                 {isLoadingDetails ? (
//                                   <div className="text-center py-8">
//                                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                                     <p className="mt-2 text-sm text-gray-600">Loading details...</p>
//                                   </div>
//                                 ) : details ? (
//                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Income Details */}
//                                     <div className="bg-white rounded-lg border border-green-200 p-4">
//                                       <h4 className="font-semibold text-green-700 mb-3 flex items-center text-lg">
//                                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         Income ({details.incomeDetails.length} invoices)
//                                       </h4>
//                                       {details.incomeDetails.length > 0 ? (
//                                         <div className="space-y-2 max-h-96 overflow-y-auto">
//                                           {details.incomeDetails.map(invoice => (
//                                             <div key={invoice.id} className="bg-green-50 p-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
//                                               <div className="flex justify-between items-start">
//                                                 <div className="flex-1">
//                                                   <p className="font-medium text-gray-900">
//                                                     Invoice #{invoice.invoiceNumber}
//                                                   </p>
//                                                   <p className="text-sm text-gray-600 mt-1">
//                                                     {invoice.customerName}
//                                                   </p>
//                                                   <p className="text-xs text-gray-500 mt-1">
//                                                     Paid: {new Date(invoice.paidDate).toLocaleTimeString('en-GB', {
//                                                       hour: '2-digit',
//                                                       minute: '2-digit'
//                                                     })}
//                                                   </p>
//                                                 </div>
//                                                 <div className="text-right ml-3">
//                                                   <p className="text-green-600 font-bold text-lg">
//                                                     Rs.{invoice.amount.toFixed(2)}
//                                                   </p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                           ))}
//                                           <div className="pt-2 mt-2 border-t border-green-300">
//                                             <div className="flex justify-between items-center font-bold text-green-800">
//                                               <span>Total Income:</span>
//                                               <span className="text-xl">Rs.{details.totalIncome.toFixed(2)}</span>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       ) : (
//                                         <div className="text-center py-8 text-gray-500">
//                                           <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                                           </svg>
//                                           <p className="text-sm">No income for this day</p>
//                                         </div>
//                                       )}
//                                     </div>

//                                     {/* Expense Details */}
//                                     <div className="bg-white rounded-lg border border-red-200 p-4">
//                                       <h4 className="font-semibold text-red-700 mb-3 flex items-center text-lg">
//                                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                         </svg>
//                                         Expenses ({details.expenseDetails.length} transactions)
//                                       </h4>
//                                       {details.expenseDetails.length > 0 ? (
//                                         <div className="space-y-2 max-h-96 overflow-y-auto">
//                                           {details.expenseDetails.map(expense => (
//                                             <div key={expense.id} className="bg-red-50 p-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
//                                               <div className="flex justify-between items-start">
//                                                 <div className="flex-1">
//                                                   <p className="font-medium text-gray-900">
//                                                     {expense.category}
//                                                   </p>
//                                                   {expense.description && (
//                                                     <p className="text-sm text-gray-600 mt-1">
//                                                       {expense.description}
//                                                     </p>
//                                                   )}
//                                                   {expense.invoiceNumber && (
//                                                     <p className="text-xs text-gray-500 mt-1">
//                                                       Invoice: {expense.invoiceNumber}
//                                                     </p>
//                                                   )}
//                                                   <p className="text-xs text-gray-500 mt-1">
//                                                     {new Date(expense.createdAt).toLocaleTimeString('en-GB', {
//                                                       hour: '2-digit',
//                                                       minute: '2-digit'
//                                                     })}
//                                                   </p>
//                                                 </div>
//                                                 <div className="text-right ml-3">
//                                                   <p className="text-red-600 font-bold text-lg">
//                                                     Rs.{expense.amount.toFixed(2)}
//                                                   </p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                           ))}
//                                           <div className="pt-2 mt-2 border-t border-red-300">
//                                             <div className="flex justify-between items-center font-bold text-red-800">
//                                               <span>Total Expenses:</span>
//                                               <span className="text-xl">Rs.{details.totalExpenses.toFixed(2)}</span>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       ) : (
//                                         <div className="text-center py-8 text-gray-500">
//                                           <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                           </svg>
//                                           <p className="text-sm">No expenses for this day</p>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <p className="text-gray-500 text-sm text-center py-4">Click to load details</p>
//                                 )}
//                               </td>
//                             </tr>
//                           )}
//                         </>
//                       );
//                     })}
//                 </tbody>
//               </table>
//             </div>
            
//             <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
//               <p className="text-sm text-gray-600">
//                 Showing {Object.keys(report.dailyBreakdown || {}).length} days for {
//                   selectedMonth === 'ALL' 
//                     ? `entire year ${selectedYear}` 
//                     : `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
//                 }
//               </p>
//             </div>
//           </div>
//         </>
//       )}

//       {!report && !loading && (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//           </svg>
//           <p className="text-gray-600 mb-4">Select month and year to generate report</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IncomeExpenseReport;









import { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const IncomeExpenseReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [dailyDetails, setDailyDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // ✅ Filter States (like InvoiceList)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // ✅ Month options with "All Months"
  const MONTHS = [
    { value: 'ALL', label: 'All Months' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (last 5 years + current + next year)
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  // ✅ Fetch report - handles both monthly and yearly (all months)
  const fetchReport = async (year, month) => {
    setLoading(true);
    setError('');
    setExpandedDates({}); // Reset expanded dates
    setDailyDetails({}); // Reset cached details
    
    try {
      let data;
      
      if (month === 'ALL') {
        // ✅ Fetch entire year data
        console.log(`📊 Fetching ALL MONTHS report for year ${year}`);
        
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        data = await apiCall(
          `/api/reports/income-expenses?startDate=${startDate}&endDate=${endDate}`
        );
      } else {
        // ✅ Fetch specific month data
        console.log(`📊 Fetching report for ${year}-${month}`);
        
        data = await apiCall(
          `/api/reports/income-expenses/monthly?year=${year}&month=${month}`
        );
      }
      
      if (data) {
        setReport(data);
        console.log('Report data:', data);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setError(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch daily details when date row is expanded
  const fetchDailyDetails = async (date) => {
    if (dailyDetails[date]) {
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [date]: true }));
    try {
      console.log(`📋 Fetching daily details for ${date}`);
      
      const data = await apiCall(
        `/api/reports/daily-details?date=${date}`
      );
      
      if (data) {
        setDailyDetails(prev => ({ ...prev, [date]: data }));
        console.log('Daily details:', data);
      }
    } catch (error) {
      console.error('Failed to fetch daily details:', error);
      setError(error.message || 'Failed to load daily details');
    } finally {
      setLoadingDetails(prev => ({ ...prev, [date]: false }));
    }
  };

  // ✅ Toggle date row expansion
  const toggleDateExpansion = async (date) => {
    const isExpanded = expandedDates[date];
    
    setExpandedDates(prev => ({
      ...prev,
      [date]: !isExpanded
    }));

    if (!isExpanded && !dailyDetails[date]) {
      await fetchDailyDetails(date);
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Set available years
    setAvailableYears(yearOptions);
    fetchReport(selectedYear, selectedMonth);
  }, []);

  // Load data when year/month changes
  useEffect(() => {
    fetchReport(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonth(value === 'ALL' ? 'ALL' : parseInt(value));
  };

  // ✅ Reset all filters
  const handleResetFilters = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };

  const loadCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };

  // ✅ New: Load entire current year
  const loadCurrentYear = () => {
    setSelectedYear(currentYear);
    setSelectedMonth('ALL');
  };

  const exportToCSV = () => {
    if (!report) return;

    const monthLabel = selectedMonth === 'ALL' 
      ? 'All Months' 
      : MONTHS.find(m => m.value === selectedMonth)?.label;

    const rows = [
      ['Income & Expense Report'],
      [`Year: ${selectedYear}, Period: ${monthLabel}`],
      [`From: ${report.startDate} To: ${report.endDate}`],
      [''],
      ['Summary'],
      ['Total Income', report.totalIncome.toFixed(2)],
      ['Total Expenses', report.totalExpenses.toFixed(2)],
      ['Net Profit/Loss', report.netProfit.toFixed(2)],
      [''],
      ['Daily Breakdown'],
      ['Date', 'Income', 'Expenses', 'Net']
    ];

    Object.entries(report.dailyBreakdown || {}).forEach(([date, daily]) => {
      rows.push([
        date,
        daily.income.toFixed(2),
        daily.expenses.toFixed(2),
        (daily.income - daily.expenses).toFixed(2)
      ]);
    });

    const csvContent = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const filename = selectedMonth === 'ALL'
      ? `income-expense-${selectedYear}-all-months.csv`
      : `income-expense-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading income & expense report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Income & Expenses Report</h1>
          <p className="text-gray-600 mt-1">Track your business income and expenses by month or year</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadCurrentYear}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Current Year
          </button>
          <button
            onClick={loadCurrentMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Current Month
          </button>
          {report && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      {/* ✅ Year/Month Filter Section (Invoice List Style) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
              Showing: {selectedMonth === 'ALL' ? 'All Months' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </span>
          </div>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
          >
            <span>{showDateFilter ? 'Hide' : 'Show'} Filters</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showDateFilter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year} {year === currentYear && '(Current)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset to Current Month</span>
              </button>
            </div>
          </div>
        )}

        {/* ✅ Date Summary */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-700">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <strong>
                {report ? Object.keys(report.dailyBreakdown || {}).length : 0} days
              </strong>
            </span>
            <span className="text-blue-600 font-medium">
              in {selectedMonth === 'ALL' ? 'entire year' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </span>
            {selectedYear === currentYear && selectedMonth === currentMonth && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                Current Month
              </span>
            )}
            {selectedYear === currentYear && selectedMonth === 'ALL' && (
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                Current Year
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-green-600 text-sm font-medium">Total Income</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    Rs.{report.totalIncome.toFixed(2)}
                  </p>
                  <p className="text-green-700 text-xs mt-2">
                    ✅ From {report.totalInvoices} paid invoices
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    Rs.{report.totalExpenses.toFixed(2)}
                  </p>
                  <p className="text-red-700 text-xs mt-2">
                    From {report.totalExpensesCount} transactions
                  </p>
                </div>
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className={`bg-gradient-to-br ${report.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-300' : 'from-orange-50 to-orange-100 border-orange-300'} border-2 p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {report.netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${report.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    Rs.{Math.abs(report.netProfit).toFixed(2)}
                  </p>
                  <p className={`text-xs mt-2 ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {report.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${report.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Selected Period Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-600 text-sm font-medium">Selected Period</p>
                  <p className="text-lg font-bold text-purple-900 mt-2">
                    {selectedMonth === 'ALL' ? 'Entire Year' : MONTHS.find(m => m.value === selectedMonth)?.label}
                  </p>
                  <p className="text-purple-700 text-xs mt-2">
                    {report.startDate} to {report.endDate}
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Daily Breakdown
              </h2>
              <p className="text-sm text-gray-600 mt-1">Click on any date to view detailed income and expense breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Daily Net</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(report.dailyBreakdown || {})
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, daily]) => {
                      const net = daily.income - daily.expenses;
                      const isExpanded = expandedDates[date];
                      const details = dailyDetails[date];
                      const isLoadingDetails = loadingDetails[date];

                      return (
                        <>
                          {/* Main Row */}
                          <tr 
                            key={date} 
                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                            onClick={() => toggleDateExpansion(date)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="flex items-center space-x-2">
                                <span className={isExpanded ? 'text-blue-600' : ''}>
                                  {new Date(date).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className="text-green-600 font-semibold">
                                Rs.{daily.income.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className="text-red-600 font-semibold">
                                Rs.{daily.expenses.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className={`font-semibold ${net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                Rs.{net.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <button className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-600' : 'text-gray-400'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                {isLoadingDetails ? (
                                  <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-sm text-gray-600">Loading details...</p>
                                  </div>
                                ) : details ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Income Details */}
                                    <div className="bg-white rounded-lg border border-green-200 p-4">
                                      <h4 className="font-semibold text-green-700 mb-3 flex items-center text-lg">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Income ({details.incomeDetails.length} invoices)
                                      </h4>
                                      {details.incomeDetails.length > 0 ? (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                          {details.incomeDetails.map(invoice => (
                                            <div key={invoice.id} className="bg-green-50 p-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <p className="font-medium text-gray-900">
                                                    Invoice #{invoice.invoiceNumber}
                                                  </p>
                                                  <p className="text-sm text-gray-600 mt-1">
                                                    {invoice.customerName}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    Paid: {new Date(invoice.paidDate).toLocaleTimeString('en-GB', {
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                    })}
                                                  </p>
                                                </div>
                                                <div className="text-right ml-3">
                                                  <p className="text-green-600 font-bold text-lg">
                                                    Rs.{invoice.amount.toFixed(2)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="pt-2 mt-2 border-t border-green-300">
                                            <div className="flex justify-between items-center font-bold text-green-800">
                                              <span>Total Income:</span>
                                              <span className="text-xl">Rs.{details.totalIncome.toFixed(2)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-500">
                                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                          </svg>
                                          <p className="text-sm">No income for this day</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Expense Details */}
                                    <div className="bg-white rounded-lg border border-red-200 p-4">
                                      <h4 className="font-semibold text-red-700 mb-3 flex items-center text-lg">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Expenses ({details.expenseDetails.length} transactions)
                                      </h4>
                                      {details.expenseDetails.length > 0 ? (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                          {details.expenseDetails.map(expense => (
                                            <div key={expense.id} className="bg-red-50 p-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <p className="font-medium text-gray-900">
                                                    {expense.category}
                                                  </p>
                                                  {expense.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                      {expense.description}
                                                    </p>
                                                  )}
                                                  {expense.invoiceNumber && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                      Invoice: {expense.invoiceNumber}
                                                    </p>
                                                  )}
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(expense.createdAt).toLocaleTimeString('en-GB', {
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                    })}
                                                  </p>
                                                </div>
                                                <div className="text-right ml-3">
                                                  <p className="text-red-600 font-bold text-lg">
                                                    Rs.{expense.amount.toFixed(2)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="pt-2 mt-2 border-t border-red-300">
                                            <div className="flex justify-between items-center font-bold text-red-800">
                                              <span>Total Expenses:</span>
                                              <span className="text-xl">Rs.{details.totalExpenses.toFixed(2)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-500">
                                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                          <p className="text-sm">No expenses for this day</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-sm text-center py-4">Click to load details</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {Object.keys(report.dailyBreakdown || {}).length} days for {
                  selectedMonth === 'ALL' 
                    ? `entire year ${selectedYear}` 
                    : `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                }
              </p>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600 mb-4">Select month and year to generate report</p>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseReport;