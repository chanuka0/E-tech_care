// import { useState } from 'react';

// const AddDeviceConditionModal = ({ onAdd, onClose }) => {
//   const [formData, setFormData] = useState({
//     conditionName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');

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

//     onAdd(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Add New Device Condition</h3>
//           <button 
//             onClick={onClose} 
//             className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
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

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Condition Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="conditionName"
//               value={formData.conditionName}
//               onChange={handleChange}
//               placeholder="e.g., Excellent, Good, Fair, Poor"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">This name must be unique</p>
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="isActive"
//               checked={formData.isActive}
//               onChange={handleChange}
//               className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//             />
//             <label className="ml-2 text-sm font-medium text-gray-700">
//               Active (Available for use immediately)
//             </label>
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
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
//             >
//               Add Condition
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddDeviceConditionModal;






import { useState } from 'react';

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
    // Clear error when user types
    if (error) {
      setError('');
    }
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

    // Check for duplicate BEFORE API call
    if (checkDuplicateCondition(trimmedName)) {
      setError(`Cannot add duplicate device condition. "${trimmedName}" already exists.`);
      return;
    }

    // Pass trimmed data to parent
    onAdd({
      ...formData,
      conditionName: trimmedName
    });
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

export default AddDeviceConditionModal;