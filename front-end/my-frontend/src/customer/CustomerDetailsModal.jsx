// import { useState } from 'react';

// const CustomerDetailsModal = ({ customer, onClose, onRefresh, apiCall }) => {
//   const [creditAmount, setCreditAmount] = useState('');
//   const [creditAction, setCreditAction] = useState('add'); // 'add' or 'deduct'
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleCreditSubmit = async (e) => {
//     e.preventDefault();

//     if (!creditAmount || parseFloat(creditAmount) <= 0) {
//       setError('Please enter a valid amount');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const endpoint = creditAction === 'add'
//         ? `/api/customers/${customer.customerId}/add-credit`
//         : `/api/customers/${customer.customerId}/deduct-credit`;

//       const response = await apiCall(endpoint, {
//         method: 'POST',
//         body: JSON.stringify({ amount: parseFloat(creditAmount) })
//       });

//       setSuccess(response.message || `Credit ${creditAction === 'add' ? 'added' : 'deducted'} successfully`);
//       setCreditAmount('');
//       onRefresh();

//       // Close modal after 2 seconds
//       setTimeout(() => {
//         onClose();
//       }, 2000);
//     } catch (err) {
//       setError(err.message || `Failed to ${creditAction} credit`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-blue-600 px-6 py-4 flex items-center justify-between">
//           <h3 className="text-xl font-bold text-white">Customer Details</h3>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-6">
//           {/* Customer Info */}
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Name:</span>
//               <span className="font-medium text-gray-900">{customer.customerName}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Phone:</span>
//               <span className="font-medium text-gray-900">{customer.phoneNumber}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Email:</span>
//               <span className="font-medium text-gray-900 text-sm">{customer.email}</span>
//             </div>
//             <div className="flex items-center justify-between pt-3 border-t">
//               <span className="text-gray-600">Credit Balance:</span>
//               <span className={`font-bold text-lg ${
//                 customer.creditBalance > 0 ? 'text-green-600' : 'text-gray-600'
//               }`}>
//                 Rs.{customer.creditBalance.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Services:</span>
//               <span className="font-medium text-gray-900">{customer.totalServiceCount}</span>
//             </div>
//             {customer.lastVisit && (
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-600">Last Visit:</span>
//                 <span className="font-medium text-gray-900 text-sm">
//                   {new Date(customer.lastVisit).toLocaleDateString('en-US', {
//                     year: 'numeric',
//                     month: 'short',
//                     day: 'numeric'
//                   })}
//                 </span>
//               </div>
//             )}
//             {customer.address && (
//               <div>
//                 <span className="text-gray-600">Address:</span>
//                 <p className="font-medium text-gray-900 text-sm mt-1">{customer.address}</p>
//               </div>
//             )}
//           </div>

//           {/* Credit Management */}
//           <div className="border-t pt-4 space-y-4">
//             <h4 className="font-semibold text-gray-900">Manage Credit</h4>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
//                 {error}
//               </div>
//             )}

//             {success && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
//                 {success}
//               </div>
//             )}

//             <form onSubmit={handleCreditSubmit} className="space-y-3">
//               {/* Action Selection */}
//               <div className="flex space-x-2">
//                 <label className="flex items-center space-x-2 cursor-pointer flex-1">
//                   <input
//                     type="radio"
//                     name="action"
//                     value="add"
//                     checked={creditAction === 'add'}
//                     onChange={(e) => setCreditAction(e.target.value)}
//                     className="w-4 h-4 text-blue-600"
//                   />
//                   <span className="text-sm text-gray-700">Add Credit</span>
//                 </label>
//                 <label className="flex items-center space-x-2 cursor-pointer flex-1">
//                   <input
//                     type="radio"
//                     name="action"
//                     value="deduct"
//                     checked={creditAction === 'deduct'}
//                     onChange={(e) => setCreditAction(e.target.value)}
//                     className="w-4 h-4 text-blue-600"
//                   />
//                   <span className="text-sm text-gray-700">Deduct Credit</span>
//                 </label>
//               </div>

//               {/* Amount Input */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Amount (Rs.) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={creditAmount}
//                   onChange={(e) => {
//                     setCreditAmount(e.target.value);
//                     setError('');
//                   }}
//                   placeholder="Enter amount"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Buttons */}
//               <div className="flex space-x-3 pt-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
//                     creditAction === 'add'
//                       ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
//                       : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
//                   }`}
//                 >
//                   {loading ? 'Processing...' : (creditAction === 'add' ? 'Add' : 'Deduct')}
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Notes */}
//           {customer.notes && (
//             <div className="border-t pt-4">
//               <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
//               <p className="text-sm text-gray-600">{customer.notes}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDetailsModal;

// import { useState, useEffect } from 'react';

// const CustomerDetailsModal = ({ customer, onClose, onRefresh, apiCall }) => {
//   const [creditAmount, setCreditAmount] = useState('');
//   const [creditAction, setCreditAction] = useState('add');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [customerSummary, setCustomerSummary] = useState(null);
//   const [summaryLoading, setSummaryLoading] = useState(true);

//   useEffect(() => {
//     const fetchCustomerSummary = async () => {
//       setSummaryLoading(true);
//       try {
//         const summary = await apiCall(`/api/customers/${customer.customerId}/summary/detailed`);
//         setCustomerSummary(summary);
//       } catch (err) {
//         console.error('Failed to load customer summary:', err);
//       } finally {
//         setSummaryLoading(false);
//       }
//     };

//     if (customer) {
//       fetchCustomerSummary();
//     }
//   }, [customer, apiCall]);

//   const handleCreditSubmit = async (e) => {
//     e.preventDefault();

//     if (!creditAmount || parseFloat(creditAmount) <= 0) {
//       setError('Please enter a valid amount');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const endpoint = creditAction === 'add'
//         ? `/api/customers/${customer.customerId}/add-credit`
//         : `/api/customers/${customer.customerId}/deduct-credit`;

//       const response = await apiCall(endpoint, {
//         method: 'POST',
//         body: JSON.stringify({ amount: parseFloat(creditAmount) })
//       });

//       setSuccess(response.message || `Credit ${creditAction === 'add' ? 'added' : 'deducted'} successfully`);
//       setCreditAmount('');
//       onRefresh();

//       setTimeout(() => {
//         onClose();
//       }, 2000);
//     } catch (err) {
//       setError(err.message || `Failed to ${creditAction} credit`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between z-10">
//           <h3 className="text-xl font-bold text-white">Customer Summary Report</h3>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {summaryLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : customerSummary ? (
//             <>
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="text-2xl font-bold text-gray-900">{customerSummary.customer.customerName}</h3>
//                     <p className="text-gray-600 text-sm mt-1">{customerSummary.customer.phoneNumber}</p>
//                     {customerSummary.customer.email && (
//                       <p className="text-gray-600 text-sm">{customerSummary.customer.email}</p>
//                     )}
//                     {customerSummary.customer.address && (
//                       <p className="text-gray-600 text-sm mt-2">{customerSummary.customer.address}</p>
//                     )}
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-gray-600 font-semibold">MEMBER SINCE</p>
//                     <p className="text-sm font-bold text-gray-900">
//                       {new Date(customerSummary.customer.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </p>
//                     <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
//                       customerSummary.customer.isActive
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {customerSummary.customer.isActive ? 'ACTIVE' : 'INACTIVE'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
//                   <p className="text-xs text-blue-600 font-semibold mb-1">TOTAL JOBS</p>
//                   <p className="text-3xl font-bold text-blue-700">{customerSummary.summary.totalJobs}</p>
//                 </div>

//                 <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
//                   <p className="text-xs text-green-600 font-semibold mb-1">COMPLETED</p>
//                   <p className="text-3xl font-bold text-green-700">{customerSummary.summary.completedJobs}</p>
//                 </div>

//                 <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
//                   <p className="text-xs text-yellow-600 font-semibold mb-1">PENDING</p>
//                   <p className="text-3xl font-bold text-yellow-700">{customerSummary.summary.pendingJobs}</p>
//                 </div>

//                 <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
//                   <p className="text-xs text-red-600 font-semibold mb-1">CANCELLED</p>
//                   <p className="text-3xl font-bold text-red-700">{customerSummary.summary.cancelledJobs}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
//                   <p className="text-xs text-purple-600 font-semibold mb-1">TOTAL SPENT</p>
//                   <p className="text-2xl font-bold text-purple-700">Rs.{customerSummary.summary.totalSpent?.toFixed(2) || '0.00'}</p>
//                 </div>

//                 <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
//                   <p className="text-xs text-orange-600 font-semibold mb-1">TOTAL PAID</p>
//                   <p className="text-2xl font-bold text-orange-700">Rs.{customerSummary.summary.totalPaid?.toFixed(2) || '0.00'}</p>
//                 </div>

//                 <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-300">
//                   <p className="text-xs text-pink-600 font-semibold mb-1">OUTSTANDING</p>
//                   <p className="text-2xl font-bold text-pink-700">Rs.{customerSummary.summary.outstandingBalance?.toFixed(2) || '0.00'}</p>
//                 </div>
//               </div>

//               {customerSummary.summary.lastJobDate && (
//                 <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
//                   <p className="text-xs text-indigo-600 font-semibold mb-1">LAST JOB DATE</p>
//                   <p className="text-lg font-bold text-indigo-900">
//                     {new Date(customerSummary.summary.lastJobDate).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </p>
//                   <p className="text-sm text-indigo-700 mt-1">
//                     ({Math.floor((new Date() - new Date(customerSummary.summary.lastJobDate)) / (1000 * 60 * 60 * 24))} days ago)
//                   </p>
//                 </div>
//               )}

//               {customerSummary.jobHistory?.jobs && customerSummary.jobHistory.jobs.length > 0 && (
//                 <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
//                   <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                     <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     Recent Job Cards ({customerSummary.jobHistory.jobs.length})
//                   </h4>
//                   <div className="space-y-3 max-h-64 overflow-y-auto">
//                     {customerSummary.jobHistory.jobs.slice(0, 10).map((job, idx) => (
//                       <div key={idx} className="bg-white p-4 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
//                         <div className="flex items-center justify-between">
//                           <div className="flex-1">
//                             <p className="font-bold text-gray-900">{job.jobNumber}</p>
//                             <p className="text-sm text-gray-600">{job.deviceType}</p>
//                             {job.faults && job.faults.length > 0 && (
//                               <p className="text-xs text-gray-500 mt-1">Faults: {job.faults.join(', ')}</p>
//                             )}
//                           </div>
//                           <div className="text-right">
//                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                               job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
//                               job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
//                               job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
//                               job.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {job.status}
//                             </span>
//                             <p className="text-sm font-bold text-gray-900 mt-2">Rs.{job.totalServicePrice?.toFixed(2) || '0.00'}</p>
//                             <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : null}

//           <div className="border-t pt-6 space-y-4">
//             <h4 className="font-semibold text-gray-900 flex items-center">
//               <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Manage Credit
//             </h4>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
//                 {error}
//               </div>
//             )}

//             {success && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
//                 {success}
//               </div>
//             )}

//             <form onSubmit={handleCreditSubmit} className="space-y-3">
//               <div className="flex space-x-2">
//                 <label className="flex items-center space-x-2 cursor-pointer flex-1">
//                   <input
//                     type="radio"
//                     name="action"
//                     value="add"
//                     checked={creditAction === 'add'}
//                     onChange={(e) => setCreditAction(e.target.value)}
//                     className="w-4 h-4 text-blue-600"
//                   />
//                   <span className="text-sm text-gray-700">Add Credit</span>
//                 </label>
//                 <label className="flex items-center space-x-2 cursor-pointer flex-1">
//                   <input
//                     type="radio"
//                     name="action"
//                     value="deduct"
//                     checked={creditAction === 'deduct'}
//                     onChange={(e) => setCreditAction(e.target.value)}
//                     className="w-4 h-4 text-blue-600"
//                   />
//                   <span className="text-sm text-gray-700">Deduct Credit</span>
//                 </label>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Amount (Rs.) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={creditAmount}
//                   onChange={(e) => {
//                     setCreditAmount(e.target.value);
//                     setError('');
//                   }}
//                   placeholder="Enter amount"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex space-x-3 pt-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
//                     creditAction === 'add'
//                       ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
//                       : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
//                   }`}
//                 >
//                   {loading ? 'Processing...' : (creditAction === 'add' ? 'Add' : 'Deduct')}
//                 </button>
//               </div>
//             </form>
//           </div>

//           {customer.notes && (
//             <div className="border-t pt-4">
//               <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
//               <p className="text-sm text-gray-600">{customer.notes}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDetailsModal;

import { useState, useEffect } from 'react';

const CustomerDetailsModal = ({ customer, onClose, onRefresh, apiCall }) => {
  const [creditAmount, setCreditAmount] = useState('');
  const [creditAction, setCreditAction] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ✅ NEW: Customer summary state
  const [customerSummary, setCustomerSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'history', 'credit'

  // ✅ NEW: Fetch detailed customer summary on modal open
  useEffect(() => {
    if (customer && customer.customerId) {
      fetchCustomerSummary();
    }
  }, [customer]);

  const fetchCustomerSummary = async () => {
    setSummaryLoading(true);
    try {
      const summary = await apiCall(`/api/customers/${customer.customerId}/summary/detailed`);
      setCustomerSummary(summary);
    } catch (err) {
      console.error('Failed to load customer summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCreditSubmit = async (e) => {
    e.preventDefault();

    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = creditAction === 'add'
        ? `/api/customers/${customer.customerId}/add-credit`
        : `/api/customers/${customer.customerId}/deduct-credit`;

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(creditAmount) })
      });

      setSuccess(response.message || `Credit ${creditAction === 'add' ? 'added' : 'deducted'} successfully`);
      setCreditAmount('');
      onRefresh();
      fetchCustomerSummary(); // Refresh summary

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || `Failed to ${creditAction} credit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Customer Details</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History & Summary
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'credit'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Credit
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* Tab: Information */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{customer.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{customer.phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900 text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Credit Balance:</span>
                  <span className={`font-bold text-lg ${
                    customer.creditBalance > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Rs.{customer.creditBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Services:</span>
                  <span className="font-medium text-gray-900">{customer.totalServiceCount}</span>
                </div>
                {customer.lastVisit && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {new Date(customer.lastVisit).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
              
              {customer.address && (
                <div className="pt-4 border-t">
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium text-gray-900 text-sm mt-1">{customer.address}</p>
                </div>
              )}

              {customer.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: History & Summary */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {summaryLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : customerSummary ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                      <p className="text-xs text-blue-600 font-semibold mb-1">TOTAL JOBS</p>
                      <p className="text-3xl font-bold text-blue-700">{customerSummary.summary.totalJobs}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                      <p className="text-xs text-green-600 font-semibold mb-1">COMPLETED</p>
                      <p className="text-3xl font-bold text-green-700">{customerSummary.summary.completedJobs}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                      <p className="text-xs text-orange-600 font-semibold mb-1">PENDING</p>
                      <p className="text-3xl font-bold text-orange-700">{customerSummary.summary.pendingJobs}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                      <p className="text-xs text-purple-600 font-semibold mb-1">TOTAL SPENT</p>
                      <p className="text-2xl font-bold text-purple-700">Rs.{customerSummary.summary.totalSpent?.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Job Status Breakdown */}
                  {customerSummary.jobHistory && customerSummary.jobHistory.byStatus && (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Job Status Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(customerSummary.jobHistory.byStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between bg-white p-3 rounded border">
                            <span className="text-sm font-medium text-gray-700">
                              {status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-lg font-bold text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Jobs */}
                  {customerSummary.recentActivity && customerSummary.recentActivity.recentJobs && (
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Recent Jobs</h4>
                      <div className="space-y-2">
                        {customerSummary.recentActivity.recentJobs.slice(0, 5).map((job, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{job.jobNumber}</p>
                              <p className="text-xs text-gray-600">{job.deviceType}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">Rs.{job.totalServicePrice?.toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold mb-1">TOTAL PAID</p>
                      <p className="text-xl font-bold text-indigo-700">Rs.{customerSummary.summary.totalPaid?.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                      <p className="text-xs text-red-600 font-semibold mb-1">OUTSTANDING</p>
                      <p className="text-xl font-bold text-red-700">Rs.{customerSummary.summary.outstandingBalance?.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200">
                      <p className="text-xs text-teal-600 font-semibold mb-1">AVG JOB VALUE</p>
                      <p className="text-xl font-bold text-teal-700">Rs.{customerSummary.summary.averageJobValue?.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No summary data available
                </div>
              )}
            </div>
          )}

          {/* Tab: Manage Credit */}
          {activeTab === 'credit' && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">CURRENT CREDIT BALANCE</p>
                <p className="text-4xl font-bold text-blue-700">Rs.{customer.creditBalance.toFixed(2)}</p>
              </div>

              <form onSubmit={handleCreditSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1 p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="action"
                      value="add"
                      checked={creditAction === 'add'}
                      onChange={(e) => setCreditAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Add Credit</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer flex-1 p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="action"
                      value="deduct"
                      checked={creditAction === 'deduct'}
                      onChange={(e) => setCreditAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Deduct Credit</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={creditAmount}
                    onChange={(e) => {
                      setCreditAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    creditAction === 'add'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                  }`}
                >
                  {loading ? 'Processing...' : (creditAction === 'add' ? 'Add Credit' : 'Deduct Credit')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;