import { useState } from 'react';

const DeductStockModal = ({ item, onDeduct, onClose }) => {
  const [deductData, setDeductData] = useState({
    quantityUsed: 1,
    reason: 'REPAIR_USE',
    serialNumbers: [],
    notes: ''
  });
  const [selectedSerials, setSelectedSerials] = useState([]);

  const reasons = [
    { value: 'REPAIR_USE', label: 'Used in Repair' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'LOST', label: 'Lost' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'DISPOSAL', label: 'Disposal' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeductData(prev => ({
      ...prev,
      [name]: name === 'quantityUsed' ? parseInt(value) : value
    }));
  };

  const handleSerialToggle = (serial) => {
    setSelectedSerials(prev => {
      if (prev.find(s => s.id === serial.id)) {
        return prev.filter(s => s.id !== serial.id);
      } else {
        return [...prev, serial];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (item.hasSerialization && item.serials && item.serials.length > 0) {
      if (selectedSerials.length === 0) {
        alert('Please select serial numbers to deduct');
        return;
      }
      deductData.serialNumbers = selectedSerials.map(s => s.serialNumber);
    } else {
      if (deductData.quantityUsed <= 0 || deductData.quantityUsed > item.quantity) {
        alert('Invalid quantity');
        return;
      }
    }

    onDeduct(deductData);
  };

  const availableSerials = item.serials?.filter(s => s.status === 'AVAILABLE') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="bg-orange-600 text-white p-6 flex justify-between items-center sticky top-0">
          <h3 className="text-xl font-bold">Use Item for Repair</h3>
          <button onClick={onClose} className="text-white hover:bg-orange-700 p-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-gray-700">Item</p>
            <p className="text-lg font-bold text-orange-900">{item.name}</p>
            <p className="text-sm text-orange-700 mt-1">Available: {item.quantity}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Deduction</label>
            <select
              name="reason"
              value={deductData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {reasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* If item has serialization */}
          {item.hasSerialization && availableSerials.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Serial Numbers ({selectedSerials.length} selected)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {availableSerials.map(serial => (
                  <label key={serial.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSerials.some(s => s.id === serial.id)}
                      onChange={() => handleSerialToggle(serial)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{serial.serialNumber}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Use</label>
              <input
                type="number"
                name="quantityUsed"
                value={deductData.quantityUsed}
                onChange={handleChange}
                min="1"
                max={item.quantity}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-600 mt-1">Max available: {item.quantity}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              name="notes"
              value={deductData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium"
            >
              Confirm Use
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeductStockModal;