// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import JobCardEdit from './JobCardEdit';
// import JobCardView from './JobCardView';  // ← ADD THIS


// const JobCards = ({ onCreateNew }) => {
//   const { apiCall } = useApi();
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [editingJobCard, setEditingJobCard] = useState(null);
//   const [viewingJobCard, setViewingJobCard] = useState(null);  // ← ADD THIS


//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       setJobCards(data);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchJobCards();
//   }, []);

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800',
//       COMPLETED: 'bg-green-100 text-green-800',
//       DELIVERED: 'bg-purple-100 text-purple-800',
//       CANCELLED: 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const filteredJobCards = filterStatus === 'ALL' 
//     ? jobCards 
//     : jobCards.filter(job => job.status === filterStatus);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }
//     if (viewingJobCard) {
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
//         onSuccess={() => {
//           setEditingJobCard(null);
//           fetchJobCards();
//         }}
//         onCancel={() => setEditingJobCard(null)}
//       />
//     );
//   }
//   // if (editingJobCard) {
//   //   return (
//   //     <JobCardEdit
//   //       jobCardId={editingJobCard}
//   //       onSuccess={() => {
//   //         setEditingJobCard(null);
//   //         fetchJobCards();
//   //       }}
//   //       onCancel={() => setEditingJobCard(null)}
//   //     />
//   //   );
//   // }
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

//       {/* Job Cards Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredJobCards.map(job => (
//           <div key={job.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
//             <div className="flex justify-between items-start mb-4">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">{job.jobNumber}</h3>
//                 <p className="text-sm text-gray-500">{job.customerName}</p>
//               </div>
//               <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
//                 {job.status}
//               </span>
//             </div>

//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Device:</span>
//                 <span className="font-medium text-gray-900">{job.deviceType}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Phone:</span>
//                 <span className="font-medium text-gray-900">{job.customerPhone}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Estimated Cost:</span>
//                 <span className="font-medium text-green-600">${job.estimatedCost?.toFixed(2) || '0.00'}</span>
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 line-clamp-2">{job.faultDescription}</p>
//             </div>

//                 <div className="mt-4 flex space-x-2">
//                 <button 
//                   onClick={() => setViewingJobCard(job.id)}  // ← CHANGE THIS
//                   className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition-colors"
//                 >
//                   View
//                 </button>
//                 <button 
//                   onClick={() => setEditingJobCard(job.id)}
//                   className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2 rounded-lg transition-colors"
//                 >
//                   Edit
//                 </button>
//               </div>
//               {/* <div className="mt-4 flex space-x-2">
//                 <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition-colors">
//                   View
//                 </button>
//                 <button 
//                   onClick={() => setEditingJobCard(job.id)}  // ← ADD THIS LINE
//                   className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2 rounded-lg transition-colors">
//                   Edit
//                 </button>
//               </div> */}
//           </div>
//         ))}
//       </div>

//       {filteredJobCards.length === 0 && !loading && (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           <h3 className="text-xl font-medium text-gray-900 mb-2">No Job Cards Found</h3>
//           <p className="text-gray-500 mb-4">Create your first job card to get started</p>
//           <button
//             onClick={onCreateNew}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//           >
//             Create Job Card
//           </button>
//         </div>
//       )}
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

//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       setJobCards(data);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchJobCards();
//   }, []);

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
//     // Status filter
//     const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
    
//     // Search filter - check job number and barcode
//     const searchMatch = searchTerm === '' || 
//       job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     return statusMatch && searchMatch;
//   });

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
//         onSuccess={() => {
//           setEditingJobCard(null);
//           fetchJobCards();
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
//               {filteredJobCards.map(job => (
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

  useEffect(() => {
    fetchJobCards();
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

  // Filter job cards by status AND search term
  const filteredJobCards = jobCards.filter(job => {
    const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Get only the visible job cards (first N items)
  const visibleJobCards = filteredJobCards.slice(0, visibleCount);

  // Function to load more job cards
  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
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
            placeholder="Search by job card number or barcode..."
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
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Found {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''} 
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Job Cards Table */}
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
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
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
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.deviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.barcode || '-'}</div>
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
              {searchTerm ? 'No Job Cards Found' : 'No Job Cards Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No job cards found for "${searchTerm}". Try a different search term.`
                : 'Create your first job card to get started'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Clear Search
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