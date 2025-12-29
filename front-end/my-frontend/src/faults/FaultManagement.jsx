




// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';
// import AddFaultModal from './AddFaultModal';
// import EditFaultModal from './EditFaultModal';

// const FaultManagement = () => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth();
//   const [faults, setFaults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedFault, setSelectedFault] = useState(null);

//   const fetchFaults = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/faults/all');
//       setFaults(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch faults');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchFaults();
//   }, []);

//   const handleAddFault = async (newFault) => {
//     try {
//       const response = await apiCall('/api/faults', {
//         method: 'POST',
//         body: JSON.stringify(newFault)
//       });
//       setFaults([...faults, response]);
//       setShowAddModal(false);
//       setSuccessMessage('Fault added successfully!');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       // Handle duplicate fault error
//       if (err.message?.includes('already exists')) {
//         throw new Error(err.message);
//       } else {
//         setError(err.message || 'Failed to add fault');
//       }
//     }
//   };

//   const handleUpdateFault = async (updatedFault) => {
//     try {
//       const response = await apiCall(`/api/faults/${selectedFault.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updatedFault)
//       });
//       setFaults(faults.map(fault => fault.id === selectedFault.id ? response : fault));
//       setShowEditModal(false);
//       setSelectedFault(null);
//       setSuccessMessage('Fault updated successfully!');
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       // Handle duplicate fault error
//       if (err.message?.includes('already exists')) {
//         throw new Error(err.message);
//       } else {
//         setError(err.message || 'Failed to update fault');
//       }
//     }
//   };

//   const handleDeleteFault = async (id) => {
//     if (window.confirm('Are you sure you want to delete this fault?')) {
//       try {
//         await apiCall(`/api/faults/${id}`, {
//           method: 'DELETE'
//         });
//         setFaults(faults.filter(fault => fault.id !== id));
//         setSuccessMessage('Fault deleted successfully!');
//         setTimeout(() => setSuccessMessage(''), 3000);
//       } catch (err) {
//         setError(err.message || 'Failed to delete fault');
//       }
//     }
//   };

//   // Filter faults by name or id
//   const filteredFaults = faults.filter(fault => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       fault.faultName.toLowerCase().includes(searchLower) ||
//       fault.id.toString().includes(searchLower) ||
//       fault.description?.toLowerCase().includes(searchLower)
//     );
//   });

//   if (!isAdmin()) {
//     return (
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           <p className="font-medium">Access Denied</p>
//           <p className="text-sm mt-1">You do not have permission to access Fault Management. Only administrators can manage faults.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Success Message */}
//       {successMessage && (
//         <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
//           <div className="flex items-center space-x-2">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span>{successMessage}</span>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Fault Management</h2>
//           <p className="text-gray-600 mt-1">Manage system faults for job cards</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Add Fault</span>
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
//             placeholder="Search by fault name, ID, or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Faults Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredFaults.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No Faults Found</h3>
//               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first fault to get started'}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fault Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredFaults.map(fault => (
//                   <tr key={fault.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">#{fault.id}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">{fault.faultName}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {fault.description || <span className="text-gray-400 italic">No description</span>}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         fault.isActive 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {fault.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {new Date(fault.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedFault(fault);
//                           setShowEditModal(true);
//                         }}
//                         className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-3 py-1 hover:bg-blue-50 rounded"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteFault(fault.id)}
//                         className="text-red-600 hover:text-red-900 font-medium transition-colors px-3 py-1 hover:bg-red-50 rounded"
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
//               <p className="text-sm text-gray-600">Total Faults</p>
//               <p className="text-3xl font-bold text-gray-900">{faults.length}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Active Faults</p>
//               <p className="text-3xl font-bold text-green-600">{faults.filter(f => f.isActive).length}</p>
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
//               <p className="text-sm text-gray-600">Inactive Faults</p>
//               <p className="text-3xl font-bold text-red-600">{faults.filter(f => !f.isActive).length}</p>
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
//         <AddFaultModal
//           onAdd={handleAddFault}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedFault && (
//         <EditFaultModal
//           fault={selectedFault}
//           onUpdate={handleUpdateFault}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedFault(null);
//           }}
//         />
//       )}
      
//       {/* Add custom animation for success message */}
//       <style jsx>{`
//         @keyframes slide-in {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default FaultManagement;




import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddFaultModal from './AddFaultModal';
import EditFaultModal from './EditFaultModal';

const FaultManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);

  const fetchFaults = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/faults/all');
      setFaults(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faults');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaults();
  }, []);

  const handleAddFault = async (newFault) => {
    try {
      const response = await apiCall('/api/faults', {
        method: 'POST',
        body: JSON.stringify(newFault)
      });
      setFaults([...faults, response]);
      setShowAddModal(false);
      setSuccessMessage('Fault added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Handle duplicate fault error (backend validation)
      if (err.message?.includes('already exists')) {
        throw new Error(err.message);
      } else {
        setError(err.message || 'Failed to add fault');
      }
    }
  };

  const handleUpdateFault = async (updatedFault) => {
    try {
      const response = await apiCall(`/api/faults/${selectedFault.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFault)
      });
      setFaults(faults.map(fault => fault.id === selectedFault.id ? response : fault));
      setShowEditModal(false);
      setSelectedFault(null);
      setSuccessMessage('Fault updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Handle duplicate fault error (backend validation)
      if (err.message?.includes('already exists')) {
        throw new Error(err.message);
      } else {
        setError(err.message || 'Failed to update fault');
      }
    }
  };

  const handleDeleteFault = async (id) => {
    if (window.confirm('Are you sure you want to delete this fault?\n\nNote: This will mark the fault as inactive instead of permanent deletion.')) {
      try {
        await apiCall(`/api/faults/${id}`, {
          method: 'DELETE'
        });
        // Update the local state to reflect the fault is now inactive
        setFaults(faults.map(fault => 
          fault.id === id ? { ...fault, isActive: false } : fault
        ));
        setSuccessMessage('Fault marked as inactive successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete fault');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? 'Are you sure you want to activate this fault?'
      : 'Are you sure you want to deactivate this fault?\n\nNote: Deactivating will prevent it from being used in new job cards.';
    
    if (window.confirm(confirmMessage)) {
      try {
        const faultToUpdate = faults.find(f => f.id === id);
        const updatedFault = {
          ...faultToUpdate,
          isActive: newStatus
        };
        
        const response = await apiCall(`/api/faults/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedFault)
        });
        
        setFaults(faults.map(fault => fault.id === id ? response : fault));
        setSuccessMessage(`Fault ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} fault`);
      }
    }
  };

  // Filter faults by name, id, or description
  const filteredFaults = faults.filter(fault => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fault.faultName.toLowerCase().includes(searchLower) ||
      fault.id.toString().includes(searchLower) ||
      fault.description?.toLowerCase().includes(searchLower)
    );
  });

  // Sort faults: active first, then by name
  const sortedFaults = [...filteredFaults].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return a.faultName.localeCompare(b.faultName);
    }
    return b.isActive - a.isActive;
  });

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Fault Management. Only administrators can manage faults.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fault Management</h2>
          <p className="text-gray-600 mt-1">Manage system faults for job cards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Fault</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError('')} 
            className="text-red-700 hover:text-red-900 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by fault name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Showing {sortedFaults.length} of {faults.length} faults
              </span>
            </div>
            <button
              onClick={fetchFaults}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faults Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading faults...</p>
            </div>
          </div>
        ) : sortedFaults.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Faults Found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Create your first fault to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Add First Fault
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fault Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedFaults.map(fault => (
                  <tr 
                    key={fault.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      !fault.isActive ? 'bg-gray-50 opacity-80' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{fault.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{fault.faultName}</span>
                        {!fault.isActive && (
                          <span className="ml-2 text-xs text-gray-500 italic">(inactive)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {fault.description || (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(fault.id, fault.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          fault.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={fault.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {fault.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(fault.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(fault.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedFault(fault);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-3 py-1 hover:bg-blue-50 rounded flex items-center space-x-1"
                          title="Edit fault"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleToggleActive(fault.id, fault.isActive)}
                          className={`font-medium transition-colors px-3 py-1 rounded flex items-center space-x-1 ${
                            fault.isActive
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={fault.isActive ? 'Deactivate fault' : 'Activate fault'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {fault.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                          <span>{fault.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteFault(fault.id)}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors px-3 py-1 hover:bg-red-50 rounded flex items-center space-x-1"
                          title="Delete fault (mark as inactive)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
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
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Faults</p>
              <p className="text-3xl font-bold text-gray-900">{faults.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Faults</p>
              <p className="text-3xl font-bold text-green-600">
                {faults.filter(f => f.isActive).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Available for new job cards
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Faults</p>
              <p className="text-3xl font-bold text-amber-600">
                {faults.filter(f => !f.isActive).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Not available for new job cards
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddFaultModal
          onAdd={handleAddFault}
          onClose={() => setShowAddModal(false)}
          existingFaults={faults}
        />
      )}

      {showEditModal && selectedFault && (
        <EditFaultModal
          fault={selectedFault}
          onUpdate={handleUpdateFault}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFault(null);
          }}
          existingFaults={faults}
        />
      )}
      
      {/* Add custom animation for success message */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FaultManagement;