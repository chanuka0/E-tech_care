
// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';
// import AddServiceCategoryModal from './AddServiceCategoryModal';
// import EditServiceCategoryModal from './Editservicecategorymodal';

// const ServiceCategoryManagement = () => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth();
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('name'); // name, price, status

//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   const fetchCategories = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/service-categories');
//       setCategories(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch service categories');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const handleAddCategory = async (newCategory) => {
//     try {
//       const response = await apiCall('/api/service-categories', {
//         method: 'POST',
//         body: JSON.stringify(newCategory)
//       });
//       setCategories([...categories, response]);
//       setShowAddModal(false);
//       showSuccessMessage('Service category added successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to add service category');
//     }
//   };

//   const handleUpdateCategory = async (updatedCategory) => {
//     try {
//       const response = await apiCall(`/api/service-categories/${selectedCategory.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updatedCategory)
//       });
//       setCategories(categories.map(cat => cat.id === selectedCategory.id ? response : cat));
//       setShowEditModal(false);
//       setSelectedCategory(null);
//       showSuccessMessage('Service category updated successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to update service category');
//     }
//   };

//   const handleToggleCategory = async (id) => {
//     try {
//       const response = await apiCall(`/api/service-categories/${id}/toggle`, {
//         method: 'PATCH'
//       });
//       setCategories(categories.map(cat => cat.id === id ? response : cat));
//       showSuccessMessage(`Service category ${response.isActive ? 'activated' : 'deactivated'} successfully!`);
//     } catch (err) {
//       setError(err.message || 'Failed to toggle service category');
//     }
//   };

//   const handleDeleteCategory = async (id) => {
//     if (window.confirm('Are you sure you want to delete this service category? This action cannot be undone.')) {
//       try {
//         await apiCall(`/api/service-categories/${id}`, {
//           method: 'DELETE'
//         });
//         setCategories(categories.filter(cat => cat.id !== id));
//         showSuccessMessage('Service category deleted successfully!');
//       } catch (err) {
//         setError(err.message || 'Failed to delete service category');
//       }
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   // Filter and sort categories
//   const filteredCategories = categories.filter(category => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       category.name.toLowerCase().includes(searchLower) ||
//       (category.description && category.description.toLowerCase().includes(searchLower))
//     );
//   });

//   const sortedCategories = [...filteredCategories].sort((a, b) => {
//     if (sortBy === 'name') {
//       return a.name.localeCompare(b.name);
//     } else if (sortBy === 'price') {
//       return (a.servicePrice || 0) - (b.servicePrice || 0);
//     } else if (sortBy === 'status') {
//       return b.isActive - a.isActive;
//     }
//     return 0;
//   });

//   // Calculate totals
//   const totalCategories = categories.length;
//   const activeCategories = categories.filter(c => c.isActive).length;
//   const inactiveCategories = categories.filter(c => !c.isActive).length;
//   const totalRevenuePotential = categories.reduce((sum, c) => sum + (c.servicePrice || 0), 0);
//   const averagePrice = totalCategories > 0 ? (totalRevenuePotential / totalCategories).toFixed(2) : '0.00';

//   if (!isAdmin()) {
//     return (
//       <div className="max-w-6xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           <p className="font-medium">Access Denied</p>
//           <p className="text-sm mt-1">You do not have permission to access Service Category Management. Only administrators can manage service categories.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Service Categories</h2>
//           <p className="text-gray-600 mt-1">Manage service types and pricing for job cards</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Add Service Category</span>
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Categories</p>
//               <p className="text-3xl font-bold text-gray-900">{totalCategories}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Active</p>
//               <p className="text-3xl font-bold text-green-600">{activeCategories}</p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Inactive</p>
//               <p className="text-3xl font-bold text-red-600">{inactiveCategories}</p>
//             </div>
//             <div className="bg-red-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Average Price</p>
//               <p className="text-3xl font-bold text-purple-600">Rs.{averagePrice}</p>
//             </div>
//             <div className="bg-purple-100 p-3 rounded-full">
//               <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar and Sort */}
//       <div className="bg-white rounded-lg shadow p-4 space-y-4">
//         <div className="relative">
//           <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Sort By:</label>
//           <div className="flex space-x-2">
//             {[
//               { value: 'name', label: 'Name' },
//               { value: 'price', label: 'Price' },
//               { value: 'status', label: 'Status' }
//             ].map(option => (
//               <button
//                 key={option.value}
//                 onClick={() => setSortBy(option.value)}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   sortBy === option.value
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Service Categories Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : sortedCategories.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No Service Categories Found</h3>
//               <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first service category to get started'}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {sortedCategories.map(category => (
//                   <tr key={category.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">#{category.id}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-semibold text-gray-900">{category.name}</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {category.description || 'No description provided'}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-bold text-green-600">
//                         Rs.{(category.servicePrice || 0).toFixed(2)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         category.isActive
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {category.isActive ? '✓ Active' : '✗ Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {new Date(category.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedCategory(category);
//                           setShowEditModal(true);
//                         }}
//                         className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleToggleCategory(category.id)}
//                         className={`font-medium transition-colors ${
//                           category.isActive
//                             ? 'text-yellow-600 hover:text-yellow-900'
//                             : 'text-green-600 hover:text-green-900'
//                         }`}
//                       >
//                         {category.isActive ? 'Deactivate' : 'Activate'}
//                       </button>
//                       <button
//                         onClick={() => handleDeleteCategory(category.id)}
//                         className="text-red-600 hover:text-red-900 font-medium transition-colors"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showAddModal && (
//         <AddServiceCategoryModal
//           onAdd={handleAddCategory}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedCategory && (
//         <EditServiceCategoryModal
//           category={selectedCategory}
//           onUpdate={handleUpdateCategory}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedCategory(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ServiceCategoryManagement;


import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddServiceCategoryModal from './AddServiceCategoryModal';
import EditServiceCategoryModal from './Editservicecategorymodal';

const ServiceCategoryManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/service-categories');
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch service categories');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (newCategory) => {
    try {
      const response = await apiCall('/api/service-categories', {
        method: 'POST',
        body: JSON.stringify(newCategory)
      });
      setCategories([...categories, response]);
      setShowAddModal(false);
      showSuccessMessage('Service category added successfully!');
    } catch (err) {
      throw new Error(err.message || 'Failed to add service category');
    }
  };

  const handleUpdateCategory = async (updatedCategory) => {
    try {
      const response = await apiCall(`/api/service-categories/${selectedCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCategory)
      });
      setCategories(categories.map(cat => cat.id === selectedCategory.id ? response : cat));
      setShowEditModal(false);
      setSelectedCategory(null);
      showSuccessMessage('Service category updated successfully!');
    } catch (err) {
      throw new Error(err.message || 'Failed to update service category');
    }
  };

  const handleToggleCategory = async (id) => {
    try {
      const response = await apiCall(`/api/service-categories/${id}/toggle`, {
        method: 'PATCH'
      });
      setCategories(categories.map(cat => cat.id === id ? response : cat));
      showSuccessMessage(`Service category ${response.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to toggle service category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this service category? This action cannot be undone.')) {
      try {
        await apiCall(`/api/service-categories/${id}`, {
          method: 'DELETE'
        });
        setCategories(categories.filter(cat => cat.id !== id));
        showSuccessMessage('Service category deleted successfully!');
      } catch (err) {
        setError(err.message || 'Failed to delete service category');
      }
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.id.toString().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  });

  // Calculate totals
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.isActive).length;
  const inactiveCategories = categories.filter(c => !c.isActive).length;

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Service Category Management. Only administrators can manage service categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-0">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Category Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and configure settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-0">
        <div className="bg-white rounded-lg shadow mb-0">
          {/* Header with Add Button */}
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Service Category Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage system service categories for job cards</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Service Category</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                ✕
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by service category name, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table Header with Count and Refresh */}
          <div className="px-6 py-3 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredCategories.length} of {totalCategories} service categories</span>
            <button
              onClick={fetchCategories}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No Service Categories Found</h3>
                <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first service category to get started'}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">#{category.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 italic">
                          {category.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          Rs.{(category.servicePrice || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(category.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleCategory(category.id)}
                          className={`font-medium transition-colors inline-flex items-center ${
                            category.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Cards at Bottom */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Service Categories</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalCategories}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Service Categories</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{activeCategories}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Available for new job cards</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Inactive Service Categories</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{inactiveCategories}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Not available for new job cards</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddServiceCategoryModal
          onAdd={handleAddCategory}
          onClose={() => setShowAddModal(false)}
          existingCategories={categories}
        />
      )}

      {showEditModal && selectedCategory && (
        <EditServiceCategoryModal
          category={selectedCategory}
          onUpdate={handleUpdateCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          existingCategories={categories}
        />
      )}
    </div>
  );
};

export default ServiceCategoryManagement;