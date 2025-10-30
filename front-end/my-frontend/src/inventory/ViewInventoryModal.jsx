import { useState } from 'react';

const ViewInventoryModal = ({ item, onAddSerial, onClose }) => {
  const [showAddSerial, setShowAddSerial] = useState(false);
  const [newSerial, setNewSerial] = useState('');

  const handleAddSerial = (e) => {
    e.preventDefault();
    if (newSerial.trim()) {
      onAddSerial(newSerial);
      setNewSerial('');
      setShowAddSerial(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center sticky top-0">
          <h3 className="text-xl font-bold">{item.name} - Details</h3>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">SKU</p>
              <p className="font-semibold text-gray-900">{item.sku}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-semibold text-gray-900">{item.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Stock</p>
              <p className={`text-2xl font-bold ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-green-600'}`}>
                {item.quantity}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Min Threshold</p>
              <p className="text-lg font-semibold text-gray-900">{item.minThreshold}</p>
            </div>
          </div>

          {/* Prices */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Purchase</p>
                <p className="text-lg font-bold text-blue-600">Rs.{item.purchasePrice?.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Selling</p>
                <p className="text-lg font-bold text-green-600">Rs.{item.sellingPrice?.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Special</p>
                <p className="text-lg font-bold text-purple-600">Rs.{item.specialPrice?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          )}

          {/* Serialization */}
          {item.hasSerialization && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-900">Serial Numbers</h4>
                <button
                  onClick={() => setShowAddSerial(!showAddSerial)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  {showAddSerial ? 'Cancel' : '+ Add Serial'}
                </button>
              </div>

              {showAddSerial && (
                <form onSubmit={handleAddSerial} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="Enter serial number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                  />
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
                  >
                    Add Serial
                  </button>
                </form>
              )}

              {item.serials && item.serials.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {item.serials.map(serial => (
                    <div key={serial.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{serial.serialNumber}</p>
                        <p className="text-xs text-gray-500">Status: {serial.status}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        serial.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                        serial.status === 'DAMAGED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {serial.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No serials added yet</p>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="border-t pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventoryModal;
