// import { useState, useEffect } from 'react';

// const AddExpenseModal = ({ onAdd, onClose, token }) => {
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
//   }, []);

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

//     onAdd(expenseData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Add New Expense</h3>
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
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//                 No categories available. Please create one first.
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
//                 className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//               Mark as active
//             </label>
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
//               disabled={loadingCategories || categories.length === 0}
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors font-medium"
//             >
//               Add Expense
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddExpenseModal;
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const AddExpenseModal = ({ onAdd, onClose }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    price: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Token:', token);
    if (token) {
      fetchCategories();
    } else {
      console.error('No token available');
      setError('Authentication required. Please login again.');
    }
  }, [token]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError('');
    try {
      console.log('Fetching categories with token:', token);
      
      const response = await fetch('http://localhost:8081/api/expense-categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories received:', data);
        
        const activeCategories = data.filter(cat => cat.isActive === true);
        console.log('Active categories:', activeCategories);
        
        setCategories(activeCategories);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch categories. Status:', response.status);
        console.error('Error response:', errorText);
        setError(`Failed to fetch categories. Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(`Error fetching categories: ${err.message}`);
    }
    setLoadingCategories(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.category.trim()) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    const expenseData = {
      category: formData.category,
      amount: parseFloat(formData.price),
      description: formData.description
    };

    console.log('Submitting expense:', expenseData);

    try {
      const response = await fetch('http://localhost:8081/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      console.log('Create response status:', response.status);

      if (response.ok) {
        const newExpense = await response.json();
        console.log('Expense created:', newExpense);
        onAdd(newExpense);
        setFormData({
          category: '',
          price: '',
          description: ''
        });
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error creating expense:', errorData);
        setError(errorData.message || 'Failed to add expense');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Error adding expense. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Expense</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
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
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select a category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                No categories available. Please create one first in Settings.
              </div>
            )}
            {!loadingCategories && categories.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Categories loaded: {categories.length}</p>
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
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={loadingCategories || categories.length === 0 || loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors font-medium"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;