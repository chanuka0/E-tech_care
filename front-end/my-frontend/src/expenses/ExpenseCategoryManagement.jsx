import { useAuth } from '../auth/AuthProvider';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from '../faults/EditCategoryModal';
import { API_BASE_URL, API_ENDPOINTS } from '../services/api'; 
import { useState, useEffect } from 'react';

const ExpenseCategoryManagement = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSE_CATEGORIES}`, {
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
        setError('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleAddCategory = (newCategory) => {
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    showSuccessMessage('Category added successfully!');
  };

  const handleUpdateCategory = (updatedCategory) => {
    setCategories(categories.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat));
    setShowEditModal(false);
    setSelectedCategory(null);
    showSuccessMessage('Category updated successfully!');
  };

  const handleToggleStatus = async (category) => {
    // Show confirmation for both activate and deactivate
    if (category.isActive) {
      const confirmDeactivate = window.confirm(
        `Are you sure you want to deactivate the category "${category.name}"?\n\nThis category will not be available for new expenses.`
      );
      
      if (!confirmDeactivate) {
        return;
      }
    } else {
      const confirmActivate = window.confirm(
        `Are you sure you want to activate the category "${category.name}"?\n\nThis category will be available for new expenses.`
      );
      
      if (!confirmActivate) {
        return;
      }
    }

    try {
      const updatedCategory = {
        ...category,
        isActive: !category.isActive
      };

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSE_CATEGORIES}/${category.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory)
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(categories.map(cat => cat.id === category.id ? result : cat));
        showSuccessMessage(`Category ${result.isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        setError('Failed to update category status');
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
      setError('Failed to update category status');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSE_CATEGORIES}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat.id !== id));
          showSuccessMessage('Category deleted successfully!');
        } else {
          setError('Failed to delete category');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
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

  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower)) ||
      category.id.toString().includes(searchLower)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Expense Categories</h3>
          <p className="text-gray-600 mt-1">Create and manage expense categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Category</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by category name, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
              <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first category to get started'}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{category.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 italic">
                        {category.description || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(category.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(category.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex items-center">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors inline-flex items-center"
                        title="Edit"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      {category.isActive ? (
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className="font-medium transition-colors px-3 py-1 rounded flex items-center space-x-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                          title="Deactivate category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          <span>Deactivate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className="font-medium transition-colors px-3 py-1 rounded flex items-center space-x-1 text-green-600 hover:text-green-900 hover:bg-green-50"
                          title="Activate category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Activate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Categories</p>
              <p className="text-3xl font-bold text-green-600">{categories.filter(c => c.isActive).length}</p>
              <p className="text-xs text-gray-500 mt-1">Available for new expenses</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Categories</p>
              <p className="text-3xl font-bold text-orange-600">{categories.filter(c => !c.isActive).length}</p>
              <p className="text-xs text-gray-500 mt-1">Not available for new expenses</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCategoryModal
          onAdd={handleAddCategory}
          onClose={() => setShowAddModal(false)}
          existingCategories={categories}
        />
      )}

      {showEditModal && selectedCategory && (
        <EditCategoryModal
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

export default ExpenseCategoryManagement;