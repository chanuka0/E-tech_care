// import { useState } from 'react';
// import { useAuth } from '../auth/AuthProvider';

// const EditServiceCategoryModal = ({ category, onUpdate, onClose }) => {
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

//       onUpdate(payload);
//     } catch (err) {
//       setError(err.message || 'Failed to update service category');
//     }
//     setLoading(false);
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
//             <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//               {error}
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





import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const EditServiceCategoryModal = ({ category, onUpdate, onClose, existingCategories }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: category.name || '',
    description: category.description || '',
    servicePrice: category.servicePrice || '',
    isActive: category.isActive !== undefined ? category.isActive : true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const checkDuplicateName = (name) => {
    return existingCategories.some(
      cat => cat.id !== category.id && cat.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Service category name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Service category name must be at least 2 characters');
      return;
    }

    // Check for duplicate name BEFORE submitting (excluding current category)
    if (checkDuplicateName(formData.name.trim())) {
      setError(`A service category with the name '${formData.name.trim()}' already exists. The same service category name cannot be added twice.`);
      return;
    }

    if (!formData.servicePrice || parseFloat(formData.servicePrice) <= 0) {
      setError('Service price must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        servicePrice: parseFloat(formData.servicePrice),
        isActive: formData.isActive
      };

      await onUpdate(payload);
    } catch (err) {
      // Handle server-side duplicate error as well
      if (err.message && err.message.includes('already exists')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to update service category');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Service Category</h3>
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
              Category ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{category.id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Laptop Repair, Screen Replacement"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Price <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">Rs.</span>
              <input
                type="number"
                name="servicePrice"
                value={formData.servicePrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Base price for this service category</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this service category..."
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
              id="isActive"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will prevent it from being used in new job cards
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 space-y-1">
              <div><strong>Created:</strong> {new Date(category.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
              <div><strong>Current Price:</strong> Rs.{category.servicePrice?.toFixed(2) || '0.00'}</div>
            </p>
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors font-medium"
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceCategoryModal;