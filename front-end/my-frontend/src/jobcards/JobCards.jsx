


// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import JobCardEdit from './JobCardEdit';
// import JobCardView from './JobCardView';

// const JobCards = ({ onCreateNew }) => {
//   const { apiCall } = useApi();
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [editingJobCard, setEditingJobCard] = useState(null);
//   const [viewingJobCard, setViewingJobCard] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [visibleCount, setVisibleCount] = useState(10);

//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       // Sort by creation date - newest first
//       const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setJobCards(sortedData);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchJobCards();
//   }, []);

//   // Function to add new job card to the top
//   const addNewJobCard = (newJobCard) => {
//     setJobCards(prev => [newJobCard, ...prev]);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800',
//       COMPLETED: 'bg-green-100 text-green-900',
//       DELIVERED: 'bg-purple-100 text-purple-800',
//       CANCELLED: 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Filter job cards by status AND search term
//   const filteredJobCards = jobCards.filter(job => {
//     const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
//     const searchMatch = searchTerm === '' || 
//       job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
//     return statusMatch && searchMatch;
//   });

//   // Get only the visible job cards (first N items)
//   const visibleJobCards = filteredJobCards.slice(0, visibleCount);

//   // Function to load more job cards
//   const loadMore = () => {
//     setVisibleCount(prev => prev + 10);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (viewingJobCard) {
//     return (
//       <JobCardView
//         jobCardId={viewingJobCard}
//         onClose={() => setViewingJobCard(null)}
//         onEdit={(id) => {
//           setViewingJobCard(null);
//           setEditingJobCard(id);
//         }}
//       />
//     );
//   }

//   if (editingJobCard) {
//     return (
//       <JobCardEdit
//         jobCardId={editingJobCard}
//         onSuccess={(updatedJobCard) => {
//           setEditingJobCard(null);
//           // Update the specific job card in the list
//           setJobCards(prev => prev.map(job => 
//             job.id === editingJobCard ? updatedJobCard : job
//           ));
//         }}
//         onCancel={() => setEditingJobCard(null)}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
//         <button
//           onClick={onCreateNew}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>New Job Card</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by job card number or barcode..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex space-x-2 overflow-x-auto">
//           {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
//                 filterStatus === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Results Count */}
//       {searchTerm && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-blue-800">
//             Found {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''} 
//             {searchTerm && ` for "${searchTerm}"`}
//           </p>
//         </div>
//       )}

//       {/* Job Cards Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Job Number
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Device
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Barcode
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estimated Cost
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {visibleJobCards.map(job => (
//                 <tr key={job.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.customerName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.deviceType}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.customerPhone}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.barcode || '-'}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-green-600">
//                       Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
//                       {job.status.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => setViewingJobCard(job.id)}
//                         className="text-blue-600 hover:text-blue-900 transition-colors"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => setEditingJobCard(job.id)}
//                         className="text-green-600 hover:text-green-900 transition-colors"
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <tbody className="bg-white divide-y divide-gray-200">
//   {visibleJobCards.map(job => (
//     <tr 
//       key={job.id} 
//       className={`transition-colors ${
//         job.oneDayService 
//           ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'  // Red highlight for One Day Service
//           : 'hover:bg-gray-50'
//       }`}
//     >
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
//         {job.oneDayService && (  // ADDED: One Day Service indicator
//           <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
//             🚨 ONE DAY
//           </span>
//         )}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{job.customerName}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{job.deviceType}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{job.customerPhone}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{job.barcode || '-'}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-green-600">
//           Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
//           {job.status.replace('_', ' ')}
//         </span>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//         <div className="flex space-x-2">
//           <button 
//             onClick={() => setViewingJobCard(job.id)}
//             className="text-blue-600 hover:text-blue-900 transition-colors"
//           >
//             View
//           </button>
//           <button 
//             onClick={() => setEditingJobCard(job.id)}
//             className="text-green-600 hover:text-green-900 transition-colors"
//           >
//             Edit
//           </button>
//         </div>
//       </td>
//     </tr>
//   ))}
// </tbody>

//         {/* See More Button */}
//         {filteredJobCards.length > visibleCount && (
//           <div className="flex justify-center py-4 border-t border-gray-200">
//             <button
//               onClick={loadMore}
//               className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <span>See More ({filteredJobCards.length - visibleCount} remaining)</span>
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//           </div>
//         )}

//         {filteredJobCards.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-xl font-medium text-gray-900 mb-2">
//               {searchTerm ? 'No Job Cards Found' : 'No Job Cards Found'}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {searchTerm 
//                 ? `No job cards found for "${searchTerm}". Try a different search term.`
//                 : 'Create your first job card to get started'
//               }
//             </p>
//             {searchTerm ? (
//               <button
//                 onClick={() => setSearchTerm('')}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Clear Search
//               </button>
//             ) : (
//               <button
//                 onClick={onCreateNew}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Create Job Card
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobCards;



// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import JobCardEdit from './JobCardEdit';
// import JobCardView from './JobCardView';

// const JobCards = ({ onCreateNew }) => {
//   const { apiCall } = useApi();
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [editingJobCard, setEditingJobCard] = useState(null);
//   const [viewingJobCard, setViewingJobCard] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [visibleCount, setVisibleCount] = useState(10);

//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       // Sort by creation date - newest first
//       const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setJobCards(sortedData);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchJobCards();
//   }, []);

//   // Function to add new job card to the top
//   const addNewJobCard = (newJobCard) => {
//     setJobCards(prev => [newJobCard, ...prev]);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800',
//       COMPLETED: 'bg-green-100 text-green-900',
//       DELIVERED: 'bg-purple-100 text-purple-800',
//       CANCELLED: 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Filter job cards by status AND search term
//   const filteredJobCards = jobCards.filter(job => {
//     const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
//     const searchMatch = searchTerm === '' || 
//       job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
//     return statusMatch && searchMatch;
//   });

//   // Get only the visible job cards (first N items)
//   const visibleJobCards = filteredJobCards.slice(0, visibleCount);

//   // Function to load more job cards
//   const loadMore = () => {
//     setVisibleCount(prev => prev + 10);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (viewingJobCard) {
//     return (
//       <JobCardView
//         jobCardId={viewingJobCard}
//         onClose={() => setViewingJobCard(null)}
//         onEdit={(id) => {
//           setViewingJobCard(null);
//           setEditingJobCard(id);
//         }}
//       />
//     );
//   }

//   if (editingJobCard) {
//     return (
//       <JobCardEdit
//         jobCardId={editingJobCard}
//         onSuccess={(updatedJobCard) => {
//           setEditingJobCard(null);
//           // Update the specific job card in the list
//           setJobCards(prev => prev.map(job => 
//             job.id === editingJobCard ? updatedJobCard : job
//           ));
//         }}
//         onCancel={() => setEditingJobCard(null)}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
//         <button
//           onClick={onCreateNew}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>New Job Card</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by job card number, customer name, phone, device type, or barcode..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex space-x-2 overflow-x-auto">
//           {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
//                 filterStatus === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Results Count */}
//       {searchTerm && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-blue-800">
//             Found {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''} 
//             {searchTerm && ` for "${searchTerm}"`}
//           </p>
//         </div>
//       )}

//       {/* One Day Service Summary */}
//       {filteredJobCards.some(job => job.oneDayService) && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//             <span className="text-red-800 font-medium">
//               🚨 {filteredJobCards.filter(job => job.oneDayService).length} One Day Service job card{filteredJobCards.filter(job => job.oneDayService).length !== 1 ? 's' : ''} requiring urgent attention
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Job Cards Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Job Number
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Device
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Barcode
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estimated Cost
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {visibleJobCards.map(job => (
//                 <tr 
//                   key={job.id} 
//                   className={`transition-colors ${
//                     job.oneDayService 
//                       ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'  // Red highlight for One Day Service
//                       : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
//                     {job.oneDayService && (  // ADDED: One Day Service indicator
//                       <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
//                         🚨 ONE DAY
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.customerName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.deviceType}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.customerPhone}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{job.barcode || '-'}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-green-600">
//                       Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
//                       {job.status.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => setViewingJobCard(job.id)}
//                         className="text-blue-600 hover:text-blue-900 transition-colors"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => setEditingJobCard(job.id)}
//                         className="text-green-600 hover:text-green-900 transition-colors"
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* See More Button */}
//         {filteredJobCards.length > visibleCount && (
//           <div className="flex justify-center py-4 border-t border-gray-200">
//             <button
//               onClick={loadMore}
//               className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <span>See More ({filteredJobCards.length - visibleCount} remaining)</span>
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//           </div>
//         )}

//         {filteredJobCards.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-xl font-medium text-gray-900 mb-2">
//               {searchTerm ? 'No Job Cards Found' : 'No Job Cards Found'}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {searchTerm 
//                 ? `No job cards found for "${searchTerm}". Try a different search term.`
//                 : 'Create your first job card to get started'
//               }
//             </p>
//             {searchTerm ? (
//               <button
//                 onClick={() => setSearchTerm('')}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Clear Search
//               </button>
//             ) : (
//               <button
//                 onClick={onCreateNew}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Create Job Card
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobCards;





import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import JobCardEdit from './JobCardEdit';
import JobCardView from './JobCardView';

const JobCards = ({ onCreateNew }) => {
  const { apiCall } = useApi();
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editingJobCard, setEditingJobCard] = useState(null);
  const [viewingJobCard, setViewingJobCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  // NEW: State for advanced filters
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterProcessor, setFilterProcessor] = useState('');
  const [filterDeviceCondition, setFilterDeviceCondition] = useState('');
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch job cards and filter data
  const fetchJobCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/jobcards');
      // Sort by creation date - newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobCards(sortedData);
    } catch (err) {
      setError('Failed to load job cards');
      console.error(err);
    }
    setLoading(false);
  };

  // Fetch filter options
  const fetchFilterData = async () => {
    try {
      const [brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
        apiCall('/api/brands'),
        apiCall('/api/models'),
        apiCall('/api/processors'),
        apiCall('/api/device-conditions')
      ]);
      setBrands(brandsData || []);
      setModels(modelsData || []);
      setProcessors(processorsData || []);
      setDeviceConditions(conditionsData || []);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  useEffect(() => {
    fetchJobCards();
    fetchFilterData();
  }, []);

  // Function to add new job card to the top
  const addNewJobCard = (newJobCard) => {
    setJobCards(prev => [newJobCard, ...prev]);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-900',
      DELIVERED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // UPDATED: Filter job cards by status, search term, AND new filters
  const filteredJobCards = jobCards.filter(job => {
    const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // NEW: Advanced filter conditions
    const brandMatch = filterBrand === '' || job.brand?.id === parseInt(filterBrand);
    const modelMatch = filterModel === '' || job.model?.id === parseInt(filterModel);
    const processorMatch = filterProcessor === '' || job.processor?.id === parseInt(filterProcessor);
    const conditionMatch = filterDeviceCondition === '' || job.deviceCondition?.id === parseInt(filterDeviceCondition);

    return statusMatch && searchMatch && brandMatch && modelMatch && processorMatch && conditionMatch;
  });

  // Get only the visible job cards (first N items)
  const visibleJobCards = filteredJobCards.slice(0, visibleCount);

  // Function to load more job cards
  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  // Function to clear all advanced filters
  const clearAdvancedFilters = () => {
    setFilterBrand('');
    setFilterModel('');
    setFilterProcessor('');
    setFilterDeviceCondition('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (viewingJobCard) {
    return (
      <JobCardView
        jobCardId={viewingJobCard}
        onClose={() => setViewingJobCard(null)}
        onEdit={(id) => {
          setViewingJobCard(null);
          setEditingJobCard(id);
        }}
      />
    );
  }

  if (editingJobCard) {
    return (
      <JobCardEdit
        jobCardId={editingJobCard}
        onSuccess={(updatedJobCard) => {
          setEditingJobCard(null);
          // Update the specific job card in the list
          setJobCards(prev => prev.map(job => 
            job.id === editingJobCard ? updatedJobCard : job
          ));
        }}
        onCancel={() => setEditingJobCard(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Job Card</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by job card number, customer name, phone, or device type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className={`w-5 h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Advanced Filters</span>
          {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.brandName}</option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Models</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>{model.modelName}</option>
                  ))}
                </select>
              </div>

              {/* Processor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
                <select
                  value={filterProcessor}
                  onChange={(e) => setFilterProcessor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Processors</option>
                  {processors.map(processor => (
                    <option key={processor.id} value={processor.id}>{processor.processorName}</option>
                  ))}
                </select>
              </div>

              {/* Device Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Condition</label>
                <select
                  value={filterDeviceCondition}
                  onChange={(e) => setFilterDeviceCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Conditions</option>
                  {deviceConditions.map(condition => (
                    <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAdvancedFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {(searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Found {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''} 
            {searchTerm && ` for "${searchTerm}"`}
            {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && ' with selected filters'}
          </p>
        </div>
      )}

      {/* One Day Service Summary */}
      {filteredJobCards.some(job => job.oneDayService) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-800 font-medium">
              🚨 {filteredJobCards.filter(job => job.oneDayService).length} One Day Service job card{filteredJobCards.filter(job => job.oneDayService).length !== 1 ? 's' : ''} requiring urgent attention
            </span>
          </div>
        </div>
      )}

      {/* Job Cards Table - UPDATED with new columns */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleJobCards.map(job => (
                <tr 
                  key={job.id} 
                  className={`transition-colors ${
                    job.oneDayService 
                      ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'  // Red highlight for One Day Service
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
                    {job.oneDayService && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                        🚨 ONE DAY
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.deviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.brand?.brandName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.model?.modelName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.processor?.processorName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.deviceCondition?.conditionName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setViewingJobCard(job.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => setEditingJobCard(job.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* See More Button */}
        {filteredJobCards.length > visibleCount && (
          <div className="flex justify-center py-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>See More ({filteredJobCards.length - visibleCount} remaining)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {filteredJobCards.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition ? 'No Job Cards Found' : 'No Job Cards Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition
                ? 'No job cards match your search criteria. Try adjusting your filters.'
                : 'Create your first job card to get started'
              }
            </p>
            {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAdvancedFilters();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Job Card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCards;