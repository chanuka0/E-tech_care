// import { useState } from 'react';
// import { useAuth } from '../auth/AuthProvider';

// const AddServiceCategoryModal = ({ onAdd, onClose }) => {
//   const { token } = useAuth();
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     servicePrice: '',
//     isActive: true
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

//       onAdd(payload);
//     } catch (err) {
//       setError(err.message || 'Failed to add service category');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Add New Service Category</h3>
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
//               Category Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="e.g., Laptop Repair, Screen Replacement"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">This is the name users will see when creating job cards</p>
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
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//               id="isActive"
//             />
//             <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
//               Active (Available immediately for use)
//             </label>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//             <p className="text-xs text-blue-700">
//               <strong>💡 Tip:</strong> Active categories will be available for selection when creating job cards. You can deactivate them later if needed.
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
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors font-medium"
//             >
//               {loading ? 'Adding...' : 'Add Category'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddServiceCategoryModal;






import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const AddServiceCategoryModal = ({ onAdd, onClose, existingCategories }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servicePrice: '',
    isActive: true
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
      cat => cat.name.toLowerCase() === name.toLowerCase()
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

    // Check for duplicate name BEFORE submitting
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

      await onAdd(payload);
    } catch (err) {
      // Handle server-side duplicate error as well
      if (err.message && err.message.includes('already exists')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to add service category');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Service Category</h3>
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
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Laptop Repair, Screen Replacement"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">This is the name users will see when creating job cards</p>
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              id="isActive"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
              Active (Available immediately for use)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>💡 Tip:</strong> Active categories will be available for selection when creating job cards. You can deactivate them later if needed.
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors font-medium"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceCategoryModal;