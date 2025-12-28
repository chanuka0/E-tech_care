// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';
// import AddDeviceConditionModal from './AddDeviceConditionModal';
// import EditDeviceConditionModal from './EditDeviceConditionModal';

// const DeviceConditionManagement = () => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth();
//   const [conditions, setConditions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedCondition, setSelectedCondition] = useState(null);

//   const fetchConditions = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/device-conditions');
//       setConditions(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch device conditions');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchConditions();
//   }, []);

//   const handleAddCondition = async (newCondition) => {
//     try {
//       const response = await apiCall('/api/device-conditions', {
//         method: 'POST',
//         body: JSON.stringify(newCondition)
//       });
//       setConditions([...conditions, response]);
//       setShowAddModal(false);
//       showSuccessMessage('Device condition added successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to add device condition');
//     }
//   };

//   const handleUpdateCondition = async (updatedCondition) => {
//     try {
//       const response = await apiCall(`/api/device-conditions/${selectedCondition.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updatedCondition)
//       });
//       setConditions(conditions.map(condition => condition.id === selectedCondition.id ? response : condition));
//       setShowEditModal(false);
//       setSelectedCondition(null);
//       showSuccessMessage('Device condition updated successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to update device condition');
//     }
//   };

//   const handleDeleteCondition = async (id) => {
//     if (window.confirm('Are you sure you want to delete this device condition?')) {
//       try {
//         await apiCall(`/api/device-conditions/${id}`, {
//           method: 'DELETE'
//         });
//         setConditions(conditions.filter(condition => condition.id !== id));
//         showSuccessMessage('Device condition deleted successfully!');
//       } catch (err) {
//         setError(err.message || 'Failed to delete device condition');
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

//   const filteredConditions = conditions.filter(condition => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       condition.conditionName.toLowerCase().includes(searchLower) ||
//       condition.id.toString().includes(searchLower)
//     );
//   });

//   if (!isAdmin()) {
//     return (
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           <p className="font-medium">Access Denied</p>
//           <p className="text-sm mt-1">You do not have permission to access Device Condition Management. Only administrators can manage device conditions.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Device Condition Management</h2>
//           <p className="text-gray-600 mt-1">Manage device conditions for job cards</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Add Condition</span>
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
//             placeholder="Search by condition name or ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Conditions Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredConditions.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No Conditions Found</h3>
//               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first condition to get started'}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredConditions.map(condition => (
//                   <tr key={condition.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">#{condition.id}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">{condition.conditionName}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {condition.description || 'No description provided'}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         condition.isActive 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {condition.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {new Date(condition.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedCondition(condition);
//                           setShowEditModal(true);
//                         }}
//                         className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteCondition(condition.id)}
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
//               <p className="text-sm text-gray-600">Total Conditions</p>
//               <p className="text-3xl font-bold text-gray-900">{conditions.length}</p>
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
//               <p className="text-sm text-gray-600">Active Conditions</p>
//               <p className="text-3xl font-bold text-green-600">{conditions.filter(c => c.isActive).length}</p>
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
//               <p className="text-sm text-gray-600">Inactive Conditions</p>
//               <p className="text-3xl font-bold text-red-600">{conditions.filter(c => !c.isActive).length}</p>
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
//         <AddDeviceConditionModal
//           onAdd={handleAddCondition}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedCondition && (
//         <EditDeviceConditionModal
//           condition={selectedCondition}
//           onUpdate={handleUpdateCondition}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedCondition(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default DeviceConditionManagement;




import { useState, useEffect } from 'react';

// Mock hooks for demonstration
const useApi = () => ({
  apiCall: async (endpoint, options) => {
    console.log('API Call:', endpoint, options);
    // Simulate API responses
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint === '/api/device-conditions' && !options?.method) {
      return [
        { id: 1, conditionName: 'Excellent', description: 'Like new condition', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, conditionName: 'Good', description: 'Minor wear', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, conditionName: 'Fair', description: 'Visible wear', isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
    }
    
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body);
      return { id: Date.now(), ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    
    if (options?.method === 'PUT') {
      const body = JSON.parse(options.body);
      return { id: parseInt(endpoint.split('/').pop()), ...body, updatedAt: new Date().toISOString() };
    }
    
    return {};
  }
});

const useAuth = () => ({
  isAdmin: () => true
});

// Add Device Condition Modal Component
const AddDeviceConditionModal = ({ onAdd, onClose, existingConditions }) => {
  const [formData, setFormData] = useState({
    conditionName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const checkDuplicateCondition = (conditionName) => {
    const normalizedInput = conditionName.trim().toLowerCase();
    return existingConditions.some(
      condition => condition.conditionName.toLowerCase() === normalizedInput
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.conditionName.trim();

    if (!trimmedName) {
      setError('Condition name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Condition name must be at least 2 characters');
      return;
    }

    // Check for duplicate before API call
    if (checkDuplicateCondition(trimmedName)) {
      setError(`Cannot add duplicate device condition. "${trimmedName}" already exists.`);
      return;
    }

    onAdd({ ...formData, conditionName: trimmedName });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Device Condition</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="conditionName"
              value={formData.conditionName}
              onChange={handleChange}
              placeholder="e.g., Excellent, Good, Fair, Poor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">This name must be unique</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the condition (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use immediately)
            </label>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
            >
              Add Condition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Device Condition Modal Component
const EditDeviceConditionModal = ({ condition, onUpdate, onClose, existingConditions }) => {
  const [formData, setFormData] = useState({
    conditionName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (condition) {
      setFormData({
        conditionName: condition.conditionName || '',
        description: condition.description || '',
        isActive: condition.isActive !== undefined ? condition.isActive : true
      });
    }
  }, [condition]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const checkDuplicateCondition = (conditionName) => {
    const normalizedInput = conditionName.trim().toLowerCase();
    return existingConditions.some(
      c => c.id !== condition.id && c.conditionName.toLowerCase() === normalizedInput
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.conditionName.trim();

    if (!trimmedName) {
      setError('Condition name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Condition name must be at least 2 characters');
      return;
    }

    // Check for duplicate (excluding current condition)
    if (checkDuplicateCondition(trimmedName)) {
      setError(`Cannot update to duplicate device condition. "${trimmedName}" already exists.`);
      return;
    }

    onUpdate({ ...formData, conditionName: trimmedName });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Device Condition</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-green-700 p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{condition?.id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="conditionName"
              value={formData.conditionName}
              onChange={handleChange}
              placeholder="e.g., Excellent, Good, Fair"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the condition (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will prevent it from being used in new job cards
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p>Created: {condition?.createdAt ? new Date(condition.createdAt).toLocaleString() : 'N/A'}</p>
            <p>Last Updated: {condition?.updatedAt ? new Date(condition.updatedAt).toLocaleString() : 'N/A'}</p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
            >
              Update Condition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const DeviceConditionManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState(null);

  const fetchConditions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/device-conditions');
      setConditions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch device conditions');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const handleAddCondition = async (newCondition) => {
    try {
      const response = await apiCall('/api/device-conditions', {
        method: 'POST',
        body: JSON.stringify(newCondition)
      });
      setConditions([...conditions, response]);
      setShowAddModal(false);
      showSuccessMessage('Device condition added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add device condition');
    }
  };

  const handleUpdateCondition = async (updatedCondition) => {
    try {
      const response = await apiCall(`/api/device-conditions/${selectedCondition.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCondition)
      });
      setConditions(conditions.map(condition => 
        condition.id === selectedCondition.id ? response : condition
      ));
      setShowEditModal(false);
      setSelectedCondition(null);
      showSuccessMessage('Device condition updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update device condition');
    }
  };

  const initiateDelete = (condition) => {
    setConditionToDelete(condition);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCondition = async () => {
    if (!conditionToDelete) return;

    try {
      await apiCall(`/api/device-conditions/${conditionToDelete.id}`, {
        method: 'DELETE'
      });
      setConditions(conditions.filter(condition => condition.id !== conditionToDelete.id));
      showSuccessMessage('Device condition permanently deleted!');
      setShowDeleteConfirm(false);
      setConditionToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete device condition');
      setShowDeleteConfirm(false);
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const filteredConditions = conditions.filter(condition => {
    const searchLower = searchTerm.toLowerCase();
    return (
      condition.conditionName.toLowerCase().includes(searchLower) ||
      condition.id.toString().includes(searchLower)
    );
  });

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Device Condition Management. Only administrators can manage device conditions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Device Condition Management</h2>
          <p className="text-gray-600 mt-1">Manage device conditions for job cards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Condition</span>
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

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by condition name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conditions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConditions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Conditions Found</h3>
              <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first condition to get started'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConditions.map(condition => (
                  <tr key={condition.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{condition.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{condition.conditionName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {condition.description || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        condition.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {condition.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(condition.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCondition(condition);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => initiateDelete(condition)}
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
              <p className="text-sm text-gray-600">Total Conditions</p>
              <p className="text-3xl font-bold text-gray-900">{conditions.length}</p>
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
              <p className="text-sm text-gray-600">Active Conditions</p>
              <p className="text-3xl font-bold text-green-600">{conditions.filter(c => c.isActive).length}</p>
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
              <p className="text-sm text-gray-600">Inactive Conditions</p>
              <p className="text-3xl font-bold text-red-600">{conditions.filter(c => !c.isActive).length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDeviceConditionModal
          onAdd={handleAddCondition}
          onClose={() => setShowAddModal(false)}
          existingConditions={conditions}
        />
      )}

      {showEditModal && selectedCondition && (
        <EditDeviceConditionModal
          condition={selectedCondition}
          onUpdate={handleUpdateCondition}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCondition(null);
          }}
          existingConditions={conditions}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && conditionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-600 text-white p-6">
              <h3 className="text-xl font-bold">Confirm Permanent Deletion</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    Are you sure you want to permanently delete this device condition?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Condition: <span className="text-gray-900">{conditionToDelete.conditionName}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">ID: #{conditionToDelete.id}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">⚠️ Warning: This action cannot be undone!</p>
                    <p className="text-sm text-red-700 mt-1">
                      This device condition will be permanently removed from the database. Any job cards referencing this condition may be affected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConditionToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCondition}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConditionManagement;