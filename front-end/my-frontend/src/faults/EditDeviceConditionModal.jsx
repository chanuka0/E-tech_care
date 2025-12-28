// import { useState, useEffect } from 'react';

// const EditDeviceConditionModal = ({ condition, onUpdate, onClose }) => {
//   const [formData, setFormData] = useState({
//     conditionName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (condition) {
//       setFormData({
//         conditionName: condition.conditionName || '',
//         description: condition.description || '',
//         isActive: condition.isActive !== undefined ? condition.isActive : true
//       });
//     }
//   }, [condition]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.conditionName.trim()) {
//       setError('Condition name is required');
//       return;
//     }

//     if (formData.conditionName.trim().length < 2) {
//       setError('Condition name must be at least 2 characters');
//       return;
//     }

//     onUpdate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Device Condition</h3>
//           <button 
//             onClick={onClose} 
//             className="text-white hover:bg-green-700 p-1 rounded transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Condition ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Condition ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{condition?.id}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Condition Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="conditionName"
//               value={formData.conditionName}
//               onChange={handleChange}
//               placeholder="e.g., Excellent, Good, Fair"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Describe the condition (optional)"
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="isActive"
//               checked={formData.isActive}
//               onChange={handleChange}
//               className="h-4 w-4 text-green-600 border-gray-300 rounded"
//             />
//             <label className="ml-2 text-sm font-medium text-gray-700">
//               Active (Available for use)
//             </label>
//           </div>

//           {!formData.isActive && (
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//               ⚠️ Marking as inactive will prevent it from being used in new job cards
//             </div>
//           )}

//           {/* Created/Updated Info */}
//           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
//             <p>Created: {condition?.createdAt ? new Date(condition.createdAt).toLocaleString() : 'N/A'}</p>
//             <p>Last Updated: {condition?.updatedAt ? new Date(condition.updatedAt).toLocaleString() : 'N/A'}</p>
//           </div>

//           <div className="flex space-x-3 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
//             >
//               Update Condition
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditDeviceConditionModal;


import { useState, useEffect } from 'react';

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
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const checkDuplicateCondition = (conditionName) => {
    const normalizedInput = conditionName.trim().toLowerCase();
    // Check if any OTHER condition has the same name (exclude current condition)
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

    // Check for duplicate BEFORE API call (excluding current condition)
    if (checkDuplicateCondition(trimmedName)) {
      setError(`Cannot update to duplicate device condition. "${trimmedName}" already exists.`);
      return;
    }

    // Pass trimmed data to parent
    onUpdate({
      ...formData,
      conditionName: trimmedName
    });
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

          {/* Condition ID - Read Only */}
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

          {/* Created/Updated Info */}
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

export default EditDeviceConditionModal;