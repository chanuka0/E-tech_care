// // import { useState, useEffect } from 'react';
// // import { useAuth } from '../auth/AuthProvider';
// // import AddExpenseModal from './AddExpenseModal';
// // import EditExpenseModal from './EditExpenseModal';
// // import { API_BASE_URL, API_ENDPOINTS } from '../services/api';

// // const ExpenseManagement = () => {
// //   const { token, isAdmin } = useAuth();
// //   const [expenses, setExpenses] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [searchTerm, setSearchTerm] = useState('');
  
// //   const [dateRange, setDateRange] = useState({
// //     start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
// //     end: new Date().toISOString().slice(0, 10)
// //   });

// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [selectedExpense, setSelectedExpense] = useState(null);

// //   const fetchExpenses = async (startDate = null, endDate = null) => {
// //     setLoading(true);
// //     setError('');
// //     try {
// //       let url = `${API_BASE_URL}${API_ENDPOINTS.EXPENSES}`;
      
// //       // Only add date parameters if both are provided
// //       const start = startDate || dateRange.start;
// //       const end = endDate || dateRange.end;
      
// //       if (start && end) {
// //         url += `?startDate=${start}&endDate=${end}`;
// //       }
      
// //       console.log('Fetching from URL:', url);
      
// //       const response = await fetch(url, {
// //         method: 'GET',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json',
// //         },
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         console.log('Expenses fetched:', data);
// //         setExpenses(data);
// //       } else {
// //         console.error('Failed to fetch. Status:', response.status);
// //         setError('Failed to fetch expenses');
// //       }
// //     } catch (err) {
// //       console.error('Error fetching expenses:', err);
// //       setError('Error loading expenses. Please try again.');
// //     }
// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     if (token) {
// //       fetchExpenses();
// //     }
// //   }, [token]);

// //   const handleAddExpense = (newExpense) => {
// //     setExpenses([newExpense, ...expenses]);
// //     setShowAddModal(false);
// //     showSuccessMessage('Expense added successfully!');
// //   };

// //   const handleUpdateExpense = (updatedExpense) => {
// //     setExpenses(expenses.map(expense => expense.id === selectedExpense.id ? updatedExpense : expense));
// //     setShowEditModal(false);
// //     setSelectedExpense(null);
// //     showSuccessMessage('Expense updated successfully!');
// //   };

// //   const handleDeleteExpense = async (id) => {
// //     if (window.confirm('Are you sure you want to delete this expense?')) {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSES}/${id}`, {
// //           method: 'DELETE',
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //             'Content-Type': 'application/json',
// //           },
// //         });

// //         if (response.ok) {
// //           setExpenses(expenses.filter(expense => expense.id !== id));
// //           showSuccessMessage('Expense deleted successfully!');
// //         } else {
// //           setError('Failed to delete expense');
// //         }
// //       } catch (err) {
// //         console.error('Error deleting expense:', err);
// //         setError('Error deleting expense. Please try again.');
// //       }
// //     }
// //   };

// //   const showSuccessMessage = (message) => {
// //     const msg = document.createElement('div');
// //     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
// //     msg.textContent = message;
// //     document.body.appendChild(msg);
// //     setTimeout(() => msg.remove(), 3000);
// //   };

// //   const formatCurrency = (value) => {
// //     return new Intl.NumberFormat('en-US', {
// //       style: 'currency',
// //       currency: 'LKR'
// //     }).format(value || 0);
// //   };

// //   const filteredExpenses = expenses.filter(expense => {
// //     const searchLower = searchTerm.toLowerCase();
// //     return (
// //       expense.category.toLowerCase().includes(searchLower) ||
// //       (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
// //       expense.id.toString().includes(searchLower)
// //     );
// //   });

// //   const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

// //   return (
// //     <div className="max-w-7xl mx-auto p-6 space-y-6">
// //       {/* Header */}
// //       <div className="flex justify-between items-center">
// //         <div>
// //           <h2 className="text-3xl font-bold text-gray-900">Expense Management</h2>
// //           <p className="text-gray-600 mt-1">Track and manage all expenses</p>
// //         </div>
// //         <button
// //           onClick={() => setShowAddModal(true)}
// //           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
// //         >
// //           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
// //           </svg>
// //           <span>Add Expense</span>
// //         </button>
// //       </div>

// //       {/* Error Message */}
// //       {error && (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
// //           <span>{error}</span>
// //           <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
// //             ✕
// //           </button>
// //         </div>
// //       )}

// //       {/* Date Range Filter - DATE ONLY */}
// //       <div className="bg-white rounded-lg shadow p-6">
// //         <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
// //             <input
// //               type="date"
// //               value={dateRange.start}
// //               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
// //             <input
// //               type="date"
// //               value={dateRange.end}
// //               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //           </div>
// //           <div className="flex items-end gap-2">
// //             <button
// //               onClick={() => fetchExpenses()}
// //               disabled={loading}
// //               className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
// //             >
// //               {loading ? 'Loading...' : 'Apply Filter'}
// //             </button>
// //             <button
// //               onClick={() => {
// //                 // Reset to default (last 30 days)
// //                 const end = new Date().toISOString().slice(0, 10);
// //                 const start = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
// //                 setDateRange({ start, end });
// //                 fetchExpenses(start, end);
// //               }}
// //               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200 font-medium"
// //             >
// //               Reset
// //             </button>
// //           </div>
// //         </div>
// //         <p className="text-xs text-gray-500 mt-3">
// //           Showing expenses from <strong>{dateRange.start}</strong> to <strong>{dateRange.end}</strong>
// //         </p>
// //       </div>

// //       {/* Search Bar */}
// //       <div className="bg-white rounded-lg shadow p-4">
// //         <div className="relative">
// //           <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
// //           </svg>
// //           <input
// //             type="text"
// //             placeholder="Search by category, description, or ID..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //         </div>
// //       </div>

// //       {/* Summary Stats */}
// //       {filteredExpenses.length > 0 && (
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <div className="bg-white rounded-lg shadow p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-600">Total Expenses</p>
// //                 <p className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</p>
// //               </div>
// //               <div className="bg-blue-100 p-3 rounded-full">
// //                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //                 </svg>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-lg shadow p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-600">Total Amount</p>
// //                 <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
// //               </div>
// //               <div className="bg-red-100 p-3 rounded-full">
// //                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// //                 </svg>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-lg shadow p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-600">Average Expense</p>
// //                 <p className="text-3xl font-bold text-green-600">
// //                   {formatCurrency(totalExpenses / filteredExpenses.length)}
// //                 </p>
// //               </div>
// //               <div className="bg-green-100 p-3 rounded-full">
// //                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
// //                 </svg>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Expenses Table */}
// //       <div className="bg-white rounded-lg shadow overflow-hidden">
// //         {loading ? (
// //           <div className="flex justify-center items-center h-64">
// //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// //           </div>
// //         ) : filteredExpenses.length === 0 ? (
// //           <div className="flex justify-center items-center h-64">
// //             <div className="text-center">
// //               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //               </svg>
// //               <h3 className="text-lg font-medium text-gray-900">No Expenses Found</h3>
// //               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first expense to get started'}</p>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="min-w-full divide-y divide-gray-200">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {filteredExpenses.map(expense => (
// //                   <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className="text-sm font-medium text-gray-900">#{expense.id}</span>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
// //                         {expense.category}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <p className="text-sm text-gray-600 line-clamp-2">
// //                         {expense.description || 'No description'}
// //                       </p>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
// //                       {new Date(expense.createdAt).toLocaleDateString('en-US', {
// //                         year: 'numeric',
// //                         month: 'short',
// //                         day: 'numeric'
// //                       })}
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
// //                       <button
// //                         onClick={() => {
// //                           setSelectedExpense(expense);
// //                           setShowEditModal(true);
// //                         }}
// //                         className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
// //                       >
// //                         Edit
// //                       </button>
// //                       {isAdmin() && (
// //                         <button
// //                           onClick={() => handleDeleteExpense(expense.id)}
// //                           className="text-red-600 hover:text-red-900 font-medium transition-colors"
// //                         >
// //                           Delete
// //                         </button>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //       {/* Modals */}
// //       {showAddModal && (
// //         <AddExpenseModal
// //           onAdd={handleAddExpense}
// //           onClose={() => setShowAddModal(false)}
// //         />
// //       )}

// //       {showEditModal && selectedExpense && (
// //         <EditExpenseModal
// //           expense={selectedExpense}
// //           onUpdate={handleUpdateExpense}
// //           onClose={() => {
// //             setShowEditModal(false);
// //             setSelectedExpense(null);
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default ExpenseManagement;







// import { useState, useEffect } from 'react';
// import { useAuth } from '../auth/AuthProvider';
// import AddExpenseModal from './AddExpenseModal';
// import EditExpenseModal from './EditExpenseModal';
// import { API_BASE_URL, API_ENDPOINTS } from '../services/api';

// const ExpenseManagement = () => {
//   const { token, isAdmin } = useAuth();
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const [dateRange, setDateRange] = useState({
//     start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
//     end: new Date().toISOString().slice(0, 10)
//   });

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);

//   const fetchExpenses = async (startDate = null, endDate = null) => {
//     // ⭐ FIX: Check if token exists before making request
//     if (!token) {
//       console.warn('No authentication token available');
//       setError('Please log in to view expenses');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       let url = `${API_BASE_URL}${API_ENDPOINTS.EXPENSES}`;
      
//       const start = startDate || dateRange.start;
//       const end = endDate || dateRange.end;
      
//       if (start && end) {
//         url += `?startDate=${start}&endDate=${end}`;
//       }
      
//       console.log('🔍 Fetching from URL:', url);
//       console.log('🔑 Using token:', token ? 'Token present' : 'No token');
      
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('📡 Response status:', response.status);

//       if (response.status === 401) {
//         setError('Session expired. Please log in again.');
//         return;
//       }

//       if (response.status === 403) {
//         setError('Access denied. You do not have permission to view expenses.');
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       // ⭐ FIX: Parse response with error handling
//       const text = await response.text();
//       console.log('📄 Response length:', text.length, 'characters');
      
//       if (!text || text.trim() === '') {
//         console.warn('Empty response from server');
//         setExpenses([]);
//         return;
//       }

//       const data = JSON.parse(text);
//       console.log('✅ Expenses fetched:', data.length, 'expenses');
      
//       // ⭐ FIX: Filter out any null or invalid expenses
//       const validExpenses = Array.isArray(data) ? data.filter(e => e && e.id) : [];
//       setExpenses(validExpenses);

//     } catch (err) {
//       console.error('❌ Error fetching expenses:', err);
//       if (err.name === 'SyntaxError') {
//         setError('Error parsing server response. The server may have returned invalid data.');
//       } else if (err.message.includes('Failed to fetch')) {
//         setError('Network error. Please check your connection and try again.');
//       } else {
//         setError('Error loading expenses: ' + err.message);
//       }
//       setExpenses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchExpenses();
//     } else {
//       console.warn('No token available in useEffect');
//     }
//   }, [token]);

//   const handleAddExpense = (newExpense) => {
//     setExpenses([newExpense, ...expenses]);
//     setShowAddModal(false);
//     showSuccessMessage('Expense added successfully!');
//   };

//   const handleUpdateExpense = (updatedExpense) => {
//     setExpenses(expenses.map(expense => expense.id === selectedExpense.id ? updatedExpense : expense));
//     setShowEditModal(false);
//     setSelectedExpense(null);
//     showSuccessMessage('Expense updated successfully!');
//   };

//   const handleDeleteExpense = async (id) => {
//     if (window.confirm('Are you sure you want to delete this expense?')) {
//       try {
//         const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSES}/${id}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           setExpenses(expenses.filter(expense => expense.id !== id));
//           showSuccessMessage('Expense deleted successfully!');
//         } else {
//           setError('Failed to delete expense');
//         }
//       } catch (err) {
//         console.error('Error deleting expense:', err);
//         setError('Error deleting expense. Please try again.');
//       }
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-LK', {
//       style: 'currency',
//       currency: 'LKR',
//       minimumFractionDigits: 2
//     }).format(value || 0);
//   };

//   const filteredExpenses = expenses.filter(expense => {
//     if (!expense) return false;
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       (expense.category && expense.category.toLowerCase().includes(searchLower)) ||
//       (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
//       (expense.id && expense.id.toString().includes(searchLower)) ||
//       (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(searchLower))
//     );
//   });

//   const totalExpenses = filteredExpenses.reduce((sum, expense) => {
//     const amount = expense && expense.amount ? parseFloat(expense.amount) : 0;
//     return sum + amount;
//   }, 0);

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Expense Management</h2>
//           <p className="text-gray-600 mt-1">Track and manage all expenses</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Add Expense</span>
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Date Range Filter */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//             <input
//               type="date"
//               value={dateRange.start}
//               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//             <input
//               type="date"
//               value={dateRange.end}
//               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div className="flex items-end gap-2">
//             <button
//               onClick={() => fetchExpenses()}
//               disabled={loading}
//               className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
//             >
//               {loading ? 'Loading...' : 'Apply Filter'}
//             </button>
//             <button
//               onClick={() => {
//                 const end = new Date().toISOString().slice(0, 10);
//                 const start = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
//                 setDateRange({ start, end });
//                 fetchExpenses(start, end);
//               }}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200 font-medium"
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//         <p className="text-xs text-gray-500 mt-3">
//           Showing expenses from <strong>{dateRange.start}</strong> to <strong>{dateRange.end}</strong>
//         </p>
//       </div>

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search by category, description, invoice number, or ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Summary Stats */}
//       {filteredExpenses.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Expenses</p>
//                 <p className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</p>
//               </div>
//               <div className="bg-blue-100 p-3 rounded-full">
//                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Amount</p>
//                 <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
//               </div>
//               <div className="bg-red-100 p-3 rounded-full">
//                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Average Expense</p>
//                 <p className="text-3xl font-bold text-green-600">
//                   {formatCurrency(totalExpenses / filteredExpenses.length)}
//                 </p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-full">
//                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Expenses Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredExpenses.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No Expenses Found</h3>
//               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first expense to get started'}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredExpenses.map(expense => (
//                   <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">#{expense.id}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                         expense.category === 'Invoice Return' 
//                           ? 'bg-orange-100 text-orange-800' 
//                           : 'bg-blue-100 text-blue-800'
//                       }`}>
//                         {expense.category}
//                       </span>
//                       {expense.autoCreated && (
//                         <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                           Auto
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {expense.description || 'No description'}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {expense.invoiceNumber ? (
//                         <span className="text-sm text-blue-600 font-medium">{expense.invoiceNumber}</span>
//                       ) : (
//                         <span className="text-sm text-gray-400">-</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {new Date(expense.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       {!expense.autoCreated && (
//                         <button
//                           onClick={() => {
//                             setSelectedExpense(expense);
//                             setShowEditModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
//                         >
//                           Edit
//                         </button>
//                       )}
//                       {isAdmin() && !expense.autoCreated && (
//                         <button
//                           onClick={() => handleDeleteExpense(expense.id)}
//                           className="text-red-600 hover:text-red-900 font-medium transition-colors"
//                         >
//                           Delete
//                         </button>
//                       )}
//                       {expense.autoCreated && (
//                         <span className="text-gray-400 text-xs">Auto-created</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showAddModal && (
//         <AddExpenseModal
//           onAdd={handleAddExpense}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedExpense && (
//         <EditExpenseModal
//           expense={selectedExpense}
//           onUpdate={handleUpdateExpense}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedExpense(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ExpenseManagement;








import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import AddExpenseModal from './AddExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import { API_BASE_URL, API_ENDPOINTS } from '../services/api';

const ExpenseManagement = () => {
  const { token, isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [displayedExpenses, setDisplayedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  
  // ✅ NEW: Year, Month, and Day Filter States
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // ✅ Month options
  const MONTHS = [
    { value: 'ALL', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const fetchExpenses = async () => {
    if (!token) {
      console.warn('No authentication token available');
      setError('Please log in to view expenses');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.EXPENSES}`;
      
      console.log('🔍 Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (response.status === 403) {
        setError('Access denied. You do not have permission to view expenses.');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('📄 Response length:', text.length, 'characters');
      
      if (!text || text.trim() === '') {
        console.warn('Empty response from server');
        setExpenses([]);
        setAllExpenses([]);
        return;
      }

      const data = JSON.parse(text);
      console.log('✅ Expenses fetched:', data.length, 'expenses');
      
      const validExpenses = Array.isArray(data) ? data.filter(e => e && e.id) : [];
      const sortedExpenses = validExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAllExpenses(sortedExpenses);
      
      // ✅ Extract available years from expenses
      const years = [...new Set(sortedExpenses.map(exp => new Date(exp.createdAt).getFullYear()))];
      setAvailableYears(years.sort((a, b) => b - a)); // Sort descending (newest first)
      
      // ✅ Apply initial filter (current year)
      filterExpensesByDate(sortedExpenses, selectedYear, selectedMonth, selectedDay);

    } catch (err) {
      console.error('❌ Error fetching expenses:', err);
      if (err.name === 'SyntaxError') {
        setError('Error parsing server response. The server may have returned invalid data.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Error loading expenses: ' + err.message);
      }
      setExpenses([]);
      setAllExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
    } else {
      console.warn('No token available in useEffect');
    }
  }, [token]);

  // ✅ NEW: Filter expenses by year, month, and day
  const filterExpensesByDate = (expenseList, year, month, day) => {
    let filtered = expenseList;

    // Filter by year
    if (year !== 'ALL') {
      filtered = filtered.filter(exp => {
        const expYear = new Date(exp.createdAt).getFullYear();
        return expYear === parseInt(year);
      });
    }

    // Filter by month
    if (month !== 'ALL') {
      filtered = filtered.filter(exp => {
        const expMonth = new Date(exp.createdAt).getMonth();
        return expMonth === parseInt(month);
      });
    }

    // Filter by day
    if (day !== 'ALL') {
      filtered = filtered.filter(exp => {
        const expDay = new Date(exp.createdAt).getDate();
        return expDay === parseInt(day);
      });
    }

    setExpenses(filtered);
    setDisplayCount(10);
    
    // ✅ Update available days based on selected year and month
    updateAvailableDays(expenseList, year, month);
  };

  // ✅ NEW: Update available days based on year and month selection
  const updateAvailableDays = (expenseList, year, month) => {
    let filtered = expenseList;

    if (year !== 'ALL') {
      filtered = filtered.filter(exp => {
        const expYear = new Date(exp.createdAt).getFullYear();
        return expYear === parseInt(year);
      });
    }

    if (month !== 'ALL') {
      filtered = filtered.filter(exp => {
        const expMonth = new Date(exp.createdAt).getMonth();
        return expMonth === parseInt(month);
      });
    }

    const days = [...new Set(filtered.map(exp => new Date(exp.createdAt).getDate()))];
    setAvailableDays(days.sort((a, b) => a - b)); // Sort ascending
  };

  // ✅ Effect to apply date filter when year, month, or day changes
  useEffect(() => {
    filterExpensesByDate(allExpenses, selectedYear, selectedMonth, selectedDay);
  }, [selectedYear, selectedMonth, selectedDay, allExpenses]);

  // ✅ Effect to update displayed expenses when filters change
  useEffect(() => {
    setDisplayedExpenses(expenses.slice(0, displayCount));
  }, [expenses, displayCount]);

  const handleAddExpense = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
    setAllExpenses([newExpense, ...allExpenses]);
    setShowAddModal(false);
    showSuccessMessage('Expense added successfully!');
    fetchExpenses(); // Refresh to update filters
  };

  const handleUpdateExpense = (updatedExpense) => {
    setExpenses(expenses.map(expense => expense.id === selectedExpense.id ? updatedExpense : expense));
    setAllExpenses(allExpenses.map(expense => expense.id === selectedExpense.id ? updatedExpense : expense));
    setShowEditModal(false);
    setSelectedExpense(null);
    showSuccessMessage('Expense updated successfully!');
    fetchExpenses(); // Refresh to update filters
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSES}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setExpenses(expenses.filter(expense => expense.id !== id));
          setAllExpenses(allExpenses.filter(expense => expense.id !== id));
          showSuccessMessage('Expense deleted successfully!');
          fetchExpenses(); // Refresh to update filters
        } else {
          setError('Failed to delete expense');
        }
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError('Error deleting expense. Please try again.');
      }
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const filteredExpenses = displayedExpenses.filter(expense => {
    if (!expense) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (expense.category && expense.category.toLowerCase().includes(searchLower)) ||
      (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
      (expense.id && expense.id.toString().includes(searchLower)) ||
      (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(searchLower))
    );
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => {
    const amount = expense && expense.amount ? parseFloat(expense.amount) : 0;
    return sum + amount;
  }, 0);

  const hasMoreExpenses = expenses.length > displayCount;

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  // ✅ NEW: Reset all filters
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth('ALL');
    setSelectedDay('ALL');
    setSearchTerm('');
    setDisplayCount(10);
  };

  // ✅ NEW: Get formatted date range text
  const getDateRangeText = () => {
    if (selectedDay !== 'ALL') {
      const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || '';
      return `${monthName} ${selectedDay}, ${selectedYear}`;
    }
    if (selectedMonth !== 'ALL') {
      return `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
    }
    if (selectedYear !== 'ALL') {
      return `Year ${selectedYear}`;
    }
    return 'All Time';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Expense Management</h2>
          <p className="text-gray-600 mt-1">Track and manage all expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* ✅ NEW: Year/Month/Day Filter Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
              Showing: {getDateRangeText()}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 bg-white p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value));
                  setSelectedDay('ALL'); // Reset day when year changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="ALL">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year} {year === new Date().getFullYear() && '(Current)'}
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
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedDay('ALL'); // Reset day when month changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                disabled={selectedMonth === 'ALL'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="ALL">All Days</option>
                {availableDays.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              {selectedMonth === 'ALL' && (
                <p className="text-xs text-gray-500 mt-1">Select a month first</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* ✅ Date Range Summary */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-700">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <strong>{expenses.length}</strong> expenses found
            </span>
            <span className="text-blue-600 font-medium">
              for {getDateRangeText()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by category, description, invoice number, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Expense</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalExpenses / filteredExpenses.length)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Expenses Found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search' 
                  : `No expenses found for ${getDateRangeText()}`
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  Create First Expense
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{expense.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          expense.category === 'Invoice Return' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {expense.category}
                        </span>
                        {expense.autoCreated && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Auto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {expense.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expense.invoiceNumber ? (
                          <span className="text-sm text-blue-600 font-medium">{expense.invoiceNumber}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(expense.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {!expense.autoCreated && (
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {isAdmin() && !expense.autoCreated && (
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                        {expense.autoCreated && (
                          <span className="text-gray-400 text-xs">Auto-created</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* See More Button */}
            {hasMoreExpenses && (
              <div className="flex justify-center py-4 border-t border-gray-200">
                <button
                  onClick={handleSeeMore}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
                >
                  See More ({expenses.length - displayCount} remaining)
                </button>
              </div>
            )}

            {/* Footer Summary */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {expenses.length} expenses for {getDateRangeText()}
                {hasMoreExpenses && ` • Load more to see older expenses`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddExpenseModal
          onAdd={handleAddExpense}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onUpdate={handleUpdateExpense}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpenseManagement;