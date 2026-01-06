
// import { useState, useEffect } from 'react';

// const AddFaultModal = ({ onAdd, onClose, existingFaults = [] }) => {
//   const [formData, setFormData] = useState({
//     faultName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [existingFaultNames, setExistingFaultNames] = useState(new Set());

//   useEffect(() => {
//     // Create a Set of existing fault names for quick lookup
//     const names = existingFaults.map(fault => fault.faultName.toLowerCase().trim());
//     setExistingFaultNames(new Set(names));
//   }, [existingFaults]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const newValue = type === 'checkbox' ? checked : value;
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: newValue
//     }));

//     // Clear error when user starts typing in faultName field
//     if (name === 'faultName' && error) {
//       setError('');
//     }
//   };

//   const validateForm = () => {
//     const faultName = formData.faultName.trim();
    
//     if (!faultName) {
//       setError('Fault name is required');
//       return false;
//     }

//     if (faultName.length < 3) {
//       setError('Fault name must be at least 3 characters');
//       return false;
//     }

//     // Check for duplicate on frontend
//     if (existingFaultNames.has(faultName.toLowerCase())) {
//       setError(`Fault with name "${faultName}" already exists`);
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await onAdd(formData);
//       // Reset form on success
//       setFormData({
//         faultName: '',
//         description: '',
//         isActive: true
//       });
//     } catch (err) {
//       // Handle any backend errors (like race conditions)
//       setError(err.message || 'Failed to add fault. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBlur = () => {
//     // Validate fault name on blur
//     const faultName = formData.faultName.trim();
//     if (faultName && faultName.length >= 3) {
//       if (existingFaultNames.has(faultName.toLowerCase())) {
//         setError(`Fault with name "${faultName}" already exists`);
//       }
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Add New Fault</h3>
//           <button 
//             onClick={onClose} 
//             className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
//             disabled={isSubmitting}
//           >
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {error && (
//             <div className={`p-3 border rounded-lg text-sm flex items-start ${
//               error.includes('already exists') 
//                 ? 'bg-red-50 border-red-200 text-red-700' 
//                 : 'bg-red-100 border-red-400 text-red-700'
//             }`}>
//               <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 {error.includes('already exists') ? (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 ) : (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 )}
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Fault Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="faultName"
//               value={formData.faultName}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               placeholder="e.g., Hard Drive Failure"
//               className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                 error && error.includes('already exists') 
//                   ? 'border-red-300 focus:ring-red-500' 
//                   : 'border-gray-300 focus:ring-blue-500'
//               }`}
//               required
//               disabled={isSubmitting}
//               autoFocus
//             />
//             <div className="flex justify-between items-center mt-1">
//               <p className="text-xs text-gray-500">This name must be unique</p>
//               {formData.faultName.trim().length > 0 && (
//                 <p className={`text-xs ${
//                   formData.faultName.trim().length < 3 
//                     ? 'text-red-500' 
//                     : 'text-green-500'
//                 }`}>
//                   {formData.faultName.trim().length}/3 characters
//                 </p>
//               )}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Describe the fault (optional)"
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               disabled={isSubmitting}
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="isActive"
//               checked={formData.isActive}
//               onChange={handleChange}
//               className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//               disabled={isSubmitting}
//             />
//             <label className="ml-2 text-sm font-medium text-gray-700">
//               Active (Available for use immediately)
//             </label>
//           </div>

//           <div className="flex space-x-3 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting || (formData.faultName.trim().length < 3) || existingFaultNames.has(formData.faultName.trim().toLowerCase())}
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {isSubmitting ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                   </svg>
//                   Adding...
//                 </>
//               ) : (
//                 'Add Fault'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddFaultModal;













import { useState, useEffect } from 'react';

const AddFaultModal = ({ onAdd, onClose, existingFaults = [] }) => {
  const [formData, setFormData] = useState({
    faultName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFaultNames, setExistingFaultNames] = useState(new Set());

  useEffect(() => {
    // Create a Set of existing fault names for quick lookup
    const names = existingFaults.map(fault => fault.faultName.toLowerCase().trim());
    setExistingFaultNames(new Set(names));
  }, [existingFaults]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing in faultName field
    if (name === 'faultName' && error) {
      setError('');
    }
  };

  const validateForm = () => {
    const faultName = formData.faultName.trim();
    
    if (!faultName) {
      setError('Fault name is required');
      return false;
    }

    if (faultName.length < 3) {
      setError('Fault name must be at least 3 characters');
      return false;
    }

    // Check for duplicate before API call
    if (existingFaultNames.has(faultName.toLowerCase())) {
      setError(`A fault with the name '${faultName}' already exists. The same fault name cannot be added twice.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd(formData);
      // Reset form on success
      setFormData({
        faultName: '',
        description: '',
        isActive: true
      });
    } catch (err) {
      // Handle any backend errors (including duplicate check)
      setError(err.message || 'Failed to add fault. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Fault</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fault Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="faultName"
              value={formData.faultName}
              onChange={handleChange}
              placeholder="e.g., Hard Drive Failure"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Must be unique within the selected brand</p>
              {formData.faultName.trim().length > 0 && (
                <p className={`text-xs ${
                  formData.faultName.trim().length < 3 
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {formData.faultName.trim().length}/3 characters
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the fault (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use immediately)
            </label>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (formData.faultName.trim().length < 3)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Fault'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFaultModal;