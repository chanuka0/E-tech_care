import { useState, useEffect } from 'react';

const EditModelNumberModal = ({ modelNumber, onUpdate, onClose, models }) => {
  const [formData, setFormData] = useState({
    model: { id: '' },
    modelNumber: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');

  // Initialize form data
  useEffect(() => {
    if (modelNumber) {
      setFormData({
        model: { id: modelNumber.model?.id || '' },
        modelNumber: modelNumber.modelNumber || '',
        description: modelNumber.description || '',
        isActive: modelNumber.isActive !== undefined ? modelNumber.isActive : true
      });
    }
  }, [modelNumber]);

  const handleModelChange = (modelId) => {
    setFormData(prev => ({
      ...prev,
      model: { id: modelId }
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.model.id) {
      setError('Please select a model');
      return;
    }

    if (!formData.modelNumber.trim()) {
      setError('Model number is required');
      return;
    }

    if (formData.modelNumber.trim().length < 2) {
      setError('Model number must be at least 2 characters');
      return;
    }

    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Model Number</h3>
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

          {/* Model Number ID - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Number ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-medium">
              #{modelNumber?.id}
            </div>
          </div>

          {/* Current Model Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">Current Model:</p>
            <p className="text-sm text-blue-700">
              {modelNumber?.model?.modelName || 'No model selected'}
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.model.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Select a model --</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.modelName}
                </option>
              ))}
            </select>
          </div>

          {/* Model Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="modelNumber"
              value={formData.modelNumber}
              onChange={handleChange}
              placeholder="e.g., 12545, TP-480, INS-3500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
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
              placeholder="Describe this model number (optional)"
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
              Active (Available for use)
            </label>
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Marking as inactive will prevent it from being used in new job cards
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
            <p>Created: {modelNumber?.createdAt ? new Date(modelNumber.createdAt).toLocaleString() : 'N/A'}</p>
            <p>Last Updated: {modelNumber?.updatedAt ? new Date(modelNumber.updatedAt).toLocaleString() : 'N/A'}</p>
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
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
            >
              Update Model Number
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModelNumberModal;