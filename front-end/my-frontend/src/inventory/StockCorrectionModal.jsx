import { useState, useEffect, useRef } from 'react';
import { apiCall } from '../services/api';

const StockCorrectionModal = ({ item, onCorrect, onClose }) => {
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Barcode scanner state ──
  const scannerInputRef = useRef('');
  const scannerTimeoutRef = useRef(null);

  const estimatedRefund =
    item.purchasePrice && (item.hasSerialization ? selectedSerials.length : quantity) > 0
      ? (item.purchasePrice * (item.hasSerialization ? selectedSerials.length : quantity)).toFixed(2)
      : null;

  // ── Fetch available serials on mount ──
  useEffect(() => {
    if (item.hasSerialization) {
      fetchAvailableSerials();
    }
  }, [item.id]);

  // ── Filter serials based on search term ──
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSerials(availableSerials);
    } else {
      setFilteredSerials(
        availableSerials.filter(s =>
          s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, availableSerials]);

  // ── Barcode scanner: global keypress listener ──
  // Scanners type all characters very fast (within ~150ms) then stop or send Enter
  useEffect(() => {
    if (!item.hasSerialization) return;

    const handleKeyPress = (e) => {
      // Ignore if user is focused on textarea or number input
      const tag = document.activeElement?.tagName?.toLowerCase();
      const type = document.activeElement?.type?.toLowerCase();
      if (tag === 'textarea') return;
      if (tag === 'input' && type === 'number') return;

      // Clear previous timeout
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }

      // Enter key = scanner finished — process immediately
      if (e.key === 'Enter') {
        const scanned = scannerInputRef.current.trim();
        if (scanned.length > 2) {
          handleBarcodeScan(scanned);
        }
        scannerInputRef.current = '';
        return;
      }

      // Accumulate printable characters
      if (e.key.length === 1) {
        scannerInputRef.current += e.key;
      }

      // Fallback: process after 150ms pause (for scanners that don't send Enter)
      scannerTimeoutRef.current = setTimeout(() => {
        const scanned = scannerInputRef.current.trim();
        if (scanned.length > 2) {
          handleBarcodeScan(scanned);
        }
        scannerInputRef.current = '';
      }, 150);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
    };
  }, [availableSerials, selectedSerials, item.hasSerialization]);

  // ── Process a scanned value ──
  const handleBarcodeScan = (scannedValue) => {
    const normalized = scannedValue.toLowerCase().trim();

    const found = availableSerials.find(
      s => s.serialNumber.toLowerCase() === normalized
    );

    if (!found) {
      showScanFeedback('error', `Serial not found: ${scannedValue}`);
      return;
    }

    if (selectedSerials.some(s => s.id === found.id)) {
      showScanFeedback('warning', `Already selected: ${found.serialNumber}`);
      return;
    }

    // Auto-select the scanned serial immediately
    setSelectedSerials(prev => [...prev, found]);
    showScanFeedback('success', `✓ Added: ${found.serialNumber}`);

    // Briefly highlight it in the list
    setSearchTerm(found.serialNumber);
    setTimeout(() => setSearchTerm(''), 1800);
  };

  const showScanFeedback = (type, message) => {
    const colors = {
      success: 'bg-green-600',
      warning: 'bg-yellow-500',
      error: 'bg-red-600',
    };
    const el = document.createElement('div');
    el.className = `fixed top-5 right-5 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl z-[9999] text-sm font-medium`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

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

  const handleSerialToggle = (serial) => {
    setSelectedSerials(prev =>
      prev.find(s => s.id === serial.id)
        ? prev.filter(s => s.id !== serial.id)
        : [...prev, serial]
    );
  };

  const handleSelectAll = () => {
    if (selectedSerials.length === filteredSerials.length) {
      setSelectedSerials(prev =>
        prev.filter(s => !filteredSerials.some(fs => fs.id === s.id))
      );
    } else {
      const newSelections = filteredSerials.filter(
        fs => !selectedSerials.some(s => s.id === fs.id)
      );
      setSelectedSerials(prev => [...prev, ...newSelections]);
    }
  };

  // ── Search box Enter key: select first matching serial ──
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSerials.length > 0) {
        const first = filteredSerials[0];
        if (!selectedSerials.some(s => s.id === first.id)) {
          setSelectedSerials(prev => [...prev, first]);
          showScanFeedback('success', `✓ Added: ${first.serialNumber}`);
        }
        setSearchTerm('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (item.hasSerialization) {
      if (selectedSerials.length === 0) {
        alert('Please select at least one serial number to remove.');
        return;
      }
    } else {
      if (quantity <= 0) {
        alert('Quantity must be greater than 0.');
        return;
      }
      if (quantity > item.quantity) {
        alert(`Cannot deduct more than available stock (${item.quantity}).`);
        return;
      }
    }

    if (!notes.trim()) {
      alert('Please provide a reason for this stock correction.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Stock Correction Confirm\n\n` +
      `Item: ${item.name}\n` +
      (item.hasSerialization
        ? `Serials to remove: ${selectedSerials.length}`
        : `Quantity to deduct: ${quantity}`) +
      `\n\nThis will permanently remove the selected stock and create an expense credit of Rs.${estimatedRefund || '0.00'} under "Inventory Correction".\n\nContinue?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await onCorrect({
        quantity: item.hasSerialization ? selectedSerials.length : quantity,
        serialNumbers: item.hasSerialization ? selectedSerials.map(s => s.serialNumber) : [],
        notes: notes.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deductCount = item.hasSerialization ? selectedSerials.length : quantity;
  const remainingAfter = item.quantity - deductCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-gray-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-5 rounded-t-2xl flex justify-between items-start sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Stock Correction</h3>
            <p className="text-red-100 text-sm mt-1">
              Remove incorrectly added stock &amp; auto-credit expenses
              {item.hasSerialization && (
                <span className="ml-2 bg-red-800 px-2 py-0.5 rounded-full text-xs">
                  📷 Scanner ready
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-800 p-2 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Warning Banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Use this only for data entry mistakes</p>
              <p className="text-xs text-amber-700 mt-0.5">
                e.g. accidentally added 100 items instead of 10. A negative expense credit under <strong>"Inventory Correction"</strong> will be auto-created to reverse the cost.
              </p>
            </div>
          </div>

          {/* Item Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Item</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Current Stock</p>
                <p className={`text-2xl font-bold mt-0.5 ${item.quantity === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.quantity}
                </p>
                {item.hasSerialization && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                    Serialized
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Serial Selection */}
          {item.hasSerialization ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Select Serials to Remove
                  <span className="ml-2 text-red-600 font-bold">({selectedSerials.length} selected)</span>
                </label>
                {selectedSerials.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSerials([])}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Scanner hint */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                <span className="text-blue-500 text-base">📷</span>
                <p className="text-xs text-blue-700">
                  Scan a barcode to auto-select instantly, or search and press{' '}
                  <kbd className="bg-blue-100 border border-blue-300 px-1 rounded text-xs">Enter</kbd> to select.
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search or scan serial number..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {filteredSerials.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="mb-2 text-xs px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  {selectedSerials.length === filteredSerials.length ? '☑ Deselect All' : '☐ Select All Visible'}
                </button>
              )}

              {loadingSerials ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
              ) : availableSerials.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-sm text-red-700">
                  No available serials for this item.
                </div>
              ) : filteredSerials.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-sm text-yellow-700">
                  No serials match your search.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {filteredSerials.map(serial => {
                    const isSelected = selectedSerials.some(s => s.id === serial.id);
                    return (
                      <label
                        key={serial.id}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSerialToggle(serial)}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-400"
                        />
                        <span className="ml-3 text-sm font-mono text-gray-800 flex-1">
                          {serial.serialNumber}
                        </span>
                        {isSelected && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Selected Serials Preview */}
              {selectedSerials.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-semibold text-red-800 mb-2">Serials to be permanently removed:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSerials.map(serial => (
                      <span
                        key={serial.id}
                        className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-lg font-mono"
                      >
                        {serial.serialNumber}
                        <button
                          type="button"
                          onClick={() => handleSerialToggle(serial)}
                          className="ml-1 text-red-500 hover:text-red-800"
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
            /* Non-serialized quantity input */
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity to Remove *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={item.quantity}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: {item.quantity} units</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Correction *
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows="2"
              placeholder="e.g. Accidentally added 100 instead of 10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              required
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">📋 Correction Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Units to remove</span>
              <span className="font-bold text-red-600">- {deductCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock after correction</span>
              <span className={`font-bold ${remainingAfter < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {remainingAfter < 0 ? 'Invalid' : remainingAfter}
              </span>
            </div>
            {estimatedRefund && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Purchase price / unit</span>
                  <span className="text-gray-700">Rs. {item.purchasePrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-green-700">Expense credit (Inventory Correction)</span>
                  <span className="text-green-700">- Rs. {estimatedRefund}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  A negative expense entry labelled <strong>"Inventory Correction"</strong> will be created automatically.
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                (item.hasSerialization && selectedSerials.length === 0) ||
                remainingAfter < 0
              }
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Processing...'
                : `Confirm Correction${deductCount > 0 ? ` (${deductCount} unit${deductCount > 1 ? 's' : ''})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockCorrectionModal;