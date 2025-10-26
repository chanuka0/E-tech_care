// import { useState, useEffect } from 'react';

// const EditCategoryModal = ({ category, onUpdate, onClose, token }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: ''
//   });
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (category) {
//       setFormData({
//         name: category.name || '',
//         description: category.description || ''
//       });
//     }
//   }, [category]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.name.trim()) {
//       setError('Category name is required');
//       return;
//     }

//     if (formData.name.trim().length < 3) {
//       setError('Category name must be at least 3 characters');
//       return;
//     }

//     onUpdate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Category</h3>
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

//           {/* Category ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{category?.id}
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
//               placeholder="e.g., Office Supplies"
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
//               placeholder="Describe this category (optional)"
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           {/* Created Info */}
//           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
//             <p>Created: {category?.createdAt ? new Date(category.createdAt).toLocaleString() : 'N/A'}</p>
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
//               Update Category
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditCategoryModal;
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const EditCategoryModal = ({ category, onUpdate, onClose }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    }
  }, [category]);

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
    setLoading(true);

    if (!formData.categoryName.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    if (formData.categoryName.trim().length < 3) {
      setError('Category name must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/expense-categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        onUpdate(updatedCategory);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Error updating category. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Category</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-green-700 p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Category ID - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{category?.id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="e.g., Office Supplies"
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
              placeholder="Describe this category (optional)"
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
              Active (Available for use immediately)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will prevent it from being used in new expenses
            </div>
          )}

          {/* Created Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p>Created: {category?.createdAt ? new Date(category.createdAt).toLocaleString() : 'N/A'}</p>
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

export default EditCategoryModal;