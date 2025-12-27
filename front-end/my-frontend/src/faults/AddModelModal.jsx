


// import { useState } from 'react';

// const AddModelModal = ({ onAdd, onClose, brands }) => {
//   const [formData, setFormData] = useState({
//     brand: { id: '' },
//     modelName: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');

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

//     onAdd(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Add New Model</h3>
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

//           {/* Brand Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Brand <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={formData.brand.id}
//               onChange={(e) => handleBrandChange(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="">-- Select a brand --</option>
//               {brands.map(brand => (
//                 <option key={brand.id} value={brand.id}>
//                   {brand.brandName}
//                 </option>
//               ))}
//             </select>
//             {brands.length === 0 && (
//               <p className="text-xs text-yellow-600 mt-1">No brands found. Please create a brand first.</p>
//             )}
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               This name must be unique within the selected brand
//             </p>
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Active Status */}
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
//               disabled={brands.length === 0}
//               className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium ${
//                 brands.length === 0
//                   ? 'bg-gray-400 cursor-not-allowed text-gray-700'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//               }`}
//             >
//               Add Model
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddModelModal;







import { useState } from 'react';

const AddModelModal = ({ onAdd, onClose, brands }) => {
  const [formData, setFormData] = useState({
    brand: { id: '' },
    modelName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onAdd(formData);
      // Success - modal will close from parent component
      setIsSubmitting(false);
    } catch (err) {
      console.error('Submit error caught in modal:', err);
      console.error('Error message:', err.message);
      const errorMsg = err.message || 'Failed to add model';
      console.log('Setting error state to:', errorMsg);
      // Display the error from backend
      setError(errorMsg);
      setIsSubmitting(false);
      console.log('Error state set, isSubmitting:', false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Model</h3>
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
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {brands.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No brands found. Please create a brand first.</p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={brands.length === 0 || isSubmitting}
              className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium ${
                brands.length === 0 || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModelModal;