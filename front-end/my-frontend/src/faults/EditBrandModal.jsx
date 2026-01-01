import { useState, useEffect } from 'react';

const EditBrandModal = ({ brand, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [originalBrandName, setOriginalBrandName] = useState('');

  useEffect(() => {
    if (brand) {
      setFormData({
        brandName: brand.brandName || '',
        description: brand.description || '',
        isActive: brand.isActive !== undefined ? brand.isActive : true
      });
      setOriginalBrandName(brand.brandName || '');
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.brandName.trim()) {
      setError('Brand name is required');
      return;
    }

    if (formData.brandName.trim().length < 2) {
      setError('Brand name must be at least 2 characters');
      return;
    }

    if (formData.brandName.trim().length > 255) {
      setError('Brand name cannot exceed 255 characters');
      return;
    }

    // Check if brand name was actually changed
    if (formData.brandName === originalBrandName) {
      // If only description or status changed, allow update
      setLoading(true);
      try {
        await onUpdate(formData);
      } catch (err) {
        // Error is handled in parent component
      } finally {
        setLoading(false);
      }
    } else {
      // Brand name was changed - warn user about duplicate check
      if (window.confirm(`Changing brand name from "${originalBrandName}" to "${formData.brandName}". Continue?`)) {
        setLoading(true);
        try {
          await onUpdate(formData);
        } catch (err) {
          // Error is handled in parent component
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Edit Brand</h3>
            <p className="text-sm opacity-90 mt-1">ID: #{brand?.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-green-700 p-1 rounded transition-colors"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Original Brand Name Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Brand Name
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              {originalBrandName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              placeholder="Enter new brand name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.brandName !== originalBrandName 
                ? `Changing from "${originalBrandName}" to "${formData.brandName}"`
                : 'Name unchanged'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the brand (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
              disabled={loading}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-medium">Warning: Inactive Brand</p>
                  <p className="mt-1">Marking as inactive will prevent it from being used in new job cards.</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{brand?.createdAt ? new Date(brand.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{brand?.updatedAt ? new Date(brand.updatedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBrandModal;