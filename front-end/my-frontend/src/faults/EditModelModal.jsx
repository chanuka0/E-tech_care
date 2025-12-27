

// import { useState, useEffect } from 'react';

// const EditModelModal = ({ model, onUpdate, onClose, brands }) => {
//   const [formData, setFormData] = useState({
//     brand: { id: '' },
//     modelName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');

//   // Initialize form data
//   useEffect(() => {
//     if (model) {
//       setFormData({
//         brand: { id: model.brand?.id || '' },
//         modelName: model.modelName || '',
//         description: model.description || '',
//         isActive: model.isActive !== undefined ? model.isActive : true
//       });
//     }
//   }, [model]);

//   const handleBrandChange = (brandId) => {
//     setFormData(prev => ({
//       ...prev,
//       brand: { id: brandId }
//     }));
//   };

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

//     if (!formData.brand.id) {
//       setError('Please select a brand');
//       return;
//     }

//     if (!formData.modelName.trim()) {
//       setError('Model name is required');
//       return;
//     }

//     if (formData.modelName.trim().length < 2) {
//       setError('Model name must be at least 2 characters');
//       return;
//     }

//     onUpdate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Model</h3>
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

//           {/* Model ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Model ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{model?.id}
//             </div>
//           </div>

//           {/* Current Brand Info */}
//           {model?.brand && (
//             <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//               <p className="text-sm font-medium text-blue-800 mb-1">Current Brand:</p>
//               <p className="text-sm text-blue-700">
//                 {model.brand.brandName}
//               </p>
//             </div>
//           )}

//           {/* Brand Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Brand <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={formData.brand.id}
//               onChange={(e) => handleBrandChange(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             >
//               <option value="">-- Select a brand --</option>
//               {brands.map(brand => (
//                 <option key={brand.id} value={brand.id}>
//                   {brand.brandName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Model Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Model Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="modelName"
//               value={formData.modelName}
//               onChange={handleChange}
//               placeholder="e.g., Pavilion 15, ThinkPad X1"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Describe the model (optional)"
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           {/* Active Status */}
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
//             <p>Created: {model?.createdAt ? new Date(model.createdAt).toLocaleString() : 'N/A'}</p>
//             <p>Last Updated: {model?.updatedAt ? new Date(model.updatedAt).toLocaleString() : 'N/A'}</p>
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
//               Update Model
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditModelModal;





import { useState, useEffect } from 'react';

const EditModelModal = ({ model, onUpdate, onClose, brands }) => {
  const [formData, setFormData] = useState({
    brand: { id: '' },
    modelName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (model) {
      setFormData({
        brand: { id: model.brand?.id || '' },
        modelName: model.modelName || '',
        description: model.description || '',
        isActive: model.isActive !== undefined ? model.isActive : true
      });
    }
  }, [model]);

  const handleBrandChange = (brandId) => {
    setFormData(prev => ({
      ...prev,
      brand: { id: brandId }
    }));
    setError(''); // Clear error when brand changes
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Client-side validation
    if (!formData.brand.id) {
      setError('Please select a brand');
      setIsSubmitting(false);
      return;
    }

    if (!formData.modelName.trim()) {
      setError('Model name is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.modelName.trim().length < 2) {
      setError('Model name must be at least 2 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      await onUpdate(formData);
      // Success - modal will close from parent component
      setIsSubmitting(false);
    } catch (err) {
      console.error('Submit error caught in modal:', err);
      console.error('Error message:', err.message);
      // Display the error from backend
      setError(err.message || 'Failed to update model');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Model</h3>
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
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Model ID - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{model?.id}
            </div>
          </div>

          {/* Current Brand Info */}
          {model?.brand && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-1">Current Brand:</p>
              <p className="text-sm text-blue-700">
                {model.brand.brandName}
              </p>
            </div>
          )}

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.brand.id}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Select a brand --</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              placeholder="e.g., Pavilion 15, ThinkPad X1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be unique within the selected brand
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the model (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Active Status */}
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
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will prevent it from being used in new job cards
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p>Created: {model?.createdAt ? new Date(model.createdAt).toLocaleString() : 'N/A'}</p>
            <p>Last Updated: {model?.updatedAt ? new Date(model.updatedAt).toLocaleString() : 'N/A'}</p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModelModal;