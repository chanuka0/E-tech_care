
import { useState, useEffect, useRef } from 'react';

const ViewInventoryModal = ({ item, onAddSerial, onImportSerials, onClose }) => {
  // ── Serial tab state ──
  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedSerial, setHighlightedSerial] = useState(null);

  // ── Add serial panel state ──
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addMethod, setAddMethod] = useState('single'); // 'single' | 'paste' | 'file'
  const [singleSerial, setSingleSerial] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [addErrors, setAddErrors] = useState([]);

  // Barcode scanner
  const scannerInputRef = useRef('');
  const scannerTimeoutRef = useRef(null);
  const serialRefs = useRef({});

  const allSerials = item.serials || [];
  const availableSerials = allSerials.filter(s => s.status === 'AVAILABLE');
  const usedSerials      = allSerials.filter(s => s.status === 'USED');
  const soldSerials      = allSerials.filter(s => s.status === 'SOLD');

  const tabConfig = [
    { key: 'AVAILABLE', label: 'Available', count: availableSerials.length, activeBg: 'bg-green-600', activeText: 'text-white', inactiveBg: 'bg-green-50',  inactiveText: 'text-green-700', border: 'border-green-200' },
    { key: 'USED',      label: 'Used',      count: usedSerials.length,      activeBg: 'bg-blue-600',  activeText: 'text-white', inactiveBg: 'bg-blue-50',   inactiveText: 'text-blue-700',  border: 'border-blue-200'  },
    { key: 'SOLD',      label: 'Sold',      count: soldSerials.length,      activeBg: 'bg-red-600',   activeText: 'text-white', inactiveBg: 'bg-red-50',    inactiveText: 'text-red-700',   border: 'border-red-200'   },
  ];

  const getTabSerials = (tab) => {
    switch (tab) {
      case 'AVAILABLE': return availableSerials;
      case 'USED':      return usedSerials;
      case 'SOLD':      return soldSerials;
      default:          return [];
    }
  };

  const displayedSerials = searchTerm.trim()
    ? getTabSerials(activeTab).filter(s =>
        s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : getTabSerials(activeTab);

  // ── Barcode scanner global listener ──
  useEffect(() => {
    const handleKeyPress = (e) => {
      const tag  = document.activeElement?.tagName?.toLowerCase();
      const ph   = document.activeElement?.placeholder || '';
      // Ignore if typing in add-serial inputs or textarea
      if (tag === 'textarea') return;
      if (tag === 'input' && (ph === 'Enter serial number' || ph === 'Search serial in current tab...')) return;

      if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);

      if (e.key === 'Enter') {
        const scanned = scannerInputRef.current.trim();
        if (scanned.length > 1) processScannedSerial(scanned);
        scannerInputRef.current = '';
        return;
      }

      if (e.key.length === 1) scannerInputRef.current += e.key;

      scannerTimeoutRef.current = setTimeout(() => {
        const scanned = scannerInputRef.current.trim();
        if (scanned.length > 1) processScannedSerial(scanned);
        scannerInputRef.current = '';
      }, 150);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
    };
  }, [allSerials]);

  const processScannedSerial = (scannedValue) => {
    const normalized = scannedValue.toLowerCase().trim();
    const found = allSerials.find(s => s.serialNumber.toLowerCase() === normalized);

    if (!found) {
      showToast('error', `Serial not found: ${scannedValue}`);
      return;
    }

    setActiveTab(found.status);
    setSearchTerm('');

    setTimeout(() => {
      setHighlightedSerial(found.id);
      const el = serialRefs.current[found.id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('success', `Found: ${found.serialNumber} → ${found.status}`);
      setTimeout(() => setHighlightedSerial(null), 3000);
    }, 80);
  };

  const showToast = (type, message) => {
    const colors = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-yellow-500' };
    const el = document.createElement('div');
    el.className = `fixed top-5 right-5 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl z-[9999] text-sm font-medium`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  };

  // ── Duplicate validation (checks against item.serials) ──
  const validateSerials = (serials) => {
    const errors = [];
    const existingNumbers = allSerials.map(s => s.serialNumber.toLowerCase().trim());
    const duplicatesInDB = [];
    const duplicatesInInput = [];
    const seen = new Set();

    serials.forEach((serial, index) => {
      const t = serial.toLowerCase().trim();
      if (existingNumbers.includes(t)) {
        duplicatesInDB.push({ serial, line: index + 1 });
      }
      if (seen.has(t)) {
        duplicatesInInput.push({ serial, line: index + 1 });
      } else {
        seen.add(t);
      }
    });

    if (duplicatesInDB.length > 0) {
      errors.push({ type: 'database', count: duplicatesInDB.length, items: duplicatesInDB.slice(0, 10), message: `${duplicatesInDB.length} serial(s) already exist` });
    }
    if (duplicatesInInput.length > 0) {
      errors.push({ type: 'input', count: duplicatesInInput.length, items: duplicatesInInput.slice(0, 10), message: `${duplicatesInInput.length} duplicate(s) in your input` });
    }
    return errors;
  };

  // ── Add handlers ──
  const handleSingleAdd = (e) => {
    e.preventDefault();
    const trimmed = singleSerial.trim();
    if (!trimmed) return;
    const exists = allSerials.some(s => s.serialNumber.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setAddErrors([{ type: 'database', count: 1, items: [{ serial: trimmed, line: 1 }], message: 'Serial already exists' }]);
      return;
    }
    onAddSerial(trimmed);
    setSingleSerial('');
    setAddErrors([]);
    setShowAddPanel(false);
  };

  const handlePasteImport = () => {
    const serials = bulkText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (serials.length === 0) { alert('Please enter at least one serial number'); return; }
    const errs = validateSerials(serials);
    if (errs.length > 0) { setAddErrors(errs); return; }
    onImportSerials(serials);
    setBulkText('');
    setAddErrors([]);
    setShowAddPanel(false);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const serials = event.target.result.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      if (serials.length === 0) { alert('No valid serial numbers found in file'); return; }
      const errs = validateSerials(serials);
      if (errs.length > 0) { setAddErrors(errs); setBulkText(event.target.result); return; }
      onImportSerials(serials);
      setAddErrors([]);
      setShowAddPanel(false);
    };
    reader.readAsText(file);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  const statusBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border border-green-200';
      case 'USED':      return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SOLD':      return 'bg-red-100 text-red-800 border border-red-200';
      default:          return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const referenceLabel = (serial) => {
    if (!serial.usedInReferenceType) return null;
    switch (serial.usedInReferenceType) {
      case 'JOB_CARD': return { icon: '🔧', label: 'Job Card', value: serial.usedInReferenceNumber };
      case 'INVOICE':  return { icon: '🧾', label: 'Invoice',  value: serial.usedInReferenceNumber };
      default:         return { icon: '📄', label: serial.usedInReferenceType, value: serial.usedInReferenceNumber };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-indigo-200 text-sm mt-0.5">SKU: {item.sku}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-2 rounded-full transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Item Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SKU</p>
              <p className="font-semibold text-gray-900">{item.sku}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
              <p className="font-semibold text-gray-900">{item.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
              <p className={`text-2xl font-bold ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-green-600'}`}>
                {item.quantity}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Min Threshold</p>
              <p className="text-lg font-semibold text-gray-900">{item.minThreshold}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-5">
            <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Purchase</p>
                <p className="text-lg font-bold text-blue-600">Rs.{item.purchasePrice?.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Selling</p>
                <p className="text-lg font-bold text-green-600">Rs.{item.sellingPrice?.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">Special</p>
                <p className="text-lg font-bold text-purple-600">Rs.{item.specialPrice?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="border-t pt-5">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          )}

          {/* ── Serial Numbers Section ── */}
          {item.hasSerialization && (
            <div className="border-t pt-5">

              {/* Section header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">
                  Serial Numbers
                  <span className="ml-2 text-sm font-normal text-gray-500">({allSerials.length} total)</span>
                </h4>
                <button
                  onClick={() => { setShowAddPanel(!showAddPanel); setAddErrors([]); }}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
                >
                  {showAddPanel ? 'Cancel' : '+ Add Serial'}
                </button>
              </div>

              {/* ── Add Serial Panel ── */}
              {showAddPanel && (
                <div className="mb-5 border border-indigo-200 rounded-xl overflow-hidden">

                  {/* Method tabs */}
                  <div className="flex border-b border-indigo-100 bg-indigo-50">
                    {[
                      { key: 'single', label: '➕ Single' },
                      { key: 'paste',  label: '📋 Paste Bulk' },
                      { key: 'file',   label: '📁 Upload File' },
                    ].map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => { setAddMethod(m.key); setAddErrors([]); }}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          addMethod === m.key
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-white">

                    {/* ── Duplicate Errors ── */}
                    {addErrors.length > 0 && (
                      <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
                        <p className="text-sm font-bold text-red-800 mb-2">❌ Duplicate Serial Numbers Detected!</p>
                        {addErrors.map((err, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <p className="text-xs font-semibold text-red-700 mb-1">
                              {err.type === 'database' ? '🗄 Already in database' : '⚠️ Duplicates in your input'}
                              <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-xs">{err.count}</span>
                            </p>
                            <div className="space-y-1 max-h-28 overflow-y-auto">
                              {err.items.map((it, i) => (
                                <p key={i} className="text-xs font-mono bg-white border border-red-200 px-2 py-1 rounded text-red-800">
                                  <span className="text-red-500 font-bold">Line {it.line}:</span> {it.serial}
                                </p>
                              ))}
                              {err.count > 10 && (
                                <p className="text-xs text-red-600 italic">... and {err.count - 10} more</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
                          💡 Remove the duplicates from your list and try again.
                        </p>
                      </div>
                    )}

                    {/* ── Single ── */}
                    {addMethod === 'single' && (
                      <form onSubmit={handleSingleAdd} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Serial Number *</label>
                          <input
                            type="text"
                            value={singleSerial}
                            onChange={e => { setSingleSerial(e.target.value); setAddErrors([]); }}
                            placeholder="Enter serial number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Add Serial
                        </button>
                      </form>
                    )}

                    {/* ── Paste Bulk ── */}
                    {addMethod === 'paste' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Paste Serial Numbers (one per line)
                          </label>
                          <textarea
                            value={bulkText}
                            onChange={e => { setBulkText(e.target.value); setAddErrors([]); }}
                            rows="6"
                            placeholder={'SN001\nSN002\nSN003\n...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Lines: {bulkText.split('\n').filter(s => s.trim()).length}
                          </p>
                        </div>
                        <button
                          onClick={handlePasteImport}
                          disabled={bulkText.trim().length === 0}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Import Serials
                        </button>
                      </div>
                    )}

                    {/* ── Upload File ── */}
                    {addMethod === 'file' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Upload .txt or .csv file</label>
                          <input
                            type="file"
                            accept=".txt,.csv"
                            onChange={handleFileImport}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">File format:</p>
                          <pre className="text-xs text-gray-600 font-mono">SN001{'\n'}SN002{'\n'}SN003</pre>
                          <p className="text-xs text-gray-500 mt-1">One serial number per line</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scanner hint */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                <span className="text-blue-500">📷</span>
                <p className="text-xs text-blue-700">
                  Scan a barcode to auto-find and highlight the serial across all tabs.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search serial in current tab..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 mb-4">
                {tabConfig.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActiveTab(tab.key); setSearchTerm(''); setHighlightedSerial(null); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                      activeTab === tab.key
                        ? `${tab.activeBg} ${tab.activeText} border-transparent shadow-sm`
                        : `${tab.inactiveBg} ${tab.inactiveText} ${tab.border} hover:opacity-80`
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                      activeTab === tab.key ? 'bg-white bg-opacity-30' : 'bg-white'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Serial Cards */}
              {displayedSerials.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">
                    {searchTerm ? `No serials match "${searchTerm}"` : `No ${activeTab.toLowerCase()} serials`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedSerials.map(serial => {
                    const isHighlighted = highlightedSerial === serial.id;
                    const ref = referenceLabel(serial);
                    return (
                      <div
                        key={serial.id}
                        ref={el => serialRefs.current[serial.id] = el}
                        className={`p-4 rounded-xl border transition-all duration-500 ${
                          isHighlighted
                            ? 'bg-yellow-50 border-yellow-400 shadow-md ring-2 ring-yellow-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-mono font-semibold text-sm ${isHighlighted ? 'text-yellow-900' : 'text-gray-900'}`}>
                            {isHighlighted && <span className="mr-1">👉</span>}
                            {serial.serialNumber}
                          </p>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusBadgeStyle(serial.status)}`}>
                            {serial.status}
                          </span>
                        </div>
                        {(serial.usedAt || serial.usedBy || ref || serial.notes) && (
                          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
                            {serial.usedAt && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-gray-400">🕐</span>
                                <span className="font-medium">Date:</span>
                                <span>{formatDateTime(serial.usedAt)}</span>
                              </div>
                            )}
                            {serial.usedBy && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-gray-400">👤</span>
                                <span className="font-medium">By:</span>
                                <span>{serial.usedBy}</span>
                              </div>
                            )}
                            {ref && ref.value && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-gray-400">{ref.icon}</span>
                                <span className="font-medium">{ref.label}:</span>
                                <span className="font-mono text-indigo-700 font-semibold">{ref.value}</span>
                              </div>
                            )}
                            {serial.notes && (
                              <div className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-gray-400 mt-0.5">📝</span>
                                <span className="font-medium">Notes:</span>
                                <span className="flex-1 text-gray-500">{serial.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3 text-right">
                Showing {displayedSerials.length} of {getTabSerials(activeTab).length} {activeTab.toLowerCase()} serials
              </p>
            </div>
          )}

          {/* Close */}
          <div className="border-t pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
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