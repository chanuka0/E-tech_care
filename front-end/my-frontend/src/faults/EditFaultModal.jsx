// import { useState, useEffect } from 'react';

// const EditFaultModal = ({ fault, onUpdate, onClose }) => {
//   const [formData, setFormData] = useState({
//     faultName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (fault) {
//       setFormData({
//         faultName: fault.faultName || '',
//         description: fault.description || '',
//         isActive: fault.isActive !== undefined ? fault.isActive : true
//       });
//     }
//   }, [fault]);

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

//     if (!formData.faultName.trim()) {
//       setError('Fault name is required');
//       return;
//     }

//     if (formData.faultName.trim().length < 3) {
//       setError('Fault name must be at least 3 characters');
//       return;
//     }

//     onUpdate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Fault</h3>
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

//           {/* Fault ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Fault ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{fault?.id}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Fault Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="faultName"
//               value={formData.faultName}
//               onChange={handleChange}
//               placeholder="e.g., Hard Drive Failure"
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
//               placeholder="Describe the fault (optional)"
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
//             <p>Created: {fault?.createdAt ? new Date(fault.createdAt).toLocaleString() : 'N/A'}</p>
//             <p>Last Updated: {fault?.updatedAt ? new Date(fault.updatedAt).toLocaleString() : 'N/A'}</p>
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
//               Update Fault
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditFaultModal;








import { useState, useEffect } from 'react';

const EditFaultModal = ({ fault, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    faultName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fault) {
      setFormData({
        faultName: fault.faultName || '',
        description: fault.description || '',
        isActive: fault.isActive !== undefined ? fault.isActive : true
      });
    }
  }, [fault]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.faultName.trim()) {
      setError('Fault name is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.faultName.trim().length < 3) {
      setError('Fault name must be at least 3 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      await onUpdate(formData);
    } catch (err) {
      setError(err.message || 'Failed to update fault. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Fault</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-green-700 p-1 rounded transition-colors"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Fault ID - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fault ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{fault?.id}
            </div>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isSubmitting}
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
              placeholder="Describe the fault (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Marking as inactive will prevent it from being used in new job cards</span>
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p className="flex justify-between">
              <span>Created:</span> 
              <span className="font-medium">{fault?.createdAt ? new Date(fault.createdAt).toLocaleString() : 'N/A'}</span>
            </p>
            <p className="flex justify-between">
              <span>Last Updated:</span> 
              <span className="font-medium">{fault?.updatedAt ? new Date(fault.updatedAt).toLocaleString() : 'N/A'}</span>
            </p>
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Fault'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFaultModal;