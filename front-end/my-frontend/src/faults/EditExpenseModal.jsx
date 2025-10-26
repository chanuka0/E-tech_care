// import { useState, useEffect } from 'react';

// const EditExpenseModal = ({ expense, onUpdate, onClose, token }) => {
//   const [categories, setCategories] = useState([]);
//   const [formData, setFormData] = useState({
//     category: '',
//     description: '',
//     amount: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');
//   const [loadingCategories, setLoadingCategories] = useState(false);

//   useEffect(() => {
//     fetchCategories();
//     if (expense) {
//       setFormData({
//         category: expense.category || '',
//         description: expense.description || '',
//         amount: expense.amount || '',
//         isActive: expense.isActive !== undefined ? expense.isActive : true
//       });
//     }
//   }, [expense]);

//   const fetchCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const response = await fetch('http://localhost:8081/api/expenses/categories', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch categories');
//       }

//       const data = await response.json();
//       setCategories(data);
//     } catch (err) {
//       console.error('Failed to fetch categories:', err);
//       setError('Failed to load categories');
//     }
//     setLoadingCategories(false);
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

//     if (!formData.category.trim()) {
//       setError('Please select a category');
//       return;
//     }

//     if (!formData.amount || parseFloat(formData.amount) <= 0) {
//       setError('Amount must be greater than 0');
//       return;
//     }

//     const expenseData = {
//       category: formData.category,
//       description: formData.description,
//       amount: parseFloat(formData.amount),
//       isActive: formData.isActive
//     };

//     onUpdate(expenseData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Expense</h3>
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

//           {/* Expense ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Expense ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{expense?.id}
//             </div>
//           </div>

//           {/* Category Dropdown */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category <span className="text-red-500">*</span>
//             </label>
//             {loadingCategories ? (
//               <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
//                 Loading categories...
//               </div>
//             ) : categories.length > 0 ? (
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 required
//               >
//                 <option value="">Select a category</option>
//                 {categories.map(cat => (
//                   <option key={cat.id} value={cat.name}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
//                 No categories available.
//               </div>
//             )}
//           </div>

//           {/* Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Amount <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
//               <input
//                 type="number"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 placeholder="0.00"
//                 step="0.01"
//                 min="0.01"
//                 className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 required
//               />
//             </div>
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
//               placeholder="Add any notes (optional)"
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
//               Mark as active
//             </label>
//           </div>

//           {!formData.isActive && (
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//               ⚠️ Marking as inactive will hide it from active lists
//             </div>
//           )}

//           {/* Created/Updated Info */}
//           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
//             <p>Created: {expense?.createdAt ? new Date(expense.createdAt).toLocaleString() : 'N/A'}</p>
//             <p>Last Updated: {expense?.updatedAt ? new Date(expense.updatedAt).toLocaleString() : 'N/A'}</p>
//           </div>

//           {/* Button Group */}
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
//               Update Expense
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditExpenseModal;

// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';

// const EditExpenseModal = ({ expense, onUpdate, onClose }) => {
//   const { apiCall } = useApi();
//   const [categories, setCategories] = useState([]);
//   const [formData, setFormData] = useState({
//     categoryId: '',
//     price: '',
//     description: '',
//     isActive: true
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(false);

//   useEffect(() => {
//     fetchCategories();
//     if (expense) {
//       setFormData({
//         categoryId: expense.categoryId || '',
//         price: expense.price || '',
//         description: expense.description || '',
//         isActive: expense.isActive !== undefined ? expense.isActive : true
//       });
//     }
//   }, [expense]);

//   const fetchCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const data = await apiCall('/api/expenses/categories');
//       setCategories(data);
//     } catch (err) {
//       console.error('Failed to fetch categories:', err);
//       setError('Failed to load categories');
//     }
//     setLoadingCategories(false);
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

//     if (!formData.categoryId) {
//       setError('Please select an expense category');
//       return;
//     }

//     if (!formData.price || parseFloat(formData.price) <= 0) {
//       setError('Price must be greater than 0');
//       return;
//     }

//     const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
    
//     const expenseData = {
//       categoryId: parseInt(formData.categoryId),
//       categoryName: selectedCategory?.name || '',
//       price: parseFloat(formData.price),
//       description: formData.description,
//       isActive: formData.isActive
//     };

//     setLoading(true);
//     onUpdate(expenseData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Edit Expense</h3>
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

//           {/* Expense ID - Read Only */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Expense ID
//             </label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
//               #{expense?.id}
//             </div>
//           </div>

//           {/* Category Dropdown */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Expense Category <span className="text-red-500">*</span>
//             </label>
//             {loadingCategories ? (
//               <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
//                 Loading categories...
//               </div>
//             ) : categories.length > 0 ? (
//               <select
//                 name="categoryId"
//                 value={formData.categoryId}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 required
//               >
//                 <option value="">-- Select Category --</option>
//                 {categories.map(cat => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
//                 No categories available.
//               </div>
//             )}
//           </div>

//           {/* Price */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Price <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 placeholder="0.00"
//                 step="0.01"
//                 min="0.01"
//                 className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 required
//               />
//             </div>
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
//               placeholder="Add any notes or details (optional)"
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
//               Mark as active
//             </label>
//           </div>

//           {!formData.isActive && (
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//               ⚠️ Marking as inactive will hide it from expense lists
//             </div>
//           )}

//           {/* Created/Updated Info */}
//           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
//             <p>Created: {expense?.createdAt ? new Date(expense.createdAt).toLocaleString() : 'N/A'}</p>
//             <p>Updated: {expense?.updatedAt ? new Date(expense.updatedAt).toLocaleString() : 'N/A'}</p>
//           </div>

//           {/* Buttons */}
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
//               disabled={loading || loadingCategories}
//               className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors font-medium"
//             >
//               {loading ? 'Updating...' : 'Update Expense'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditExpenseModal;

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const EditExpenseModal = ({ expense, onUpdate, onClose }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: '',
    price: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (expense) {
      setFormData({
        categoryName: expense.categoryName || '',
        price: expense.price || '',
        description: expense.description || '',
        isActive: expense.isActive !== undefined ? expense.isActive : true
      });
    }
  }, [expense]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('http://localhost:8081/api/expense-categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
    setLoadingCategories(false);
  };

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

    if (!formData.categoryName.trim()) {
      setError('Please select a category');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const expenseData = {
      categoryName: formData.categoryName,
      price: parseFloat(formData.price),
      description: formData.description,
      isActive: formData.isActive
    };

    try {
      const response = await fetch(`http://localhost:8081/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        onUpdate(updatedExpense);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update expense');
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Error updating expense. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Expense</h3>
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

          {/* Expense ID - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{expense?.id}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            {loadingCategories ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            ) : categories.length > 0 ? (
              <select
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                No categories available.
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
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
              placeholder="Add any notes (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Mark as active
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will hide it from active lists
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p>Created: {expense?.createdAt ? new Date(expense.createdAt).toLocaleString() : 'N/A'}</p>
            <p>Last Updated: {expense?.updatedAt ? new Date(expense.updatedAt).toLocaleString() : 'N/A'}</p>
          </div>

          {/* Button Group */}
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
              Update Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;