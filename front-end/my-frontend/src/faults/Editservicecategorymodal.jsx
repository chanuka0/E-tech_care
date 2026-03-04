// import { useState } from 'react';
// import { useAuth } from '../auth/AuthProvider';

// const EditServiceCategoryModal = ({ category, onUpdate, onClose, existingCategories }) => {
//   const { token } = useAuth();
//   const [formData, setFormData] = useState({
//     name: category.name || '',
//     description: category.description || '',
//     servicePrice: category.servicePrice || '',
//     isActive: category.isActive !== undefined ? category.isActive : true
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//     // Clear error when user starts typing
//     if (error) setError('');
//   };

//   const checkDuplicateName = (name) => {
//     return existingCategories.some(
//       cat => cat.id !== category.id && cat.name.toLowerCase() === name.toLowerCase()
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.name.trim()) {
//       setError('Service category name is required');
//       return;
//     }

//     if (formData.name.trim().length < 2) {
//       setError('Service category name must be at least 2 characters');
//       return;
//     }

//     // Check for duplicate name BEFORE submitting (excluding current category)
//     if (checkDuplicateName(formData.name.trim())) {
//       setError(`A service category with the name '${formData.name.trim()}' already exists. The same service category name cannot be added twice.`);
//       return;
//     }

//     if (!formData.servicePrice || parseFloat(formData.servicePrice) <= 0) {
//       setError('Service price must be greater than 0');
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         servicePrice: parseFloat(formData.servicePrice),
//         isActive: formData.isActive
//       };

//       await onUpdate(payload);
//     } catch (err) {
//       // Handle server-side duplicate error as well
//       if (err.message && err.message.includes('already exists')) {
//         setError(err.message);
//       } else {
//         setError(err.message || 'Failed to update service category');
//       }
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Service Category</h3>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-green-700 p-1 rounded transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start">
//               <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{category.id}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="e.g., Laptop Repair, Screen Replacement"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Service Price <span className="text-red-500">*</span>
//             </label>
//             <div className="flex items-center">
//               <span className="text-gray-600 font-medium mr-2">Rs.</span>
//               <input
//                 type="number"
//                 name="servicePrice"
//                 value={formData.servicePrice}
//                 onChange={handleChange}
//                 onWheel={(e) => e.target.blur()}
//                 placeholder="0.00"
//                 step="0.01"
//                 min="0"
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 required
//               />
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Base price for this service category</p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description (Optional)
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Describe this service category..."
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
//               id="isActive"
//             />
//             <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
//               Active (Available for use)
//             </label>
//           </div>

//           {!formData.isActive && (
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//               ⚠️ Marking as inactive will prevent it from being used in new job cards
//             </div>
//           )}

//           <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//             <p className="text-xs text-green-700 space-y-1">
//               <div><strong>Created:</strong> {new Date(category.createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//               })}</div>
//               <div><strong>Current Price:</strong> Rs.{category.servicePrice?.toFixed(2) || '0.00'}</div>
//             </p>
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
//               disabled={loading}
//               className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors font-medium"
//             >
//               {loading ? 'Updating...' : 'Update Category'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditServiceCategoryModal;


import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const EditServiceCategoryModal = ({ category, onUpdate, onClose, existingCategories }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servicePrice: '',
    specialServicePrice: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        servicePrice: category.servicePrice != null ? String(category.servicePrice) : '',
        specialServicePrice: category.specialServicePrice != null ? String(category.specialServicePrice) : '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const checkDuplicateName = (name) =>
    existingCategories.some(cat => cat.id !== category.id && cat.name.toLowerCase() === name.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Service category name is required'); return; }
    if (formData.name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    if (checkDuplicateName(formData.name.trim())) {
      setError(`A service category with the name '${formData.name.trim()}' already exists.`);
      return;
    }
    if (!formData.servicePrice || parseFloat(formData.servicePrice) <= 0) {
      setError('Service price must be greater than 0'); return;
    }
    if (formData.specialServicePrice && parseFloat(formData.specialServicePrice) < 0) {
      setError('Special price cannot be negative'); return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        servicePrice: parseFloat(formData.servicePrice),
        specialServicePrice: formData.specialServicePrice ? parseFloat(formData.specialServicePrice) : null,
        isActive: formData.isActive
      };
      await onUpdate(payload);
    } catch (err) {
      setError(err.message && err.message.includes('already exists')
        ? err.message
        : err.message || 'Failed to update service category');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">

        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
          <h3 className="text-base font-bold">Edit Service Category</h3>
          <button onClick={onClose} className="text-white hover:bg-green-700 p-1 rounded transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Category ID (read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Category ID</label>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-gray-600 text-sm font-medium">
              #{category.id}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., Laptop Repair, Screen Replacement"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              required
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Service Price <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                <span className="px-2 text-xs text-gray-500 bg-gray-50 border-r border-gray-300 py-1.5">Rs.</span>
                <input
                  type="number" name="servicePrice" value={formData.servicePrice}
                  onWheel={e => e.target.blur()} onChange={handleChange}
                  placeholder="0.00" step="0.01" min="0"
                  className="flex-1 px-2 py-1.5 text-sm focus:outline-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Regular / walk-in price</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Special Price
                <span className="ml-1 text-purple-600 text-xs">(Regular Customers)</span>
              </label>
              <div className="flex items-center border border-purple-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                <span className="px-2 text-xs text-gray-500 bg-purple-50 border-r border-purple-300 py-1.5">Rs.</span>
                <input
                  type="number" name="specialServicePrice" value={formData.specialServicePrice}
                  onWheel={e => e.target.blur()} onChange={handleChange}
                  placeholder="Optional" step="0.01" min="0"
                  className="flex-1 px-2 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <p className="text-xs text-purple-500 mt-0.5">
                {formData.specialServicePrice
                  ? <span className="text-green-600 font-medium">✓ Special price set</span>
                  : 'Clear to use regular price'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Description (Optional)</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Describe this service category..." rows="2"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Active toggle */}
          <div className={`flex items-start p-3 rounded-lg border ${formData.isActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <input
              type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
              className="h-4 w-4 text-green-600 border-gray-300 rounded mt-0.5" id="editIsActive"
            />
            <div className="ml-2">
              <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                Active (Available for use)
              </label>
              {!formData.isActive && (
                <p className="text-xs text-red-600 mt-0.5">⚠️ Inactive categories cannot be used in new job cards</p>
              )}
            </div>
          </div>

          {/* Price preview */}
          {formData.servicePrice && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">💡 Price Preview</p>
              <div className="flex gap-4 flex-wrap">
                <div className="text-xs text-gray-600">
                  Walk-in: <span className="font-bold text-gray-800">Rs.{parseFloat(formData.servicePrice || 0).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Regular customer:{' '}
                  <span className="font-bold text-purple-700">
                    Rs.{formData.specialServicePrice
                      ? parseFloat(formData.specialServicePrice).toFixed(2)
                      : parseFloat(formData.servicePrice || 0).toFixed(2)}
                  </span>
                  {!formData.specialServicePrice && <span className="text-gray-400 ml-1">(same as walk-in)</span>}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1.5">
                Created: {new Date(category.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded-md font-medium transition-colors">
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceCategoryModal;