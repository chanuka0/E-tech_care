// import { useState } from 'react';

// const DeductStockModal = ({ item, onDeduct, onClose }) => {
//   const [deductData, setDeductData] = useState({
//     quantityUsed: 1,
//     reason: 'REPAIR_USE',
//     serialNumbers: [],
//     notes: ''
//   });
//   const [selectedSerials, setSelectedSerials] = useState([]);

//   const reasons = [
//     { value: 'REPAIR_USE', label: 'Used in Repair' },
//     { value: 'DAMAGED', label: 'Damaged' },
//     { value: 'LOST', label: 'Lost' },
//     { value: 'EXPIRED', label: 'Expired' },
//     { value: 'DISPOSAL', label: 'Disposal' },
//     { value: 'OTHER', label: 'Other' }
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setDeductData(prev => ({
//       ...prev,
//       [name]: name === 'quantityUsed' ? parseInt(value) : value
//     }));
//   };

//   const handleSerialToggle = (serial) => {
//     setSelectedSerials(prev => {
//       if (prev.find(s => s.id === serial.id)) {
//         return prev.filter(s => s.id !== serial.id);
//       } else {
//         return [...prev, serial];
//       }
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (item.hasSerialization && item.serials && item.serials.length > 0) {
//       if (selectedSerials.length === 0) {
//         alert('Please select serial numbers to deduct');
//         return;
//       }
//       deductData.serialNumbers = selectedSerials.map(s => s.serialNumber);
//     } else {
//       if (deductData.quantityUsed <= 0 || deductData.quantityUsed > item.quantity) {
//         alert('Invalid quantity');
//         return;
//       }
//     }

//     onDeduct(deductData);
//   };

//   const availableSerials = item.serials?.filter(s => s.status === 'AVAILABLE') || [];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
//         <div className="bg-orange-600 text-white p-6 flex justify-between items-center sticky top-0">
//           <h3 className="text-xl font-bold">Use Item for Repair</h3>
//           <button onClick={onClose} className="text-white hover:bg-orange-700 p-1 rounded">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
//             <p className="text-sm font-medium text-gray-700">Item</p>
//             <p className="text-lg font-bold text-orange-900">{item.name}</p>
//             <p className="text-sm text-orange-700 mt-1">Available: {item.quantity}</p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Deduction</label>
//             <select
//               name="reason"
//               value={deductData.reason}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             >
//               {reasons.map(reason => (
//                 <option key={reason.value} value={reason.value}>
//                   {reason.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* If item has serialization */}
//           {item.hasSerialization && availableSerials.length > 0 ? (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Serial Numbers ({selectedSerials.length} selected)
//               </label>
//               <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
//                 {availableSerials.map(serial => (
//                   <label key={serial.id} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={selectedSerials.some(s => s.id === serial.id)}
//                       onChange={() => handleSerialToggle(serial)}
//                       className="h-4 w-4 text-orange-600 border-gray-300 rounded"
//                     />
//                     <span className="ml-2 text-sm text-gray-700">{serial.serialNumber}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Use</label>
//               <input
//                 type="number"
//                 name="quantityUsed"
//                 value={deductData.quantityUsed}
//                 onChange={handleChange}
//                 min="1"
//                 max={item.quantity}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               />
//               <p className="text-xs text-gray-600 mt-1">Max available: {item.quantity}</p>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
//             <textarea
//               name="notes"
//               value={deductData.notes}
//               onChange={handleChange}
//               rows="2"
//               placeholder="Add any additional notes..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium"
//             >
//               Confirm Use
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default DeductStockModal;

import { useState, useEffect, useRef } from 'react';
import { useApi } from '../services/apiService';

const DeductStockModal = ({ item, onDeduct, onClose }) => {
  const { apiCall } = useApi();
  const [deductData, setDeductData] = useState({
    quantityUsed: 1,
    reason: 'REPAIR_USE',
    serialNumbers: [],
    notes: ''
  });
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const searchInputRef = useRef(null);
  const scannerTimeoutRef = useRef(null);

  const reasons = [
    { value: 'REPAIR_USE', label: 'Used in Repair' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'LOST', label: 'Lost' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'DISPOSAL', label: 'Disposal' },
    { value: 'OTHER', label: 'Other' }
  ];

  // ✅ Fetch available serials when modal opens
  useEffect(() => {
    if (item.hasSerialization) {
      fetchAvailableSerials();
    }
  }, [item.id]);

  // ✅ Filter serials based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSerials(availableSerials);
    } else {
      const filtered = availableSerials.filter(serial =>
        serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSerials(filtered);
    }
  }, [searchTerm, availableSerials]);

  // ✅ Barcode scanner handler - detects rapid typing (scanner input)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Clear previous timeout
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }

      // Add character to scanner input
      if (e.key.length === 1) {
        setScannerInput(prev => prev + e.key);
      }

      // Set timeout to process scanner input (scanners type very fast)
      scannerTimeoutRef.current = setTimeout(() => {
        if (scannerInput.length > 3) { // Minimum length for valid scan
          handleBarcodeScan(scannerInput + e.key);
        }
        setScannerInput('');
      }, 100); // 100ms timeout - scanner input is faster than human typing
    };

    // Add global keypress listener
    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, [scannerInput, availableSerials, selectedSerials]);

  const fetchAvailableSerials = async () => {
    setLoadingSerials(true);
    try {
      const serials = await apiCall(`/api/inventory/${item.id}/serials/available`);
      setAvailableSerials(serials || []);
      setFilteredSerials(serials || []);
    } catch (error) {
      console.error('Error fetching serials:', error);
      setAvailableSerials([]);
      setFilteredSerials([]);
    } finally {
      setLoadingSerials(false);
    }
  };

  const handleBarcodeScan = (scannedValue) => {
    console.log('Barcode scanned:', scannedValue);
    
    // Find serial in available serials
    const foundSerial = availableSerials.find(
      serial => serial.serialNumber.toLowerCase() === scannedValue.toLowerCase().trim()
    );

    if (foundSerial) {
      // Check if already selected
      if (!selectedSerials.some(s => s.id === foundSerial.id)) {
        setSelectedSerials(prev => [...prev, foundSerial]);
        showScanFeedback('success', `Added: ${foundSerial.serialNumber}`);
        
        // Highlight the scanned serial briefly
        setSearchTerm(foundSerial.serialNumber);
        setTimeout(() => setSearchTerm(''), 2000);
      } else {
        showScanFeedback('warning', `Already selected: ${foundSerial.serialNumber}`);
      }
    } else {
      showScanFeedback('error', `Serial not found: ${scannedValue}`);
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeductData(prev => ({
      ...prev,
      [name]: name === 'quantityUsed' ? parseInt(value) : value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    // If user presses Enter on search, try to select the first filtered result
    if (e.key === 'Enter' && filteredSerials.length > 0) {
      e.preventDefault();
      const firstSerial = filteredSerials[0];
      if (!selectedSerials.some(s => s.id === firstSerial.id)) {
        handleSerialToggle(firstSerial);
        setSearchTerm('');
      }
    }
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

  const handleSelectAll = () => {
    if (selectedSerials.length === filteredSerials.length) {
      // Deselect all filtered
      setSelectedSerials(prev => 
        prev.filter(s => !filteredSerials.some(fs => fs.id === s.id))
      );
    } else {
      // Select all filtered
      const newSelections = filteredSerials.filter(
        fs => !selectedSerials.some(s => s.id === fs.id)
      );
      setSelectedSerials(prev => [...prev, ...newSelections]);
    }
  };

  const handleClearSelection = () => {
    setSelectedSerials([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation for serialized items
    if (item.hasSerialization) {
      if (selectedSerials.length === 0) {
        alert('Please select at least one serial number');
        return;
      }
      // Set serial numbers in deductData
      deductData.serialNumbers = selectedSerials.map(s => s.serialNumber);
      deductData.quantityUsed = selectedSerials.length;
    } else {
      // ✅ Validation for non-serialized items
      if (deductData.quantityUsed <= 0 || deductData.quantityUsed > item.quantity) {
        alert(`Invalid quantity. Available: ${item.quantity}`);
        return;
      }
    }

    onDeduct(deductData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-orange-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold">Use Item</h3>
            <p className="text-sm text-orange-100 mt-1">
              {item.hasSerialization && '📱 Barcode scanner ready'}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-orange-700 p-2 rounded-full transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Info */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-gray-700">Item</p>
            <p className="text-lg font-bold text-orange-900">{item.name}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-orange-700">Available: {item.quantity}</p>
              {item.hasSerialization && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                  Serialized Item
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Use *
            </label>
            <select
              name="reason"
              value={deductData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              {reasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Serial Selection for Serialized Items */}
          {item.hasSerialization ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Serial Numbers * ({selectedSerials.length} selected)
                </label>
                {selectedSerials.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* ✅ Search Bar with Barcode Scanner Support */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="🔍 Search or scan serial number..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <svg 
                    className="absolute left-3 top-3 w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {searchTerm && (
                  <p className="text-xs text-gray-600 mt-1">
                    Showing {filteredSerials.length} of {availableSerials.length} serials
                  </p>
                )}

                {/* Quick Actions */}
                {filteredSerials.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      {selectedSerials.length === filteredSerials.length ? '☑ Deselect All' : '☐ Select All'}
                    </button>
                    <span className="text-xs text-gray-500">
                      Press Enter after search to quick-select
                    </span>
                  </div>
                )}
              </div>
              
              {loadingSerials ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading serials...</p>
                </div>
              ) : availableSerials.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-sm text-red-700 font-medium">No available serial numbers</p>
                  <p className="text-xs text-red-600 mt-1">All serials for this item have been used</p>
                </div>
              ) : filteredSerials.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                  <p className="text-sm text-yellow-700 font-medium">No matching serials found</p>
                  <p className="text-xs text-yellow-600 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                  {filteredSerials.map(serial => (
                    <label 
                      key={serial.id} 
                      className={`flex items-center p-3 rounded cursor-pointer transition-all ${
                        selectedSerials.some(s => s.id === serial.id)
                          ? 'bg-orange-100 border-2 border-orange-400'
                          : 'bg-white hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSerials.some(s => s.id === serial.id)}
                        onChange={() => handleSerialToggle(serial)}
                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-mono flex-1">
                        {serial.serialNumber}
                      </span>
                      {selectedSerials.some(s => s.id === serial.id) && (
                        <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* Selected Serials Preview */}
              {selectedSerials.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs font-medium text-blue-900 mb-2">Selected Serials:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSerials.map(serial => (
                      <span 
                        key={serial.id}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono"
                      >
                        {serial.serialNumber}
                        <button
                          type="button"
                          onClick={() => handleSerialToggle(serial)}
                          className="ml-1 text-blue-600 hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ✅ Quantity Input for Non-Serialized Items */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Use *
              </label>
              <input
                type="number"
                name="quantityUsed"
                value={deductData.quantityUsed}
                onChange={handleChange}
                min="1"
                max={item.quantity}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Max available: {item.quantity}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={deductData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">📋 Summary:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {item.hasSerialization ? (
                <>
                  <li>• Will use <strong>{selectedSerials.length}</strong> serial number(s)</li>
                  <li>• Remaining stock: <strong>{item.quantity - selectedSerials.length}</strong></li>
                  {selectedSerials.length > 0 && (
                    <li className="text-xs text-blue-600 mt-2">
                      💡 Tip: You can scan more barcodes to add serials
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>• Will deduct <strong>{deductData.quantityUsed}</strong> unit(s)</li>
                  <li>• Remaining stock: <strong>{item.quantity - deductData.quantityUsed}</strong></li>
                </>
              )}
            </ul>
          </div>

          {/* Buttons */}
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
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={item.hasSerialization && selectedSerials.length === 0}
            >
              Confirm Use {selectedSerials.length > 0 && `(${selectedSerials.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeductStockModal;