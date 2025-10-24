// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import CancelOrderModal from './CancelOrderModal';
// import CreateInvoiceModal from "../invoices/CreateInvoiceModal";


// const JobCardView = ({ jobCardId, onClose, onEdit }) => {
//   const { apiCall } = useApi();
//   const [jobCard, setJobCard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  

//   useEffect(() => {
//     const fetchJobCard = async () => {
//       try {
//         setLoading(true);
//         const data = await apiCall(`/api/jobcards/${jobCardId}`);
//         setJobCard(data);
//       } catch (err) {
//         setError('Failed to load job card details');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (jobCardId) {
//       fetchJobCard();
//     }
//   }, [jobCardId]);

// const handleCancelSuccess = (response) => {
//   setJobCard(response);
//   setShowCancelModal(false);
// };

// // ADD THIS NEW FUNCTION
// const handleInvoiceSuccess = (response) => {
//   setShowCreateInvoiceModal(false);
//   const msg = document.createElement('div');
//   msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//   msg.textContent = 'Invoice created successfully!';
//   document.body.appendChild(msg);
//   setTimeout(() => msg.remove(), 3000);
// };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
//       COMPLETED: 'bg-green-100 text-green-800 border-green-300',
//       DELIVERED: 'bg-purple-100 text-purple-800 border-purple-300',
//       CANCELLED: 'bg-red-100 text-red-800 border-red-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !jobCard) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error || 'Job card not found'}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//         >
//           Back to List
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{jobCard.jobNumber}</h1>
//               <p className="text-blue-100">Job Card Details</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="mt-4 flex items-center space-x-4">
//             <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(jobCard.status)}`}>
//               {jobCard.status}
//             </span>
//             {jobCard.status === 'CANCELLED' && (
//               <span className="text-red-200 text-sm font-medium">❌ Cancelled</span>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Customer Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Customer Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Name</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Phone</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerPhone}</p>
//               </div>
//               {jobCard.customerEmail && (
//                 <div className="md:col-span-2">
//                   <label className="text-sm font-medium text-gray-600">Email</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.customerEmail}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Device Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               Device Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Device Type</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.deviceType}</p>
//               </div>
//               {jobCard.brandId && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">Brand</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.brandId}</p>
//                 </div>
//               )}
//               {jobCard.modelId && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">Model</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.modelId}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Service Details */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Service Details
//             </h2>
//             <div className="space-y-4">
//               {jobCard.fault && (
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <label className="text-sm font-medium text-gray-600 mb-2 block">Fault Type</label>
//                   <p className="text-gray-900">{jobCard.fault.faultName}</p>
//                 </div>
//               )}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-gray-600 mb-2 block">Fault Description</label>
//                 <p className="text-gray-900">{jobCard.faultDescription}</p>
//               </div>
//               {jobCard.notes && (
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <label className="text-sm font-medium text-gray-600 mb-2 block">Additional Notes</label>
//                   <p className="text-gray-900">{jobCard.notes}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Payment Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-blue-600">Advance Payment</label>
//                 <p className="text-2xl font-bold text-blue-700">
//                   ${jobCard.advancePayment?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//               <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-green-600">Estimated Cost</label>
//                 <p className="text-2xl font-bold text-green-700">
//                   ${jobCard.estimatedCost?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Cancellation Details (if cancelled) */}
//           {jobCard.status === 'CANCELLED' && jobCard.cancelledBy && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 01-2 2h-.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H12zm0 0V7a2 2 0 00-2-2H7.414a1 1 0 00-.707.293L4.293 7.707A1 1 0 004 8.414V9a2 2 0 002 2h.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h2m0 0v5m0 0V21" />
//                 </svg>
//                 Cancellation Details
//               </h2>

//               <div className="space-y-4">
//                 {/* Cancelled By */}
//                 <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">Cancelled By</p>
//                       <p className="text-lg font-bold text-red-900">
//                         {jobCard.cancelledBy === 'CUSTOMER' ? 'Customer' : 'Technician'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">User ID</p>
//                       <p className="text-lg font-bold text-red-900">#{jobCard.cancelledByUserId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Original Costs */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                     <p className="text-sm text-blue-600 font-medium mb-1">Original Advance</p>
//                     <p className="text-2xl font-bold text-blue-900">${jobCard.advancePayment?.toFixed(2) || '0.00'}</p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                     <p className="text-sm text-green-600 font-medium mb-1">Original Estimate</p>
//                     <p className="text-2xl font-bold text-green-900">${jobCard.estimatedCost?.toFixed(2) || '0.00'}</p>
//                   </div>
//                 </div>

//                 {/* Cancellation Fee (if Customer cancelled) */}
//                 {jobCard.cancelledBy === 'CUSTOMER' && jobCard.cancellationFee > 0 && (
//                   <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
//                     <p className="text-sm text-orange-600 font-medium mb-1">Cancellation Fee (Invoice Created)</p>
//                     <p className="text-2xl font-bold text-orange-900">${jobCard.cancellationFee?.toFixed(2)}</p>
//                   </div>
//                 )}

//                 {/* Cancellation Reason */}
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <p className="text-sm text-gray-600 font-medium mb-2">Reason for Cancellation</p>
//                   <p className="text-gray-900">{jobCard.cancellationReason}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Timeline */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Timeline
//             </h2>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-3">
//                 <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                 <span className="text-sm text-gray-600">Created:</span>
//                 <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</span>
//               </div>
//               {jobCard.updatedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Last Updated:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.updatedAt)}</span>
//                 </div>
//               )}
//               {jobCard.completedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-green-600 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Completed:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.completedAt)}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//             {/* Action Buttons */}
//             <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Close
//               </button>
//               {jobCard.status !== 'CANCELLED' && (
//                 <>
//                   {jobCard.status === 'COMPLETED' && (
//                     <button
//                       onClick={() => setShowCreateInvoiceModal(true)}
//                       className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                       <span>Create Invoice</span>
//                     </button>
//                   )}
//                   <button
//                     onClick={() => onEdit(jobCardId)}
//                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     <span>Edit Job Card</span>
//                   </button>
//                   <button
//                     onClick={() => setShowCancelModal(true)}
//                     className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                     <span>Cancel Job Card</span>
//                   </button>
//                 </>
//               )}
//             </div>
//         </div>
//       </div>
//         {/* Cancel Modal */}
//         {showCancelModal && (
//           <CancelOrderModal
//             jobCard={jobCard}
//             onSuccess={handleCancelSuccess}
//             onClose={() => setShowCancelModal(false)}
//           />
//         )}

//         {/* Create Invoice Modal */}
//         {showCreateInvoiceModal && (
//           <CreateInvoiceModal
//             jobCard={jobCard}
//             onSuccess={handleInvoiceSuccess}
//             onClose={() => setShowCreateInvoiceModal(false)}
//           />
//         )}
//     </div>
//   );
// };

// export default JobCardView;

// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import CancelOrderModal from './CancelOrderModal';
// import CreateInvoiceModal from "../invoices/CreateInvoiceModal";

// const JobCardView = ({ jobCardId, onClose, onEdit }) => {
//   const { apiCall } = useApi();
//   const [jobCard, setJobCard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

//   useEffect(() => {
//     const fetchJobCard = async () => {
//       try {
//         setLoading(true);
//         const data = await apiCall(`/api/jobcards/${jobCardId}`);
//         setJobCard(data);
//       } catch (err) {
//         setError('Failed to load job card details');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (jobCardId) {
//       fetchJobCard();
//     }
//   }, [jobCardId]);

//   const handleCancelSuccess = (response) => {
//     setJobCard(response);
//     setShowCancelModal(false);
//   };

//   const handleInvoiceSuccess = (response) => {
//     setShowCreateInvoiceModal(false);
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = 'Invoice created successfully!';
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
//       COMPLETED: 'bg-green-100 text-green-800 border-green-300',
//       DELIVERED: 'bg-purple-100 text-purple-800 border-purple-300',
//       CANCELLED: 'bg-red-100 text-red-800 border-red-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !jobCard) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error || 'Job card not found'}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//         >
//           Back to List
//         </button>
//       </div>
//     );
//   }

//   const totalItemsPrice = jobCard.addedItems?.reduce((sum, item) => sum + (item.total || item.quantity * item.unitPrice), 0) || 0;

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{jobCard.jobNumber}</h1>
//               <p className="text-blue-100">Job Card Details</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="mt-4 flex items-center space-x-4">
//             <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(jobCard.status)}`}>
//               {jobCard.status}
//             </span>
//             {jobCard.status === 'CANCELLED' && (
//               <span className="text-red-200 text-sm font-medium">❌ Cancelled</span>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Customer Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Customer Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Name</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Phone</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerPhone}</p>
//               </div>
//               {jobCard.customerEmail && (
//                 <div className="md:col-span-2">
//                   <label className="text-sm font-medium text-gray-600">Email</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.customerEmail}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Device Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               Device Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Device Type</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.deviceType}</p>
//               </div>
//               {jobCard.brandId && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">Brand</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.brandId}</p>
//                 </div>
//               )}
//               {jobCard.modelId && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">Model</label>
//                   <p className="text-lg font-semibold text-gray-900">{jobCard.modelId}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Device Serials - HIGHLIGHTED */}
//           {jobCard.deviceSerials && jobCard.deviceSerials.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <span className="text-2xl mr-2">📦</span>
//                 Device Serials
//               </h2>
//               <div className="space-y-2">
//                 {jobCard.deviceSerials.map((serial, index) => (
//                   <div 
//                     key={index} 
//                     className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 p-4 rounded-lg flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex-1">
//                       <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-3">
//                         {serial.serialType}
//                       </span>
//                       <span className="text-lg font-bold text-blue-900">{serial.serialValue}</span>
//                     </div>
//                     <div className="text-blue-600 text-2xl">✓</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Service Details */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Service Details
//             </h2>
//             <div className="space-y-4">
//               {jobCard.fault && (
//                 <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
//                   <label className="text-sm font-medium text-purple-700 mb-2 block">⚠️ Fault Type</label>
//                   <p className="text-lg font-bold text-purple-900">{jobCard.fault.faultName}</p>
//                 </div>
//               )}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-gray-600 mb-2 block">Fault Description</label>
//                 <p className="text-gray-900 whitespace-pre-wrap">{jobCard.faultDescription}</p>
//               </div>
//               {jobCard.notes && (
//                 <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//                   <label className="text-sm font-medium text-yellow-700 mb-2 block">📝 Additional Notes</label>
//                   <p className="text-yellow-900 whitespace-pre-wrap">{jobCard.notes}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Added Items - HIGHLIGHTED */}
//           {jobCard.addedItems && jobCard.addedItems.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <span className="text-2xl mr-2">🛒</span>
//                 Items / Parts Added
//               </h2>
//               <div className="space-y-2">
//                 {jobCard.addedItems.map((item, index) => (
//                   <div 
//                     key={index} 
//                     className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 p-4 rounded-lg"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <p className="font-bold text-green-900 text-lg">{item.description}</p>
//                         <p className="text-sm text-green-700 mt-1">
//                           Quantity: <span className="font-semibold">{item.quantity}</span> × ${item.unitPrice.toFixed(2)} per unit
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-green-600">Subtotal</p>
//                         <p className="text-2xl font-bold text-green-700">${(item.quantity * item.unitPrice).toFixed(2)}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               {totalItemsPrice > 0 && (
//                 <div className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4">
//                   <div className="flex justify-between items-center">
//                     <span className="font-bold text-green-900 text-lg">💰 Total Items Price:</span>
//                     <span className="text-3xl font-bold text-green-700">${totalItemsPrice.toFixed(2)}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Payment Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Payment Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-blue-600">Advance Payment</label>
//                 <p className="text-2xl font-bold text-blue-700">
//                   ${jobCard.advancePayment?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//               <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-green-600">Estimated Cost</label>
//                 <p className="text-2xl font-bold text-green-700">
//                   ${jobCard.estimatedCost?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Cancellation Details (if cancelled) */}
//           {jobCard.status === 'CANCELLED' && jobCard.cancelledBy && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 Cancellation Details
//               </h2>

//               <div className="space-y-4">
//                 {/* Cancelled By */}
//                 <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">Cancelled By</p>
//                       <p className="text-lg font-bold text-red-900">
//                         {jobCard.cancelledBy === 'CUSTOMER' ? '👤 Customer' : '👨‍🔧 Technician'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">User ID</p>
//                       <p className="text-lg font-bold text-red-900">#{jobCard.cancelledByUserId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Cancellation Fee (if Customer cancelled) */}
//                 {jobCard.cancelledBy === 'CUSTOMER' && jobCard.cancellationFee > 0 && (
//                   <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
//                     <p className="text-sm text-orange-600 font-medium mb-1">💵 Cancellation Fee (Invoice Created)</p>
//                     <p className="text-2xl font-bold text-orange-900">${jobCard.cancellationFee?.toFixed(2)}</p>
//                   </div>
//                 )}

//                 {/* Cancellation Reason */}
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <p className="text-sm text-gray-600 font-medium mb-2">Reason for Cancellation</p>
//                   <p className="text-gray-900 whitespace-pre-wrap">{jobCard.cancellationReason}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Timeline */}
//           <div className="pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Timeline
//             </h2>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-3">
//                 <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                 <span className="text-sm text-gray-600">Created:</span>
//                 <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</span>
//               </div>
//               {jobCard.updatedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Last Updated:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.updatedAt)}</span>
//                 </div>
//               )}
//               {jobCard.completedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-green-600 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Completed:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.completedAt)}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
//             <button
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
//             >
//               Close
//             </button>
//             {jobCard.status !== 'CANCELLED' && (
//               <>
//                 {jobCard.status === 'COMPLETED' && (
//                   <button
//                     onClick={() => setShowCreateInvoiceModal(true)}
//                     className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <span>Create Invoice</span>
//                   </button>
//                 )}
//                 <button
//                   onClick={() => onEdit(jobCardId)}
//                   className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                   </svg>
//                   <span>Edit Job Card</span>
//                 </button>
//                 <button
//                   onClick={() => setShowCancelModal(true)}
//                   className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   <span>Cancel Job Card</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Cancel Modal */}
//       {showCancelModal && (
//         <CancelOrderModal
//           jobCard={jobCard}
//           onSuccess={handleCancelSuccess}
//           onClose={() => setShowCancelModal(false)}
//         />
//       )}

//       {/* Create Invoice Modal */}
//       {showCreateInvoiceModal && (
//         <CreateInvoiceModal
//           jobCard={jobCard}
//           onSuccess={handleInvoiceSuccess}
//           onClose={() => setShowCreateInvoiceModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default JobCardView;

import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import CancelOrderModal from './CancelOrderModal';
import CreateInvoiceModal from "../invoices/CreateInvoiceModal";

const JobCardView = ({ jobCardId, onClose, onEdit }) => {
  const { apiCall } = useApi();
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/jobcards/${jobCardId}`);
        setJobCard(data);
      } catch (err) {
        setError('Failed to load job card details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (jobCardId) {
      fetchJobCard();
    }
  }, [jobCardId]);

  const handleCancelSuccess = (response) => {
    setJobCard(response);
    setShowCancelModal(false);
  };

  const handleInvoiceSuccess = (response) => {
    setShowCreateInvoiceModal(false);
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = 'Invoice created successfully!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      DELIVERED: 'bg-purple-100 text-purple-800 border-purple-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSerialTypeColor = (type) => {
    const colors = {
      'DEVICE_SERIAL': 'bg-blue-600 text-white',
      'IMEI': 'bg-purple-600 text-white',
      'SERIAL_NUMBER': 'bg-indigo-600 text-white',
      'MODEL_NUMBER': 'bg-violet-600 text-white'
    };
    return colors[type] || 'bg-gray-600 text-white';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !jobCard) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Job card not found'}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  // Separate serials by type
  const deviceSerials = jobCard.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];
  const otherSerials = jobCard.serials?.filter(s => s.serialType !== 'DEVICE_SERIAL') || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{jobCard.jobNumber}</h1>
              <p className="text-blue-100">Job Card Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(jobCard.status)}`}>
              {jobCard.status}
            </span>
            {jobCard.status === 'CANCELLED' && (
              <span className="text-red-200 text-sm font-medium">❌ Cancelled</span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerPhone}</p>
              </div>
              {jobCard.customerEmail && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg font-semibold text-gray-900">{jobCard.customerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Device Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Device Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">Device Type</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.deviceType}</p>
              </div>
              {jobCard.brandId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand</label>
                  <p className="text-lg font-semibold text-gray-900">{jobCard.brandId}</p>
                </div>
              )}
              {jobCard.modelId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Model</label>
                  <p className="text-lg font-semibold text-gray-900">{jobCard.modelId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Device Serials - HIGHLIGHTED */}
          {deviceSerials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Device Serial (PRIMARY)
              </h2>
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                <div className="space-y-2">
                  {deviceSerials.map((serial, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-3">DEVICE_SERIAL</span>
                        <span className="text-gray-700 font-semibold">{serial.serialValue}</span>
                      </div>
                      <span className="text-blue-600 text-sm">🔹 Primary</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other Serials */}
          {otherSerials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Other Serials (IMEI, etc.)
              </h2>
              <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                <div className="space-y-2">
                  {otherSerials.map((serial, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-purple-300">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded mr-3 ${getSerialTypeColor(serial.serialType)}`}>
                          {serial.serialType}
                        </span>
                        <span className="text-gray-700 font-semibold">{serial.serialValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Details */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Service Details
            </h2>
            <div className="space-y-4">
              {jobCard.fault && (
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Fault Type</label>
                  <p className="text-gray-900 font-semibold">{jobCard.fault.faultName}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Fault Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{jobCard.faultDescription}</p>
              </div>
              {jobCard.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <label className="text-sm font-medium text-blue-600 mb-2 block">Additional Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{jobCard.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <label className="text-sm font-medium text-blue-600">Advance Payment</label>
                <p className="text-2xl font-bold text-blue-700">
                  ${jobCard.advancePayment?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <label className="text-sm font-medium text-green-600">Estimated Cost</label>
                <p className="text-2xl font-bold text-green-700">
                  ${jobCard.estimatedCost?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Details (if cancelled) */}
          {jobCard.status === 'CANCELLED' && jobCard.cancelledBy && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancellation Details
              </h2>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-red-600 font-medium mb-1">Cancelled By</p>
                      <p className="text-lg font-bold text-red-900">
                        {jobCard.cancelledBy === 'CUSTOMER' ? 'Customer' : 'Technician'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium mb-1">User ID</p>
                      <p className="text-lg font-bold text-red-900">#{jobCard.cancelledByUserId}</p>
                    </div>
                  </div>
                </div>

                {jobCard.cancellationReason && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">Reason for Cancellation</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{jobCard.cancellationReason}</p>
                  </div>
                )}

                {jobCard.cancelledBy === 'CUSTOMER' && jobCard.cancellationFee > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium mb-1">Cancellation Fee (Invoice Created)</p>
                    <p className="text-2xl font-bold text-orange-900">${jobCard.cancellationFee?.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</span>
              </div>
              {jobCard.updatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.updatedAt)}</span>
                </div>
              )}
              {jobCard.completedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            {jobCard.status !== 'CANCELLED' && (
              <>
                {jobCard.status === 'COMPLETED' && (
                  <button
                    onClick={() => setShowCreateInvoiceModal(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Create Invoice</span>
                  </button>
                )}
                <button
                  onClick={() => onEdit(jobCardId)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Job Card</span>
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Job Card</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelOrderModal
          jobCard={jobCard}
          onSuccess={handleCancelSuccess}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <CreateInvoiceModal
          jobCard={jobCard}
          onSuccess={handleInvoiceSuccess}
          onClose={() => setShowCreateInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default JobCardView;