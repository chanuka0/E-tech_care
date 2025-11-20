// src/main/resources/static/js/components/UsedItemsSection.js
import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const UsedItemsSection = ({ items, usedItems, onAdd, onRemove }) => {
  const { apiCall } = useApi();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [serialSearch, setSerialSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const selectedItemData = items.find(i => i.id === parseInt(selectedItem));

  // Filter available serials based on search
  const filteredSerials = availableSerials.filter(serial => 
    serial.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
  );

  // Fetch available serials when item with serialization is selected
  useEffect(() => {
    const fetchAvailableSerials = async () => {
      if (selectedItemData?.hasSerialization) {
        setLoadingSerials(true);
        try {
          // This now only returns AVAILABLE serials (not USED or SOLD)
          const serials = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);
          setAvailableSerials(serials || []);
        } catch (err) {
          console.error('Error fetching serials:', err);
          setAvailableSerials([]);
        } finally {
          setLoadingSerials(false);
        }
      } else {
        setAvailableSerials([]);
      }
      setSelectedSerials([]);
      setSerialSearch('');
      setBarcodeInput('');
    };

    fetchAvailableSerials();
  }, [selectedItemData]);

  // Handle barcode scanner input
  useEffect(() => {
    if (barcodeInput && selectedItemData?.hasSerialization) {
      handleBarcodeScan(barcodeInput);
    }
  }, [barcodeInput]);

  const handleBarcodeScan = (barcode) => {
    if (!selectedItemData?.hasSerialization) return;

    const serial = availableSerials.find(s => 
      s.serialNumber === barcode.trim()
    );

    if (serial) {
      // If serial is not already selected, select it
      if (!selectedSerials.includes(serial.serialNumber)) {
        if (selectedSerials.length < parseInt(quantity) || !quantity) {
          setSelectedSerials(prev => [...prev, serial.serialNumber]);
          showScanFeedback('success', `Added: ${serial.serialNumber}`);
        } else {
          showScanFeedback('warning', `Maximum ${quantity} serials allowed`);
        }
      } else {
        showScanFeedback('warning', `Already selected: ${serial.serialNumber}`);
      }
    } else {
      showScanFeedback('error', `Serial not found: ${barcode}`);
    }
    
    // Clear barcode input after processing
    setTimeout(() => setBarcodeInput(''), 100);
  };

  const showScanFeedback = (type, message) => {
    const colors = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };

    const feedback = document.createElement('div');
    feedback.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-pulse`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 3000);
  };

  const handleSerialSelection = (serialNumber, isSelected) => {
    if (isSelected) {
      if (selectedSerials.length < parseInt(quantity) || !quantity) {
        setSelectedSerials(prev => [...prev, serialNumber]);
      } else {
        alert(`Maximum ${quantity} serials allowed for this item`);
      }
    } else {
      setSelectedSerials(prev => prev.filter(s => s !== serialNumber));
    }
  };

  const handleAdd = () => {
    if (!selectedItem || !quantity) {
      alert('Please select item and quantity');
      return;
    }

    // Validate serial numbers for serialized items
    if (selectedItemData?.hasSerialization) {
      if (selectedSerials.length === 0) {
        alert('Please select at least one serial number for this item');
        return;
      }
      if (selectedSerials.length !== parseInt(quantity)) {
        alert(`Number of selected serials (${selectedSerials.length}) must match quantity (${quantity})`);
        return;
      }
    }

    onAdd(selectedItem, quantity, selectedSerials);
    setSelectedItem('');
    setQuantity('');
    setSelectedSerials([]);
    setAvailableSerials([]);
    setSerialSearch('');
    setBarcodeInput('');
  };

  // Select all/deselect all functionality
  const toggleSelectAll = () => {
    if (selectedSerials.length === filteredSerials.length) {
      // Deselect all
      setSelectedSerials([]);
    } else {
      // Select all available filtered serials
      const maxSelectable = parseInt(quantity) || filteredSerials.length;
      const serialsToSelect = filteredSerials.slice(0, maxSelectable).map(s => s.serialNumber);
      setSelectedSerials(serialsToSelect);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      {/* Add new item */}
      <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Used Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.hasSerialization && '🔢'} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max={selectedItemData?.hasSerialization ? availableSerials.length : selectedItemData?.quantity || 1}
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>

        {selectedItemData && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <div className="flex justify-between">
              <span>Price: Rs.{selectedItemData.sellingPrice?.toFixed(2) || '0.00'}</span>
              <span>Available: {selectedItemData.quantity}</span>
            </div>
            {selectedItemData.hasSerialization && (
              <div className="mt-1">
                <span className="font-medium">🔢 Serial Tracking Enabled</span>
                {availableSerials.length > 0 && (
                  <span> - {availableSerials.length} available serial(s)</span>
                )}
                {availableSerials.length === 0 && (
                  <span className="text-red-600"> - No available serials</span>
                )}
              </div>
            )}
            {selectedItemData.quantity <= selectedItemData.minThreshold && (
              <span className="text-red-600 font-medium">⚠️ Low Stock!</span>
            )}
          </div>
        )}

        {/* Serial Number Selection for Serialized Items */}
        {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Serial Search Bar */}
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Search Serial Numbers
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    placeholder="Search serial numbers..."
                    className="w-full px-3 py-2 pr-8 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {serialSearch && (
                    <button
                      onClick={() => setSerialSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Barcode Scanner Input */}
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Barcode Scanner
                </label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onBlur={(e) => setBarcodeInput('')}
                  placeholder="Scan barcode or type serial..."
                  className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  autoComplete="off"
                />
                <div className="text-xs text-yellow-600 mt-1">
                  💡 Scan barcode or type serial number
                </div>
              </div>
            </div>

            {/* Serial Numbers List Header */}
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-yellow-700">
                Available Serial Numbers ({selectedSerials.length} selected of {quantity || 0} required)
              </label>
              {filteredSerials.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                >
                  {selectedSerials.length === filteredSerials.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Serial Numbers List */}
            <div className="max-h-40 overflow-y-auto space-y-2 border border-yellow-200 rounded bg-white p-2">
              {loadingSerials ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mx-auto"></div>
                  <span className="text-xs text-yellow-600">Loading serials...</span>
                </div>
              ) : filteredSerials.length > 0 ? (
                filteredSerials.map(serial => (
                  <label 
                    key={serial.id} 
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedSerials.includes(serial.serialNumber) 
                        ? 'bg-yellow-100 border border-yellow-300' 
                        : 'hover:bg-yellow-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSerials.includes(serial.serialNumber)}
                      onChange={(e) => handleSerialSelection(serial.serialNumber, e.target.checked)}
                      className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                      disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(serial.serialNumber)}
                    />
                    <span className="text-sm font-mono flex-1">{serial.serialNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      serial.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      serial.status === 'USED' ? 'bg-orange-100 text-orange-800' :
                      serial.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {serial.status}
                    </span>
                  </label>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {serialSearch ? 'No serial numbers match your search' : 'No serial numbers available'}
                </div>
              )}
            </div>

            {/* Selected Serials Summary */}
            {selectedSerials.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-700 font-medium">
                    Selected: {selectedSerials.length} serial(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSerials([])}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedSerials.map((serial, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono"
                    >
                      {serial}
                      <button
                        type="button"
                        onClick={() => handleSerialSelection(serial, false)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selection Help Text */}
            {selectedItemData?.hasSerialization && quantity && (
              <div className="mt-2 text-xs text-yellow-600">
                💡 Select exactly {quantity} serial number(s). Use search or barcode scanner for quick selection.
                <br />
                ✅ Serial will be automatically marked as USED when added to job card.
              </div>
            )}
          </div>
        )}

        {selectedItemData?.hasSerialization && availableSerials.length === 0 && !loadingSerials && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            ⚠️ No available serial numbers for this item. All serials are either USED or SOLD.
          </div>
        )}
      </div>

      {/* Used Items List */}
      {usedItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items Used in Repair:</h4>
          <div className="space-y-2">
            {usedItems.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.inventoryItem.name} 
                      {item.inventoryItem.hasSerialization && ' 🔢'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantityUsed} × Rs.{item.unitPrice?.toFixed(2) || '0.00'} = 
                      Rs.{((item.quantityUsed || 0) * (item.unitPrice || 0)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Show used serial numbers */}
                {item.usedSerialNumbers && item.usedSerialNumbers.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Serial Numbers Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.usedSerialNumbers.map((serial, serialIndex) => (
                        <span key={serialIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                          {serial}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      ✅ These serials are marked as USED and cannot be used in other job cards.
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
              <span className="font-medium text-blue-900">
                Total Parts Cost: Rs.{usedItems.reduce((sum, item) => sum + ((item.quantityUsed || 0) * (item.unitPrice || 0)), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedItemsSection;