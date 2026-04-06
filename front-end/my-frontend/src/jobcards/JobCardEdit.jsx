
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiCall, API_ENDPOINTS } from '../services/api';
import CancelOrderModal from './CancelOrderModal';
import { useApi } from '../services/apiService';

// ── Searchable Inventory Item Autocomplete (Portal-based dropdown) ─────────────
const ItemSearch = ({ inventoryItems, selectedItemId, onSelect, onClear, isRegularCustomer }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedItem = inventoryItems.find(i => i.id === selectedItemId);

  const updateDropdownPosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (selectedItem) {
      setQuery(`${selectedItem.sku} - ${selectedItem.name}`);
    } else {
      setQuery('');
    }
  }, [selectedItemId, inventoryItems]);

  useEffect(() => {
    const handler = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !document.getElementById('item-search-portal')?.contains(e.target)
      ) {
        setOpen(false);
        if (selectedItem) {
          setQuery(`${selectedItem.sku} - ${selectedItem.name}`);
        } else {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedItem]);

  // Reposition on scroll or resize while open
  useEffect(() => {
    if (!open) return;
    const reposition = () => updateDropdownPosition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const getEffectivePrice = (item) => {
    if (isRegularCustomer && item.specialPrice != null) return item.specialPrice;
    return item.sellingPrice || 0;
  };

  const filtered = query.trim() && !selectedItem
    ? inventoryItems.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.sku && i.sku.toLowerCase().includes(query.toLowerCase()))
      )
    : query.trim() && selectedItem
    ? inventoryItems.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.sku && i.sku.toLowerCase().includes(query.toLowerCase()))
      )
    : inventoryItems;

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    updateDropdownPosition();
    setOpen(true);
    if (selectedItem) onClear();
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(`${item.sku} - ${item.name}`);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    setOpen(false);
  };

  const dropdown = open && (
    <ul
      id="item-search-portal"
      style={dropdownStyle}
      className="bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-y-auto text-xs"
    >
      {filtered.length > 0 ? (
        filtered.map((item) => {
          const price = getEffectivePrice(item);
          const hasSpecial = isRegularCustomer && item.specialPrice != null;
          return (
            <li
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              className="px-2 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {item.hasSerialization && <span className="text-blue-500 mr-1">🔢</span>}
                    {hasSpecial && <span className="text-amber-500 mr-1">⭐</span>}
                    {item.sku} - {item.name}
                  </p>
                  <p className="text-gray-400 mt-0.5">Stock: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {hasSpecial ? (
                    <div>
                      <p className="font-bold text-blue-700">Rs.{price?.toFixed(2)}</p>
                      <p className="text-gray-400 line-through text-xs">Rs.{item.sellingPrice?.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="font-bold text-gray-700">Rs.{price?.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })
      ) : (
        <li className="px-2 py-2 text-gray-400 italic">No items found</li>
      )}
    </ul>
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { updateDropdownPosition(); setOpen(true); }}
          placeholder="Search by SKU or item name..."
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white pr-6"
          autoComplete="off"
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        />
        {(query || selectedItem) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {createPortal(dropdown, document.body)}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [faults, setFaults] = useState([]);
  const [services, setServices] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [allModelNumbers, setAllModelNumbers] = useState([]);
  const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [isRegularCustomer, setIsRegularCustomer] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    deviceType: 'LAPTOP', brandId: '', modelId: '', modelNumberId: '', processorId: '',
    deviceConditionIds: [], faultDescription: '', notes: '',
    advancePayment: 0, estimatedCost: 0, status: 'PENDING',
    usedItems: [], selectedFaults: [], selectedServices: [],
    oneDayService: false, withCharger: false,
  });

  const noProcessorTypes = ['PRINTER', 'PROJECTOR'];
  const hasProcessor = !noProcessorTypes.includes(formData.deviceType);
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'DELIVERED'];

  const getServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice || 0;
  };

  const calcTotal = () => formData.selectedServices.reduce((sum, s) => sum + (s.effectivePrice ?? s.servicePrice ?? 0), 0);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
        e.preventDefault(); e.stopPropagation(); return false;
      }
    };
    document.addEventListener('keydown', h, true);
    return () => document.removeEventListener('keydown', h, true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fd, sd, id, bd, md, mnd, pd, cd] = await Promise.all([
          apiCall('/api/faults'), apiCall('/api/service-categories'), apiCall('/api/inventory'),
          apiCall('/api/brands'), apiCall('/api/models'), apiCall('/api/model-numbers'),
          apiCall('/api/processors'), apiCall('/api/device-conditions')
        ]);
        setFaults((fd || []).filter(i => i.isActive));
        setServices((sd || []).filter(i => i.isActive));
        setInventoryItems(id || []);
        setBrands((bd || []).filter(i => i.isActive));
        setAllModels((md || []).filter(i => i.isActive));
        setAllModelNumbers((mnd || []).filter(i => i.isActive));
        setProcessors((pd || []).filter(i => i.isActive));
        setDeviceConditions((cd || []).filter(i => i.isActive));
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        setFetchLoading(true);
        const data = await apiCall(`/api/jobcards/${jobCardId}`);
        const isRegular = data.isRegularCustomer || false;
        setIsRegularCustomer(isRegular);

        const servicesWithPrices = (data.serviceCategories || []).map(s => ({
          ...s,
          effectivePrice: getServicePrice(s, isRegular)
        }));

        setFormData({
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          deviceType: data.deviceType || 'LAPTOP',
          brandId: data.brand?.id || '',
          modelId: data.model?.id || '',
          modelNumberId: data.modelNumber?.id || '',
          processorId: data.processor?.id || '',
          deviceConditionIds: data.deviceConditions?.map(dc => dc.id) || [],
          faultDescription: data.faultDescription || '',
          notes: data.notes || '',
          advancePayment: data.advancePayment || 0,
          estimatedCost: data.estimatedCost || 0,
          status: data.status || 'PENDING',
          usedItems: data.usedItems?.map(i => ({ ...i, usedSerialNumbers: i.usedSerialNumbers || [] })) || [],
          selectedFaults: data.faults?.map(f => f.id) || [],
          selectedServices: servicesWithPrices,
          oneDayService: data.oneDayService || false,
          withCharger: data.withCharger || false,
        });
        setOriginalData(data);
      } catch (e) {
        setError('Failed to load job card');
        console.error(e);
      } finally {
        setFetchLoading(false);
      }
    };
    if (jobCardId) fetchJobCard();
  }, [jobCardId]);

  useEffect(() => {
    if (formData.brandId) {
      setFilteredModels(allModels.filter(m => m.brand?.id === parseInt(formData.brandId) && m.isActive));
      if (originalData?.brand?.id !== parseInt(formData.brandId)) {
        setFormData(p => ({ ...p, modelId: '', modelNumberId: '' }));
        setFilteredModelNumbers([]);
      }
    } else {
      setFilteredModels([]);
      setFormData(p => ({ ...p, modelId: '', modelNumberId: '' }));
      setFilteredModelNumbers([]);
    }
  }, [formData.brandId, allModels, originalData]);

  useEffect(() => {
    if (formData.modelId) {
      setFilteredModelNumbers(allModelNumbers.filter(mn => mn.model?.id === parseInt(formData.modelId) && mn.isActive));
      if (originalData?.model?.id !== parseInt(formData.modelId)) setFormData(p => ({ ...p, modelNumberId: '' }));
    } else {
      setFilteredModelNumbers([]);
      setFormData(p => ({ ...p, modelNumberId: '' }));
    }
  }, [formData.modelId, allModelNumbers, originalData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'deviceType') return;
    const u = { ...formData, [name]: type === 'checkbox' ? checked : value };
    if (name === 'brandId') { u.modelId = ''; u.modelNumberId = ''; setFilteredModelNumbers([]); }
    if (name === 'modelId') u.modelNumberId = '';
    setFormData(u);
    setError('');
  };

  const addFault = (id) => {
    if (!id) return;
    if (formData.selectedFaults.includes(parseInt(id))) { setError('Already selected'); return; }
    setFormData(p => ({ ...p, selectedFaults: [...p.selectedFaults, parseInt(id)] }));
    setError('');
  };
  const removeFault = (id) => setFormData(p => ({ ...p, selectedFaults: p.selectedFaults.filter(f => f !== id) }));

  const addService = (id) => {
    if (!id) return;
    const s = services.find(x => x.id === parseInt(id));
    if (!s || formData.selectedServices.some(x => x.id === parseInt(id))) { setError('Already selected'); return; }
    const effectivePrice = getServicePrice(s, isRegularCustomer);
    setFormData(p => ({ ...p, selectedServices: [...p.selectedServices, { ...s, effectivePrice }] }));
    setError('');
  };
  const removeService = (id) => setFormData(p => ({ ...p, selectedServices: p.selectedServices.filter(s => s.id !== id) }));

  const addCond = (id) => {
    if (!id) return;
    if (formData.deviceConditionIds.includes(parseInt(id))) { setError('Already selected'); return; }
    setFormData(p => ({ ...p, deviceConditionIds: [...p.deviceConditionIds, parseInt(id)] }));
    setError('');
  };
  const removeCond = (id) => setFormData(p => ({ ...p, deviceConditionIds: p.deviceConditionIds.filter(c => c !== id) }));

  const addUsedItem = (itemId, qty, serials = []) => {
    if (!itemId || !qty) { setError('Select item and quantity'); return; }
    const item = inventoryItems.find(i => i.id === parseInt(itemId));
    if (!item) return;
    if (item.hasSerialization && serials.length !== parseInt(qty)) { setError(`Select exactly ${qty} serial(s)`); return; }
    if (!item.hasSerialization && parseInt(qty) > item.quantity) { setError(`Only ${item.quantity} available`); return; }

    const unitPrice = (isRegularCustomer && item.specialPrice != null) ? item.specialPrice : item.sellingPrice;

    setFormData(p => ({
      ...p,
      usedItems: [...p.usedItems, {
        inventoryItemId: parseInt(itemId),
        inventoryItem: item,
        quantityUsed: parseInt(qty),
        unitPrice,
        usedSerialNumbers: serials,
        isSpecialPrice: isRegularCustomer && item.specialPrice != null
      }]
    }));
    setError('');
  };
  const removeUsedItem = (i) => setFormData(p => ({ ...p, usedItems: p.usedItems.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.customerName.trim()) { setError('Customer name required'); setLoading(false); return; }
    if (!formData.customerPhone.trim()) { setError('Customer phone required'); setLoading(false); return; }
    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deviceType: formData.deviceType,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        modelId: formData.modelId ? parseInt(formData.modelId) : null,
        modelNumberId: formData.modelNumberId ? parseInt(formData.modelNumberId) : null,
        processorId: hasProcessor && formData.processorId ? parseInt(formData.processorId) : null,
        deviceConditionIds: formData.deviceConditionIds,
        faultIds: formData.selectedFaults,
        serviceCategoryIds: formData.selectedServices.map(s => s.id),
        faultDescription: formData.faultDescription,
        notes: formData.notes,
        advancePayment: parseFloat(formData.advancePayment) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        status: formData.status,
        oneDayService: formData.oneDayService,
        withCharger: formData.withCharger,
        usedItems: formData.usedItems.map(i => ({
          id: i.id || null,
          inventoryItemId: i.inventoryItem.id,
          quantityUsed: i.quantityUsed,
          unitPrice: i.unitPrice,
          usedSerialNumbers: i.usedSerialNumbers || []
        }))
      };
      const response = await apiCall(`/api/jobcards/${jobCardId}`, { method: 'PUT', body: JSON.stringify(payload) });
      const m = document.createElement('div');
      m.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      m.textContent = 'Job Card updated!';
      document.body.appendChild(m);
      setTimeout(() => m.remove(), 3000);
      if (onSuccess) onSuccess(response);
    } catch (e) {
      setError(e.message || 'Failed to update');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const inp = "w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
  const lbl = "block text-xs font-medium text-gray-600 mb-0.5";
  const ttl = "text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";
  const sc = (s) => {
    const m = {
      PENDING: 'bg-yellow-100 text-yellow-800', IN_PROGRESS: 'bg-blue-100 text-blue-800',
      WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800', WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800', DELIVERED: 'bg-indigo-100 text-indigo-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return m[s] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* HEADER */}
      <div className="flex-none bg-white border-b-2 border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Edit Job Card</h2>
          {originalData && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono border border-gray-200">
              {originalData.jobNumber}
            </span>
          )}
          {isRegularCustomer && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
              ⭐ Regular Customer – Special Pricing
            </span>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

        {/* STATUS DROPDOWN */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            className={`px-2.5 py-1 rounded text-xs font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-colors ${sc(formData.status)}`}
            style={{ borderColor: 'currentColor' }}
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>
                {s === 'WAITING_FOR_PARTS' ? '⏳ Waiting for Parts'
                  : s === 'WAITING_FOR_APPROVAL' ? '👥 Waiting for Approval'
                  : s === 'IN_PROGRESS' ? '🔧 In Progress'
                  : s === 'PENDING' ? '🕐 Pending'
                  : s === 'COMPLETED' ? '✅ Completed'
                  : s === 'DELIVERED' ? '📦 Delivered'
                  : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

        {/* ONE DAY SERVICE */}
        <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded border-2 cursor-pointer text-xs font-semibold transition-all select-none flex-shrink-0
          ${formData.oneDayService ? 'bg-red-500 border-red-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'}`}>
          <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="sr-only" />
          🚨 1-Day Service
        </label>

        {/* WITH CHARGER */}
        <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded border-2 cursor-pointer text-xs font-semibold transition-all select-none flex-shrink-0
          ${formData.withCharger ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-500'}`}>
          <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="sr-only" />
          🔌 With Charger
        </label>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

        {/* CANCEL JOB CARD */}
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded border-2 border-red-600 hover:border-red-700 transition-colors flex-shrink-0"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Job
        </button>

        <div className="flex-1 min-w-0" />

        <div className="flex items-center gap-2 flex-shrink-0">
          {error && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">
              {error}
            </span>
          )}
          {onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') e.preventDefault(); }}>
        <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

          {/* COL 1: Customer Info + Device Info */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <div className={ttl}>Customer Info</div>
                {isRegularCustomer && (
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium">⭐ Regular</span>
                )}
              </div>
              <div className="space-y-1">
                <div>
                  <label className={lbl}>Name <span className="text-red-500">*</span></label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                </div>
                <div>
                  <label className={lbl}>Phone <span className="text-red-500">*</span></label>
                  <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                </div>
                {isRegularCustomer && (
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    <p className="text-xs text-blue-700 font-medium">⭐ Special pricing is applied to services and items for this regular customer.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white flex-1 overflow-y-auto">
              <div className={ttl}>Device Info</div>
              <div className="space-y-1">
                <div>
                  <label className={lbl}>Type <span className="text-xs text-amber-500 font-normal">🔒 locked</span></label>
                  <div className="w-full px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-semibold flex items-center justify-between">
                    <span>{formData.deviceType}</span><span className="text-amber-400">🔒</span>
                  </div>
                  <p className="text-xs text-amber-500 mt-0.5 italic">Cannot change device type after creation</p>
                </div>
                <div>
                  <label className={lbl}>Brand</label>
                  <select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Model</label>
                  <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                    <option value="">{formData.brandId ? 'Select Model' : 'Select Brand first'}</option>
                    {filteredModels.map(m => <option key={m.id} value={m.id}>{m.modelName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Model No.</label>
                  <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                    <option value="">{formData.modelId ? 'Select Model No.' : 'Select Model first'}</option>
                    {filteredModelNumbers.map(mn => <option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
                  </select>
                </div>
                {hasProcessor ? (
                  <div>
                    <label className={lbl}>Processor</label>
                    <select name="processorId" value={formData.processorId} onChange={handleChange} className={inp}>
                      <option value="">Select Processor</option>
                      {processors.map(p => <option key={p.id} value={p.id}>{p.processorName}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    <p className="text-xs text-amber-600 italic">⚠️ {formData.deviceType} has no processor</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COL 2: Conditions + Faults + Services */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-yellow-200 rounded p-2 bg-yellow-50">
              <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
              <select onChange={(e) => addCond(e.target.value)} className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                <option value="">-- Select condition --</option>
                {deviceConditions.map(c => <option key={c.id} value={c.id}>{c.conditionName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                {formData.deviceConditionIds.map(id => {
                  const c = deviceConditions.find(x => x.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">
                      {c?.conditionName}
                      <button type="button" onClick={() => removeCond(id)} className="text-yellow-600 hover:text-yellow-900 font-bold ml-0.5">✕</button>
                    </span>
                  );
                })}
                {formData.deviceConditionIds.length === 0 && <p className="text-xs text-yellow-500 italic">None selected</p>}
              </div>
            </div>

            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults</div>
              <select onChange={(e) => addFault(e.target.value)} className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                <option value="">-- Select fault --</option>
                {faults.map(f => <option key={f.id} value={f.id}>{f.faultName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                {formData.selectedFaults.map(id => {
                  const f = faults.find(x => x.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
                      {f?.faultName}
                      <button type="button" onClick={() => removeFault(id)} className="text-red-600 hover:text-red-900 font-bold ml-0.5">✕</button>
                    </span>
                  );
                })}
                {formData.selectedFaults.length === 0 && <p className="text-xs text-red-400 italic">None selected</p>}
              </div>
            </div>

            <div className="border border-green-200 rounded p-2 bg-green-50 flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Services</div>
                {isRegularCustomer && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special Price</span>
                )}
              </div>
              <select onChange={(e) => addService(e.target.value)} className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                <option value="">-- Select service --</option>
                {services.map(s => {
                  const price = getServicePrice(s, isRegularCustomer);
                  const isSpecial = isRegularCustomer && s.specialServicePrice != null;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} - Rs.{price?.toFixed(2) || '0.00'}{isSpecial ? ' ⭐' : ''}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                {formData.selectedServices.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
                    {s.name} - Rs.{(s.effectivePrice ?? s.servicePrice)?.toFixed(2) || '0.00'}
                    <button type="button" onClick={() => removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold ml-0.5">✕</button>
                  </span>
                ))}
                {formData.selectedServices.length === 0 && <p className="text-xs text-green-500 italic">None selected</p>}
              </div>
              {formData.selectedServices.length > 0 && (
                <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-700">Service Total:</span>
                  <span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* COL 3: Used Items + Descriptions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white flex-1 flex flex-col overflow-hidden">
              <div className={ttl}>Used Items / Parts</div>
              <div className="flex-1 overflow-y-auto">
                <UsedItemsSection
                  items={inventoryItems}
                  usedItems={formData.usedItems}
                  onAdd={addUsedItem}
                  onRemove={removeUsedItem}
                  isRegularCustomer={isRegularCustomer}
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded p-2 bg-white">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
              <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3" placeholder="Detailed fault description..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            </div>
            <div className="border border-gray-200 rounded p-2 bg-white">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional notes..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          {/* COL 4: Payment + Summary + Actions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Payment Info</div>
              <div className="space-y-1.5">
                <div>
                  <label className={lbl}>Advance Payment (Rs.)</label>
                  <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                </div>
                <div>
                  <label className={lbl}>Estimated Cost (Rs.)</label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
              <div className={ttl}>Summary</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType} 🔒</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${sc(formData.status)}`}>{formData.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium">{formData.selectedFaults.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium">{formData.selectedServices.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Used Items:</span><span className="font-medium">{formData.usedItems.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium">{formData.deviceConditionIds.length}</span></div>
                {formData.oneDayService && <div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
                {formData.withCharger && <div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
                {isRegularCustomer && <div className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-center font-bold">⭐ REGULAR CUSTOMER – SPECIAL PRICES</div>}
                {formData.selectedServices.length > 0 && (
                  <div className="border-t border-gray-200 pt-1 flex justify-between">
                    <span className="text-gray-500">Service Total:</span>
                    <span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                  </div>
                )}
                {formData.usedItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parts Total:</span>
                    <span className="font-bold text-blue-700">Rs.{formData.usedItems.reduce((s, i) => s + (i.quantityUsed * (i.unitPrice || 0)), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">
                {loading ? 'Updating...' : '✓ Update Job Card'}
              </button>
              {onCancel && (
                <button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

        </div>
      </form>

      {showCancelModal && originalData && (
        <CancelOrderModal
          jobCard={originalData}
          onSuccess={() => { setShowCancelModal(false); if (onSuccess) onSuccess(); }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  UsedItemsSection — with portal-based autocomplete item search
// ─────────────────────────────────────────────
const UsedItemsSection = ({ items, usedItems, onAdd, onRemove, isRegularCustomer }) => {
  const { apiCall } = useApi();
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [serialSearch, setSerialSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const filteredSerials = availableSerials.filter(s =>
    s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
  );

  const getEffectivePrice = (item) => {
    if (isRegularCustomer && item?.specialPrice != null) return item.specialPrice;
    return item?.sellingPrice || 0;
  };

  const isSpecialPriceActive = isRegularCustomer && selectedItem?.specialPrice != null;

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit') {
        e.preventDefault(); e.stopPropagation();
        if (e.target.name === 'barcodeInput' && barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim(), true);
        return false;
      }
    };
    document.addEventListener('keydown', h, true);
    return () => document.removeEventListener('keydown', h, true);
  }, [barcodeInput]);

  useEffect(() => {
    const fetchSerials = async () => {
      if (selectedItem?.hasSerialization) {
        setLoadingSerials(true);
        try {
          const s = await apiCall(`/api/inventory/${selectedItem.id}/serials/available`);
          setAvailableSerials(s || []);
        } catch (e) {
          console.error(e); setAvailableSerials([]);
        } finally {
          setLoadingSerials(false);
        }
      } else {
        setAvailableSerials([]);
      }
      setSelectedSerials([]); setSerialSearch(''); setBarcodeInput('');
    };
    fetchSerials();
  }, [selectedItem]);

  const handleBarcodeScan = (barcode, triggerAddIfComplete = false) => {
    if (!selectedItem?.hasSerialization) return;
    const s = availableSerials.find(x => x.serialNumber === barcode.trim());
    if (s && !selectedSerials.includes(s.serialNumber) && (selectedSerials.length < parseInt(quantity) || !quantity)) {
      const newSerials = [...selectedSerials, s.serialNumber];
      setSelectedSerials(newSerials);
      const m = document.createElement('div');
      m.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      m.textContent = `📷 ${s.serialNumber}`;
      document.body.appendChild(m);
      setTimeout(() => m.remove(), 2000);
      if (triggerAddIfComplete && selectedItem && quantity && newSerials.length === parseInt(quantity)) {
        setTimeout(() => {
          onAdd(selectedItem.id, quantity, newSerials);
          setSelectedItem(null);
          setQuantity('');
          setSelectedSerials([]);
          setAvailableSerials([]);
          setSerialSearch('');
          setBarcodeInput('');
        }, 150);
        return;
      }
    }
    setTimeout(() => setBarcodeInput(''), 100);
  };

  const handleAdd = () => {
    if (!selectedItem || !quantity) { alert('Select item and quantity'); return; }
    if (selectedItem.hasSerialization && selectedSerials.length !== parseInt(quantity)) {
      alert(`Select exactly ${quantity} serial(s)`); return;
    }
    onAdd(selectedItem.id, quantity, selectedSerials);
    setSelectedItem(null);
    setQuantity('');
    setSelectedSerials([]);
    setAvailableSerials([]);
    setSerialSearch('');
    setBarcodeInput('');
  };

  const canAdd = selectedItem && quantity && parseInt(quantity) > 0 &&
    (!selectedItem.hasSerialization || selectedSerials.length === parseInt(quantity));

  return (
    <div className="space-y-2">
      {/* Add Item Card */}
      <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="bg-blue-600 px-2.5 py-1.5 flex items-center gap-1.5">
          <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-semibold text-white tracking-wide">ADD ITEM / PART</span>
          {isRegularCustomer && <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">⭐ Special Price</span>}
        </div>

        <div className="p-2 space-y-2">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5 font-medium">Select Item</label>
            <ItemSearch
              inventoryItems={items}
              selectedItemId={selectedItem?.id || null}
              onSelect={(item) => setSelectedItem(item)}
              onClear={() => {
                setSelectedItem(null);
                setSelectedSerials([]);
                setAvailableSerials([]);
                setSerialSearch('');
                setBarcodeInput('');
              }}
              isRegularCustomer={isRegularCustomer}
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-0.5 font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                placeholder="e.g. 1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) handleAdd(); } }}
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap
                ${canAdd
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-95'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {/* Price info badge */}
          {selectedItem && (
            <div className={`rounded px-2 py-1.5 text-xs flex items-center justify-between
              ${isSpecialPriceActive
                ? 'bg-amber-50 border border-amber-300 text-amber-800'
                : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
              {isSpecialPriceActive ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-700">⭐ Special: Rs.{selectedItem.specialPrice?.toFixed(2)}</span>
                    <span className="text-gray-400 line-through">Rs.{selectedItem.sellingPrice?.toFixed(2)}</span>
                  </div>
                  <span className="text-amber-600 font-medium">
                    Stock: {selectedItem.quantity}
                    {selectedItem.hasSerialization && <span className="ml-1">🔢</span>}
                  </span>
                </>
              ) : (
                <>
                  <span>Unit: <strong>Rs.{selectedItem.sellingPrice?.toFixed(2)}</strong></span>
                  <span className="text-gray-500">
                    Stock: {selectedItem.quantity}
                    {selectedItem.hasSerialization && <span className="ml-1">🔢</span>}
                  </span>
                </>
              )}
            </div>
          )}

          {selectedItem?.hasSerialization && availableSerials.length > 0 && (
            <div className="border border-yellow-300 rounded-lg overflow-hidden bg-yellow-50">
              <div className="bg-yellow-400 px-2 py-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-yellow-900">🔢 Serial Numbers</span>
                <span className="text-xs font-bold text-yellow-900 bg-yellow-300 px-1.5 py-0.5 rounded-full">
                  {selectedSerials.length} / {quantity || 0} selected
                </span>
              </div>
              <div className="p-1.5 space-y-1.5">
                <div className="flex gap-1">
                  <input
                    name="barcodeInput"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="📷 Scan..."
                    className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none bg-white"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); if (barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim(), true); }
                    }}
                  />
                  <input
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    placeholder="🔍 Search serial..."
                    className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none bg-white"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) handleAdd(); } }}
                  />
                </div>
                <div className="max-h-20 overflow-y-auto space-y-0.5">
                  {loadingSerials ? (
                    <div className="text-xs text-center text-yellow-600 py-2">Loading serials...</div>
                  ) : filteredSerials.map(s => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer text-xs transition-colors
                        ${selectedSerials.includes(s.serialNumber) ? 'bg-yellow-200 border border-yellow-400' : 'hover:bg-yellow-100'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSerials.includes(s.serialNumber)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSerials(p => [...p, s.serialNumber]);
                          else setSelectedSerials(p => p.filter(x => x !== s.serialNumber));
                        }}
                        className="w-3 h-3"
                        disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(s.serialNumber)}
                      />
                      <span className="font-mono text-yellow-900">{s.serialNumber}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Used Items List */}
      {usedItems.length > 0 && (
        <div className="space-y-1">
          {usedItems.map((item, i) => (
            <div key={i} className={`rounded-lg border overflow-hidden ${item.isSpecialPrice ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {item.isSpecialPrice && <span className="text-amber-500 mr-1">⭐</span>}
                    {item.inventoryItem.name}
                    {item.inventoryItem.hasSerialization && <span className="ml-1 text-blue-500">🔢</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantityUsed} × Rs.{item.unitPrice?.toFixed(2)}
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="font-semibold text-gray-700">Rs.{(item.quantityUsed * (item.unitPrice || 0)).toFixed(2)}</span>
                    {item.isSpecialPrice && <span className="ml-1 text-amber-600 text-xs">(Special)</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {item.usedSerialNumbers?.length > 0 && (
                <div className="flex flex-wrap gap-0.5 px-2 pb-1.5">
                  {item.usedSerialNumbers.map((sn, si) => (
                    <span key={si} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono border border-blue-200">
                      {sn}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between bg-blue-600 text-white rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold">Parts Total</span>
            <span className="text-sm font-bold">
              Rs.{usedItems.reduce((s, i) => s + (i.quantityUsed * (i.unitPrice || 0)), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardEdit;