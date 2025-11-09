import { useState } from 'react';

const StockAdjustmentModal = ({ item, onAdjust, onClose }) => {
  const [formData, setFormData] = useState({
    newQuantity: item.quantity,
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'newQuantity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }
    if (!formData.reason.trim()) {
      alert('Please provide a reason for adjustment');
      return;
    }
    onAdjust(formData);
  };

  const difference = formData.newQuantity - item.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-yellow-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Adjust Stock</h3>
          <button onClick={onClose} className="text-white hover:bg-yellow-700 p-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-gray-700">Item</p>
            <p className="text-lg font-bold text-yellow-900">{item.name}</p>
            <p className="text-sm text-yellow-700 mt-1">Current Stock: {item.quantity}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Stock Adjustment Warning</p>
                <p className="text-xs text-red-700 mt-1">
                  This will directly change the stock quantity. Use this only for corrections or physical stock count adjustments.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Quantity *
            </label>
            <input
              type="number"
              name="newQuantity"
              value={formData.newQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Adjustment *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., Physical count correction, Damaged items removed, System error correction"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className={`p-3 rounded border ${
            difference > 0 ? 'bg-green-50 border-green-200' : 
            difference < 0 ? 'bg-red-50 border-red-200' : 
            'bg-gray-50 border-gray-200'
          }`}>
            <p className="text-sm">
              <span className="font-medium">Change: </span>
              <span className={`font-bold ${
                difference > 0 ? 'text-green-600' : 
                difference < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {difference > 0 ? '+' : ''}{difference}
              </span>
            </p>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              Adjust Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;