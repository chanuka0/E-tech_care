// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';
// import AddProcessorModal from './AddProcessorModal';
// import EditProcessorModal from './EditProcessorModal';

// const ProcessorManagement = () => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth();
//   const [processors, setProcessors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedProcessor, setSelectedProcessor] = useState(null);

//   const fetchProcessors = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/processors');
//       setProcessors(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch processors');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchProcessors();
//   }, []);

//   const handleAddProcessor = async (newProcessor) => {
//     try {
//       const response = await apiCall('/api/processors', {
//         method: 'POST',
//         body: JSON.stringify(newProcessor)
//       });
//       setProcessors([...processors, response]);
//       setShowAddModal(false);
//       showSuccessMessage('Processor added successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to add processor');
//     }
//   };

//   const handleUpdateProcessor = async (updatedProcessor) => {
//     try {
//       const response = await apiCall(`/api/processors/${selectedProcessor.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updatedProcessor)
//       });
//       setProcessors(processors.map(processor => processor.id === selectedProcessor.id ? response : processor));
//       setShowEditModal(false);
//       setSelectedProcessor(null);
//       showSuccessMessage('Processor updated successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to update processor');
//     }
//   };

//   const handleDeleteProcessor = async (id) => {
//     if (window.confirm('Are you sure you want to delete this processor?')) {
//       try {
//         await apiCall(`/api/processors/${id}`, {
//           method: 'DELETE'
//         });
//         setProcessors(processors.filter(processor => processor.id !== id));
//         showSuccessMessage('Processor deleted successfully!');
//       } catch (err) {
//         setError(err.message || 'Failed to delete processor');
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

//   const filteredProcessors = processors.filter(processor => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       processor.processorName.toLowerCase().includes(searchLower) ||
//       processor.id.toString().includes(searchLower)
//     );
//   });

//   if (!isAdmin()) {
//     return (
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           <p className="font-medium">Access Denied</p>
//           <p className="text-sm mt-1">You do not have permission to access Processor Management. Only administrators can manage processors.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Processor Management</h2>
//           <p className="text-gray-600 mt-1">Manage device processors for job cards</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Add Processor</span>
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

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search by processor name or ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Processors Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredProcessors.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No Processors Found</h3>
//               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first processor to get started'}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processor Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredProcessors.map(processor => (
//                   <tr key={processor.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">#{processor.id}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">{processor.processorName}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {processor.description || 'No description provided'}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         processor.isActive 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {processor.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {new Date(processor.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedProcessor(processor);
//                           setShowEditModal(true);
//                         }}
//                         className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteProcessor(processor.id)}
//                         className="text-red-600 hover:text-red-900 font-medium transition-colors"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Processors</p>
//               <p className="text-3xl font-bold text-gray-900">{processors.length}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Active Processors</p>
//               <p className="text-3xl font-bold text-green-600">{processors.filter(p => p.isActive).length}</p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Inactive Processors</p>
//               <p className="text-3xl font-bold text-red-600">{processors.filter(p => !p.isActive).length}</p>
//             </div>
//             <div className="bg-red-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showAddModal && (
//         <AddProcessorModal
//           onAdd={handleAddProcessor}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedProcessor && (
//         <EditProcessorModal
//           processor={selectedProcessor}
//           onUpdate={handleUpdateProcessor}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedProcessor(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ProcessorManagement;





import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddProcessorModal from './AddProcessorModal';
import EditProcessorModal from './EditProcessorModal';

const ProcessorManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [processors, setProcessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processorToDelete, setProcessorToDelete] = useState(null);

  const fetchProcessors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/processors');
      console.log('Fetched processors:', data);
      setProcessors(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch processors');
      console.error('Error fetching processors:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProcessors();
  }, []);

  const handleAddProcessor = async (newProcessor) => {
    try {
      const response = await apiCall('/api/processors', {
        method: 'POST',
        body: JSON.stringify(newProcessor)
      });
      setProcessors([...processors, response]);
      setShowAddModal(false);
      showSuccessMessage('Processor added successfully!');
    } catch (err) {
      throw new Error(err.message || 'Failed to add processor');
    }
  };

  const handleUpdateProcessor = async (updatedProcessor) => {
    try {
      const response = await apiCall(`/api/processors/${selectedProcessor.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProcessor)
      });
      setProcessors(processors.map(processor => processor.id === selectedProcessor.id ? response : processor));
      setShowEditModal(false);
      setSelectedProcessor(null);
      showSuccessMessage('Processor updated successfully!');
    } catch (err) {
      throw new Error(err.message || 'Failed to update processor');
    }
  };

  const confirmDelete = (processor) => {
    setProcessorToDelete(processor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProcessor = async () => {
    if (!processorToDelete) return;

    try {
      await apiCall(`/api/processors/${processorToDelete.id}`, {
        method: 'DELETE'
      });
      setProcessors(processors.filter(processor => processor.id !== processorToDelete.id));
      setShowDeleteConfirm(false);
      setProcessorToDelete(null);
      showSuccessMessage('Processor deleted permanently!');
    } catch (err) {
      setError(err.message || 'Failed to delete processor');
      setShowDeleteConfirm(false);
      setProcessorToDelete(null);
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    msg.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const filteredProcessors = processors.filter(processor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      processor.processorName.toLowerCase().includes(searchLower) ||
      processor.id.toString().includes(searchLower) ||
      (processor.description && processor.description.toLowerCase().includes(searchLower))
    );
  });

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Processor Management. Only administrators can manage processors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Processor Management</h2>
          <p className="text-gray-600 mt-1">Manage device processors for job cards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Processor</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by processor name, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Processors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProcessors.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Processors Found</h3>
              <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first processor to get started'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProcessors.map(processor => (
                  <tr key={processor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{processor.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{processor.processorName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {processor.description || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        processor.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {processor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {processor.createdAt ? new Date(processor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProcessor(processor);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(processor)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Processors</p>
              <p className="text-3xl font-bold text-gray-900">{processors.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Processors</p>
              <p className="text-3xl font-bold text-green-600">{processors.filter(p => p.isActive).length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Processors</p>
              <p className="text-3xl font-bold text-red-600">{processors.filter(p => !p.isActive).length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && processorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-600 text-white p-6">
              <h3 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm Permanent Deletion
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone!</p>
                <p className="text-red-700 text-sm mt-2">
                  This will permanently delete the processor from the database.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                <p className="font-bold text-gray-900">#{processorToDelete.id} - {processorToDelete.processorName}</p>
                {processorToDelete.description && (
                  <p className="text-sm text-gray-600 mt-1">{processorToDelete.description}</p>
                )}
              </div>

              <p className="text-sm text-gray-700">
                Are you absolutely sure you want to permanently delete this processor?
              </p>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProcessorToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProcessor}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProcessorModal
          onAdd={handleAddProcessor}
          onClose={() => setShowAddModal(false)}
          existingProcessors={processors}
        />
      )}

      {showEditModal && selectedProcessor && (
        <EditProcessorModal
          processor={selectedProcessor}
          onUpdate={handleUpdateProcessor}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProcessor(null);
          }}
          existingProcessors={processors}
        />
      )}
    </div>
  );
};

export default ProcessorManagement;