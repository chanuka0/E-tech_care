
import { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const warrantyRequiresNumber = (warranty) =>
  warranty && warranty !== '-' && warranty !== 'No Warranty';

const WARRANTY_OPTIONS = [
  { value: 'No Warranty', label: 'No Warranty' },
  { value: '7 days', label: '7 Days' },
  { value: '14 days', label: '14 Days' },
  { value: '30 days', label: '30 Days' },
  { value: '2 months', label: '2 Months' },
  { value: '3 months', label: '3 Months' },
  { value: '6 months', label: '6 Months' },
  { value: '1 year', label: '1 Year' },
  { value: '2 years', label: '2 Years' },
];

const inp = "w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
const lbl = "block text-xs font-medium text-gray-500 mb-0.5";
const sec = "bg-white border border-gray-200 rounded p-2";
const secT = "text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5";

const InvoiceEdit = ({ invoiceId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);

  // ✅ Job card & regular customer state
  const [jobCard, setJobCard] = useState(null);
  const [isRegular, setIsRegular] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    items: [], discount: 0, tax: 0, paymentMethod: 'CASH', paidAmount: 0
  });

  const [newItem, setNewItem] = useState({
    inventoryItemId: '', quantity: 1, warranty: 'No Warranty', warrantyNumber: '', serialNumbers: []
  });

  // ✅ Get effective service price for regular customers
  const getEffectiveServicePrice = (service, regular) => {
    if (regular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice || 0;
  };

  // ✅ Service total using effective prices
  const calcServiceTotal = () =>
    (jobCard?.serviceCategories || []).reduce(
      (s, sv) => s + getEffectiveServicePrice(sv, isRegular), 0
    );

  useEffect(() => {
    const load = async () => {
      try {
        const [invoiceData, inventoryData] = await Promise.all([
          apiCall(`/api/invoices/${invoiceId}`),
          apiCall('/api/inventory')
        ]);

        // ✅ Pick up regular customer flag and job card from invoice
        const regular = invoiceData.isRegularCustomer || false;
        setIsRegular(regular);

        // ✅ If the invoice has a linked job card, fetch it for services
        if (invoiceData.jobCard?.id) {
          try {
            const jc = await apiCall(`/api/jobcards/${invoiceData.jobCard.id}`);
            setJobCard(jc);
          } catch (e) {
            console.warn('Could not load job card:', e);
          }
        }

        setFormData({
          customerName: invoiceData.customerName || '',
          customerPhone: invoiceData.customerPhone || '',
          customerEmail: invoiceData.customerEmail || '',
          // ✅ Only keep PART items — SERVICE rows are derived from job card
          items: (invoiceData.items || []).filter(i => i.itemType !== 'SERVICE'),
          discount: invoiceData.discount || 0,
          tax: invoiceData.tax || 0,
          paymentMethod: invoiceData.paymentMethod || 'CASH',
          paidAmount: invoiceData.paidAmount || 0
        });
        setInventoryItems(inventoryData);
      } catch (err) {
        setError('Failed to load invoice');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  // ✅ Total now includes service total
  const calcTotals = (data = formData) => {
    const itemsSubtotal = data.items.reduce((s, i) => s + i.total, 0);
    const serviceTotal = calcServiceTotal();
    const subtotal = itemsSubtotal + serviceTotal;
    const total = subtotal - data.discount + data.tax;
    const balance = total - data.paidAmount;
    return { itemsSubtotal, serviceTotal, subtotal, total, balance };
  };

  const handlePaidAmountChange = (e) => {
    const raw = parseFloat(e.target.value);
    const { total } = calcTotals();
    if (isNaN(raw) || raw < 0) { setFormData(p => ({ ...p, paidAmount: 0 })); setError(''); return; }
    if (raw > total) {
      setError(`Paid amount cannot exceed total: Rs.${total.toFixed(2)}`);
      setFormData(p => ({ ...p, paidAmount: total }));
      return;
    }
    setError('');
    setFormData(p => ({ ...p, paidAmount: raw }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'tax' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddItem = () => {
    if (!newItem.inventoryItemId || newItem.quantity <= 0) { setError('Select item and quantity'); return; }
    const sel = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
    if (!sel) { setError('Item not found'); return; }
    if (newItem.quantity > sel.quantity) { setError(`Only ${sel.quantity} available`); return; }
    if (warrantyRequiresNumber(newItem.warranty) && !newItem.warrantyNumber?.trim()) {
      setValidationError(`Warranty number required (${newItem.warranty})`); return;
    }
    // ✅ Use special price if regular customer
    const unitPrice = (isRegular && sel.specialPrice != null) ? sel.specialPrice : sel.sellingPrice;
    setFormData(p => ({
      ...p,
      items: [...p.items, {
        inventoryItem: { id: parseInt(newItem.inventoryItemId) },
        itemCode: sel.sku, itemName: sel.name, quantity: newItem.quantity,
        unitPrice, total: newItem.quantity * unitPrice,
        warranty: newItem.warranty,
        warrantyNumber: warrantyRequiresNumber(newItem.warranty) ? newItem.warrantyNumber : '',
        serialNumbers: newItem.serialNumbers,
        itemType: 'PART'
      }]
    }));
    setNewItem({ inventoryItemId: '', quantity: 1, warranty: 'No Warranty', warrantyNumber: '', serialNumbers: [] });
    setError(''); setValidationError('');
  };

  const removeItem = (idx) => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateWarranty = (idx, w) => setFormData(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, warranty: w, warrantyNumber: warrantyRequiresNumber(w) ? it.warrantyNumber : '' } : it) }));
  const updateWarrantyNum = (idx, wn) => setFormData(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, warrantyNumber: wn } : it) }));

  const validateAllItems = () => {
    for (const item of formData.items) {
      if (warrantyRequiresNumber(item.warranty) && !item.warrantyNumber?.trim()) {
        return { valid: false, message: `Warranty number required for: ${item.itemName}` };
      }
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setValidationError('');

    const hasContent = (jobCard?.serviceCategories?.length > 0) || formData.items.length > 0;
    if (!hasContent) { setError('Invoice must have at least services or items'); setSubmitting(false); return; }
    if (!formData.customerName.trim()) { setError('Customer name required'); setSubmitting(false); return; }
    const v = validateAllItems();
    if (!v.valid) { setValidationError(v.message); setSubmitting(false); return; }

    const { itemsSubtotal, serviceTotal, subtotal, total } = calcTotals();
    const safePaid = Math.min(formData.paidAmount, total);

    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        isRegularCustomer: isRegular,
        items: formData.items,
        serviceTotal,
        itemsSubtotal,
        subtotal,
        discount: formData.discount,
        tax: formData.tax,
        total,
        paidAmount: safePaid,
        balance: total - safePaid,
        paymentMethod: formData.paymentMethod,
        paymentStatus: safePaid >= total ? 'PAID' : safePaid > 0 ? 'PARTIAL' : 'UNPAID'
      };
      const response = await apiCall(`/api/invoices/${invoiceId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showSuccess('Invoice updated!');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to update invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const showSuccess = (msg) => {
    const el = document.createElement('div');
    el.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  const { itemsSubtotal, serviceTotal, subtotal, total, balance } = calcTotals();
  const paidExceeds = formData.paidAmount > total;
  const allValid = formData.items.every(it => !warrantyRequiresNumber(it.warranty) || it.warrantyNumber?.trim());
  const hasContent = (jobCard?.serviceCategories?.length > 0) || formData.items.length > 0;
  const canSubmit = hasContent && formData.customerName.trim() && allValid && !paidExceeds && !submitting;

  // ✅ Display price for item in dropdown
  const getDisplayPrice = (item) =>
    (isRegular && item.specialPrice != null) ? item.specialPrice : item.sellingPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-base font-bold">
              Edit Invoice
              {isRegular && <span className="ml-2 text-sm bg-blue-500 px-2 py-0.5 rounded">⭐ Regular Customer</span>}
            </h3>
            {jobCard && <p className="text-blue-200 text-xs">Job Card: {jobCard.jobNumber} · {jobCard.customerName}</p>}
          </div>
          {onClose && <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>}
        </div>

        {/* Error strip */}
        {(error || validationError) && (
          <div className="flex-shrink-0 px-3 py-1 space-y-0.5">
            {error && <div className="p-1.5 bg-red-50 border border-red-300 text-red-700 rounded text-xs">{error}</div>}
            {validationError && <div className="p-1.5 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-xs">{validationError}</div>}
          </div>
        )}

        {/* Body — 4 columns */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 grid grid-cols-4 gap-2 p-2 overflow-hidden min-h-0">

            {/* === COL 1: Customer Info + Services (read-only) === */}
            <div className="flex flex-col gap-2 overflow-hidden min-h-0">

              {/* Customer */}
              <div className={sec}>
                <p className={secT}>Customer Info</p>
                <div className="space-y-1">
                  <div>
                    <label className={lbl}>Name *</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required />
                  </div>
                  <div>
                    <label className={lbl}>Phone</label>
                    <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className={inp} />
                  </div>
                  {isRegular && (
                    <div className="mt-1 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                      <p className="text-xs text-blue-700 font-medium">⭐ Special pricing applied</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Job Card Services — read-only, with special pricing */}
              {jobCard && (
                <div className="bg-green-50 border border-green-200 rounded p-2 flex flex-col overflow-hidden min-h-0 flex-1">
                  <div className="flex items-center justify-between flex-shrink-0 mb-1.5">
                    <p className={secT + ' text-green-700 mb-0'}>Services (Job Card)</p>
                    {isRegular && <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">⭐ Special</span>}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                    {jobCard.serviceCategories?.length > 0 ? jobCard.serviceCategories.map(sv => {
                      const price = getEffectiveServicePrice(sv, isRegular);
                      const hasSpecial = isRegular && sv.specialServicePrice != null;
                      return (
                        <div key={sv.id} className={`flex justify-between p-1.5 rounded border text-xs ${hasSpecial ? 'bg-blue-50 border-blue-200' : 'bg-white border-green-200'}`}>
                          <div>
                            <p className="font-medium text-gray-900">{sv.name}</p>
                            {hasSpecial && <p className="text-gray-400 line-through text-xs">Rs.{sv.servicePrice?.toFixed(2)}</p>}
                            {!hasSpecial && sv.description && <p className="text-gray-500 text-xs">{sv.description}</p>}
                          </div>
                          <p className={`font-bold ml-1 flex-shrink-0 ${hasSpecial ? 'text-blue-700' : 'text-green-700'}`}>
                            {hasSpecial && '⭐ '}Rs.{price.toFixed(2)}
                          </p>
                        </div>
                      );
                    }) : <p className="text-xs text-gray-500">No services on this job card</p>}
                  </div>
                  {serviceTotal > 0 && (
                    <div className="border-t border-green-300 pt-1 mt-1 text-right flex-shrink-0">
                      <p className="text-xs font-bold text-green-700">
                        Services Total{isRegular ? ' ⭐' : ''}: Rs.{serviceTotal.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Existing Items list */}
              <div className={sec + (jobCard ? '' : ' flex-1') + ' flex flex-col overflow-hidden min-h-0'}>
                <p className={secT}>Current Parts ({formData.items.length})</p>
                <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                  {formData.items.length === 0
                    ? <p className="text-xs text-gray-400">No parts added yet</p>
                    : formData.items.map((item, idx) => {
                      const needsW = warrantyRequiresNumber(item.warranty);
                      const itemOk = !needsW || item.warrantyNumber?.trim();
                      const hasSpecialPrice = isRegular && inventoryItems.find(i => i.id === item.inventoryItem?.id)?.specialPrice != null;
                      return (
                        <div key={idx} className={`border rounded p-1.5 text-xs ${!itemOk ? 'border-red-300 bg-red-50' : hasSpecialPrice ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {item.itemName}{hasSpecialPrice && <span className="ml-1 text-blue-600">⭐</span>}
                              </p>
                              <p className="text-gray-500">Qty: {item.quantity} · Rs.{item.total.toFixed(2)}</p>
                            </div>
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 ml-1">✕</button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <select value={item.warranty} onChange={e => updateWarranty(idx, e.target.value)} className={inp}>
                              {WARRANTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {needsW
                              ? <input type="text" placeholder="W# *" maxLength="5" value={item.warrantyNumber || ''} onChange={e => updateWarrantyNum(idx, e.target.value)} className={`${inp} font-mono text-center ${!item.warrantyNumber ? 'border-red-400 bg-red-50' : 'border-green-300'}`} />
                              : <span className="text-xs text-gray-400 flex items-center px-1">No warranty #</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="border-t border-gray-200 pt-1 mt-1 text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-700">Parts Total: Rs.{itemsSubtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* === COL 2: Add New Items === */}
            <div className="flex flex-col overflow-hidden min-h-0">
              <div className={sec + ' flex-1 flex flex-col overflow-hidden min-h-0'}>
                <div className="flex items-center justify-between flex-shrink-0 mb-1.5">
                  <p className={secT + ' mb-0'}>Add Parts/Items</p>
                  {isRegular && <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">⭐ Special Price</span>}
                </div>
                <div className="space-y-1.5 flex-shrink-0">
                  {/* ✅ Dropdown shows effective price */}
                  <select value={newItem.inventoryItemId} onChange={e => setNewItem({ ...newItem, inventoryItemId: e.target.value, serialNumbers: [] })} className={inp}>
                    <option value="">Select Item</option>
                    {inventoryItems.map(it => {
                      const price = getDisplayPrice(it);
                      const hasSpecial = isRegular && it.specialPrice != null;
                      return (
                        <option key={it.id} value={it.id}>
                          {it.sku} - {it.name}{hasSpecial ? ' ⭐' : ''} (Stock: {it.quantity}) Rs.{price?.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>

                  <div className="grid grid-cols-5 gap-1">
                    <input type="number" value={newItem.quantity} min="1" placeholder="Qty"
                      onWheel={e => e.target.blur()}
                      onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className={inp} />
                    {/* ✅ Shows effective price */}
                    <input type="text"
                      value={newItem.inventoryItemId
                        ? (getDisplayPrice(inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId)) || {}) || 0).toFixed(2)
                        : '0'}
                      disabled className={`${inp} bg-gray-100 ${isRegular && newItem.inventoryItemId && inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.specialPrice != null ? 'text-blue-700 font-semibold' : ''}`}
                      placeholder="Price" />
                    <select value={newItem.warranty} onChange={e => { const w = e.target.value; setNewItem({ ...newItem, warranty: w, warrantyNumber: warrantyRequiresNumber(w) ? newItem.warrantyNumber : '' }); }} className={inp}>
                      {WARRANTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {warrantyRequiresNumber(newItem.warranty)
                      ? <input type="text" value={newItem.warrantyNumber} onChange={e => setNewItem({ ...newItem, warrantyNumber: e.target.value.slice(0, 5) })} placeholder="W# *" maxLength="5" className={inp + ' border-red-300 font-mono text-center'} />
                      : <input type="text" disabled placeholder="N/A" className={inp + ' bg-gray-100 text-center text-gray-400'} />}
                    {/* ✅ Shows effective total */}
                    <input type="text"
                      value={(() => {
                        const sel = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
                        const price = sel ? getDisplayPrice(sel) : 0;
                        return (newItem.quantity * (price || 0)).toFixed(2);
                      })()}
                      disabled className={inp + ' bg-gray-100'} />
                  </div>

                  {warrantyRequiresNumber(newItem.warranty) && !newItem.warrantyNumber && (
                    <p className="text-xs text-red-600">⚠ Warranty number required ({newItem.warranty})</p>
                  )}

                  <button type="button" onClick={handleAddItem}
                    disabled={!newItem.inventoryItemId || (warrantyRequiresNumber(newItem.warranty) && !newItem.warrantyNumber?.trim())}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded text-xs font-bold">
                    Add Item
                  </button>
                </div>

                {formData.items.some(it => warrantyRequiresNumber(it.warranty)) && (
                  <div className={`mt-2 p-1.5 rounded border text-xs flex-shrink-0 ${allValid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {allValid ? '✓ All warranty numbers complete' : '⚠ Some items missing warranty numbers'}
                  </div>
                )}
              </div>
            </div>

            {/* === COL 3: Adjustments + Cost Breakdown + Checklist === */}
            <div className="flex flex-col gap-2 overflow-hidden min-h-0">

              <div className={sec}>
                <p className={secT}>Adjustments</p>
                <div className="space-y-1.5">
                  <div>
                    <label className={lbl}>Discount (Rs.)</label>
                    <input type="number" name="discount" value={formData.discount} min="0" step="0.01"
                      onWheel={e => e.target.blur()}
                      onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Tax (Rs.)</label>
                    <input type="number" name="tax" value={formData.tax} min="0" step="0.01"
                      onWheel={e => e.target.blur()}
                      onChange={handleChange} className={inp} />
                  </div>
                </div>
              </div>

              {/* ✅ Cost Breakdown now shows service total separately */}
              <div className="bg-gray-50 border border-gray-200 rounded p-2">
                <p className={secT}>Cost Breakdown</p>
                <div className="space-y-1 text-xs">
                  {serviceTotal > 0 && (
                    <div className="flex justify-between">
                      <span className={`text-gray-500 ${isRegular ? 'text-blue-600' : ''}`}>
                        Services{isRegular ? ' ⭐' : ''}:
                      </span>
                      <span className="font-semibold text-green-700">Rs.{serviceTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {itemsSubtotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parts:</span>
                      <span className="font-semibold text-blue-700">Rs.{itemsSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 border-gray-300">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span className="text-red-600">-Rs.{formData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span>+Rs.{formData.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-gray-400 pt-1">
                    <span className="font-bold text-gray-900">TOTAL{isRegular ? ' ⭐' : ''}:</span>
                    <span className="font-bold text-blue-700 text-sm">Rs.{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className={sec}>
                <p className={secT}>Checklist</p>
                <ul className="text-xs space-y-1">
                  <li className={formData.customerName.trim() ? 'text-green-600' : 'text-red-600'}>{formData.customerName.trim() ? '✓' : '✕'} Customer name</li>
                  <li className={hasContent ? 'text-green-600' : 'text-red-600'}>{hasContent ? '✓' : '✕'} Has services/items</li>
                  <li className={!paidExceeds ? 'text-green-600' : 'text-red-600'}>{!paidExceeds ? '✓' : '✕'} Paid ≤ total</li>
                  <li className={allValid ? 'text-green-600' : 'text-red-600'}>{allValid ? '✓' : '✕'} All warranty numbers</li>
                  {isRegular && <li className="text-blue-600">· ⭐ Special pricing applied</li>}
                </ul>
              </div>
            </div>

            {/* === COL 4: Payment + Summary + Actions === */}
            <div className="flex flex-col gap-2 overflow-hidden min-h-0">

              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className={secT + ' text-blue-700'}>Payment</p>
                <div className="space-y-1.5">
                  <div>
                    <label className={lbl}>Payment Method</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inp}>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>
                      Paid Amount (Rs.) <span className="text-gray-400 font-normal">max: Rs.{total.toFixed(2)}</span>
                    </label>
                    <input type="number" value={formData.paidAmount}
                      onWheel={e => e.target.blur()}
                      onChange={handlePaidAmountChange}
                      min="0" max={total} step="0.01"
                      className={`${inp} ${paidExceeds ? 'border-red-400 bg-red-50' : ''}`} />
                    {paidExceeds && <p className="text-xs text-red-600 mt-0.5">⚠ Cannot exceed Rs.{total.toFixed(2)}</p>}
                  </div>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-1.5">
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                  <p className="text-xs text-blue-500 font-medium">Total{isRegular ? ' ⭐' : ''}</p>
                  <p className="text-lg font-bold text-blue-700">Rs.{total.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                  <p className="text-xs text-green-500 font-medium">Paid</p>
                  <p className="text-lg font-bold text-green-700">Rs.{formData.paidAmount.toFixed(2)}</p>
                </div>
                <div className={`border rounded p-2 text-center ${balance <= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <p className={`text-xs font-medium ${balance <= 0 ? 'text-green-500' : 'text-orange-500'}`}>Balance</p>
                  <p className={`text-lg font-bold ${balance <= 0 ? 'text-green-700' : 'text-orange-700'}`}>Rs.{Math.max(0, balance).toFixed(2)}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className={`rounded px-3 py-1.5 text-center text-xs font-bold border ${formData.paidAmount >= total && total > 0 ? 'bg-green-100 border-green-300 text-green-800' : formData.paidAmount > 0 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                {formData.paidAmount >= total && total > 0 ? '● PAID' : formData.paidAmount > 0 ? '● PARTIAL PAYMENT' : '● UNPAID'}
              </div>

              <div className="flex-1 min-h-0" />

              {/* Actions */}
              <div className="space-y-1.5 flex-shrink-0">
                <button type="submit" disabled={!canSubmit}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded text-sm font-bold transition-colors">
                  {submitting ? 'Updating...' : 'Update Invoice'}
                </button>
                <button type="button" onClick={onClose}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEdit;