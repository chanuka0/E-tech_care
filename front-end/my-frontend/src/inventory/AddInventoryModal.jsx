
import { useState } from 'react';

const AddInventoryModal = ({ onAdd, onClose, existingItems }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    minThreshold: '',
    purchasePrice: '',
    sellingPrice: '',
    specialPrice: '',
    hasSerialization: false
  });
  const [errors, setErrors] = useState({});

  const categories = ['Electronics', 'Hardware', 'Software', 'Accessories', 'Services', 'Other'];

  const validateForm = () => {
    const newErrors = {};

    const duplicateName = existingItems.find(
      item => item.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (duplicateName) {
      newErrors.name = `Item "${formData.name}" already exists! Please use a different name.`;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox'
          ? checked
          : type === 'number'
            ? (value === '' ? '' : parseFloat(value))
            : value
      };
      // When serialization is enabled, force quantity to blank (serials manage qty)
      if (name === 'hasSerialization' && checked) {
        updated.quantity = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Convert any blank fields back to 0 before passing to parent
    const sanitizedData = {
      ...formData,
      quantity: formData.quantity === '' ? 0 : formData.quantity,
      minThreshold: formData.minThreshold === '' ? 0 : formData.minThreshold,
      purchasePrice: formData.purchasePrice === '' ? 0 : formData.purchasePrice,
      sellingPrice: formData.sellingPrice === '' ? 0 : formData.sellingPrice,
      specialPrice: formData.specialPrice === '' ? 0 : formData.specialPrice,
    };
    onAdd(sanitizedData);
  };

  const inp = "w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 text-sm";
  const lbl = "block text-xs font-medium text-gray-700 mb-0.5";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg flex-shrink-0">
          <h3 className="text-base font-bold">Add New Item</h3>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {/* Name */}
          <div>
            <label className={lbl}>Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${inp} ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              required
            />
            {errors.name && (
              <div className="mt-1 flex items-start text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Description + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className={`${inp} border-gray-300 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${inp} border-gray-300 focus:ring-blue-500`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity + Min Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>
                Quantity
                {formData.hasSerialization && (
                  <span className="ml-1 text-orange-600 font-semibold">(Managed by Serials)</span>
                )}
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.hasSerialization ? '' : formData.quantity}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                disabled={formData.hasSerialization}
                className={`${inp} ${
                  formData.hasSerialization
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formData.hasSerialization && (
                <p className="text-xs text-orange-600 mt-0.5">
                  ⚠️ Add serials after creating this item to increase stock.
                </p>
              )}
            </div>
            <div>
              <label className={lbl}>Min Threshold</label>
              <input
                type="number"
                name="minThreshold"
                value={formData.minThreshold}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                className={`${inp} border-gray-300 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Purchase Price</label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={lbl}>Selling Price</label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={lbl}>Special Price</label>
              <input type="number" name="specialPrice" value={formData.specialPrice} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-blue-500`} />
            </div>
          </div>

          {/* Serialization Toggle */}
          <div className={`flex items-start p-3 rounded-lg border ${formData.hasSerialization ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
            <input
              type="checkbox"
              name="hasSerialization"
              checked={formData.hasSerialization}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded mt-0.5"
            />
            <div className="ml-2">
              <label className="text-sm font-medium text-gray-700">Has Serialization (Track by Serial Numbers)</label>
              {formData.hasSerialization && (
                <p className="text-xs text-purple-700 mt-0.5">
                  📋 Stock will be managed through serial numbers. Use <strong>"+ Serials"</strong> button after creating this item.
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;