import { useState } from 'react';

const AddModelNumberModal = ({ onAdd, onClose, models, existingModelNumbers }) => {
  const [formData, setFormData] = useState({
    model: { id: '' },
    modelNumber: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModelChange = (modelId) => {
    setFormData(prev => ({
      ...prev,
      model: { id: modelId }
    }));
    setError(''); // Clear error when model changes
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error on any change
  };

  // Frontend duplicate checking
  const checkForDuplicates = () => {
    if (!formData.model.id || !formData.modelNumber) {
      return null; // Let required validation handle this
    }

    const selectedModelId = parseInt(formData.model.id);
    const modelNumber = formData.modelNumber;

    // Find the selected model name for error message
    const selectedModel = models.find(m => m.id === selectedModelId);
    const modelName = selectedModel?.modelName || 'Selected Model';

    // Check if this exact combination already exists
    const duplicate = existingModelNumbers.find(mn => 
      mn.model?.id === selectedModelId && 
      mn.modelNumber === modelNumber
    );

    if (duplicate) {
      return `Model number '${modelNumber}' already exists for model '${modelName}'. The same model number cannot be added to the same model twice.`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.model.id) {
      setError('Please select a model');
      setIsSubmitting(false);
      return;
    }

    if (!formData.modelNumber.trim()) {
      setError('Model number is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.modelNumber.trim().length < 2) {
      setError('Model number must be at least 2 characters');
      setIsSubmitting(false);
      return;
    }

    // Check for duplicates BEFORE making API call
    const duplicateError = checkForDuplicates();
    if (duplicateError) {
      setError(duplicateError);
      setIsSubmitting(false);
      return;
    }

    try {
      await onAdd(formData);
    } catch (err) {
      // Error will be handled by parent component
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Add New Model Number</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.model.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this specific variant</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Available for use immediately)
            </label>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Model Number'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModelNumberModal;