import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { API_BASE_URL, API_ENDPOINTS } from '../services/api';

const AddCategoryModal = ({ onAdd, onClose, existingCategories }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
  };

  // Check for duplicate category name (case-insensitive)
  const isDuplicateName = (name) => {
    const trimmedName = name.trim().toLowerCase();
    return existingCategories.some(
      category => category.name.toLowerCase() === trimmedName
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation checks
    if (!formData.name.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 3) {
      setError('Category name must be at least 3 characters');
      setLoading(false);
      return;
    }

    // ✅ DUPLICATE CHECK BEFORE API CALL
    if (isDuplicateName(formData.name)) {
      setError(`A category with the name '${formData.name.trim()}' already exists. The same category name cannot be added twice.`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSE_CATEGORIES}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        onAdd(newCategory);
        setFormData({
          name: '',
          description: '',
          isActive: true
        });
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Error adding category. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Category</h3>
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
              placeholder="e.g., Office Supplies"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;