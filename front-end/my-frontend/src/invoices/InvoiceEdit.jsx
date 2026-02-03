
import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';

// ✅ Helper function to check if warranty requires a warranty number
const warrantyRequiresNumber = (warranty) => {
  return warranty && warranty !== '-' && warranty !== 'No Warranty';
};

const InvoiceEdit = ({ invoiceId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [],
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
    paidAmount: 0
  });

  const [newItem, setNewItem] = useState({
    inventoryItemId: '',
    quantity: 1,
    warranty: 'No Warranty',
    warrantyNumber: '',
    serialNumbers: []
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceData, inventoryData] = await Promise.all([
          apiCall(`/api/invoices/${invoiceId}`),
          apiCall('/api/inventory')
        ]);
        
        setFormData({
          customerName: invoiceData.customerName || '',
          customerPhone: invoiceData.customerPhone || '',
          customerEmail: invoiceData.customerEmail || '',
          items: invoiceData.items || [],
          discount: invoiceData.discount || 0,
          tax: invoiceData.tax || 0,
          paymentMethod: invoiceData.paymentMethod || 'CASH',
          paidAmount: invoiceData.paidAmount || 0
        });
        
        setInventoryItems(inventoryData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load invoice');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'tax' || name === 'paidAmount' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const updateItemWarrantyNumber = (index, warrantyNumber) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, warrantyNumber } : item
      )
    }));
  };

  const handleAddItem = () => {
    if (!newItem.inventoryItemId || newItem.quantity <= 0) {
      setError('Please select item and quantity');
      return;
    }

    const selectedItem = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
    if (!selectedItem) {
      setError('Item not found');
      return;
    }

    if (newItem.quantity > selectedItem.quantity) {
      setError(`Only ${selectedItem.quantity} available`);
      return;
    }

    // ✅ NEW: Validate warranty number
    if (warrantyRequiresNumber(newItem.warranty)) {
      if (!newItem.warrantyNumber || newItem.warrantyNumber.trim() === '') {
        setValidationError(`Warranty number is required when warranty is selected (Warranty: ${newItem.warranty})`);
        return;
      }
    }

    const item = {
      inventoryItem: { id: parseInt(newItem.inventoryItemId) },
      itemCode: selectedItem.sku,
      itemName: selectedItem.name,
      quantity: newItem.quantity,
      unitPrice: selectedItem.sellingPrice,
      total: newItem.quantity * selectedItem.sellingPrice,
      warranty: newItem.warranty,
      warrantyNumber: warrantyRequiresNumber(newItem.warranty) ? newItem.warrantyNumber : '',
      serialNumbers: newItem.serialNumbers
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      inventoryItemId: '',
      quantity: 1,
      warranty: 'No Warranty',
      warrantyNumber: '',
      serialNumbers: []
    });

    setError('');
    setValidationError('');
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemWarranty = (index, warranty) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { 
          ...item, 
          warranty,
          // ✅ Clear warranty number if switching to "No Warranty" or "-"
          warrantyNumber: warrantyRequiresNumber(warranty) ? item.warrantyNumber : ''
        } : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - formData.discount + formData.tax;
    const balance = total - formData.paidAmount;
    return { subtotal, total, balance };
  };

  // ✅ NEW: Validate all items before submitting (including warranty numbers)
  const validateAllItems = () => {
    for (const item of formData.items) {
      // ✅ Validate warranty number
      if (warrantyRequiresNumber(item.warranty)) {
        if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
          return {
            valid: false,
            message: `Warranty number is required for item: ${item.itemName} (Warranty: ${item.warranty})`
          };
        }
      }
    }
    
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setValidationError('');

    if (formData.items.length === 0) {
      setError('Please add at least one item');
      setSubmitting(false);
      return;
    }

    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      setSubmitting(false);
      return;
    }

    // ✅ NEW: Validate all items have required warranty numbers
    const validation = validateAllItems();
    if (!validation.valid) {
      setValidationError(validation.message);
      setSubmitting(false);
      return;
    }

    try {
      const { subtotal, total, balance } = calculateTotals();

      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        items: formData.items,
        subtotal,
        discount: formData.discount,
        tax: formData.tax,
        total,
        paidAmount: formData.paidAmount,
        balance,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paidAmount >= total ? 'PAID' : formData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
      };

      const response = await apiCall(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      showSuccessMessage('Invoice updated successfully!');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to update invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { subtotal, total, balance } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* ✅ VALIDATION ERROR */}
        {validationError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{validationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Add Items */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Add Items</h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <select
                value={newItem.inventoryItemId}
                onChange={(e) => setNewItem({ ...newItem, inventoryItemId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select Item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name} (Stock: {item.quantity}) - Rs.{item.sellingPrice.toFixed(2)}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-5 gap-2">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Qty"
                />
                <input
                  type="text"
                  value={newItem.inventoryItemId ? inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice.toFixed(2) || '0' : '0'}
                  disabled
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  placeholder="Price"
                />
                <select
                  value={newItem.warranty}
                  onChange={(e) => {
                    const warranty = e.target.value;
                    setNewItem({ 
                      ...newItem, 
                      warranty,
                      // ✅ Clear warranty number if switching to "No Warranty"
                      warrantyNumber: warrantyRequiresNumber(warranty) ? newItem.warrantyNumber : ''
                    });
                  }}
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {WARRANTY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                
                {/* ✅ UPDATED: Conditional Warranty Number Input */}
                {warrantyRequiresNumber(newItem.warranty) ? (
                  <input
                    type="text"
                    value={newItem.warrantyNumber}
                    onChange={(e) => setNewItem({ ...newItem, warrantyNumber: e.target.value.slice(0, 5) })}
                    placeholder="Warr. # *"
                    maxLength="5"
                    className="px-2 py-2 border border-red-300 rounded-md text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Warranty number required (4-5 digits)"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value=""
                    disabled
                    placeholder="N/A"
                    className="px-2 py-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-center text-gray-400"
                    title="No warranty number required"
                  />
                )}
                
                <input
                  type="text"
                  value={(newItem.quantity * (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice || 0)).toFixed(2)}
                  disabled
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  placeholder="Total"
                />
              </div>

              {/* ✅ NEW: Warranty Number Warning */}
              {warrantyRequiresNumber(newItem.warranty) && !newItem.warrantyNumber && (
                <div className="bg-red-50 border border-red-300 p-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">
                      Warranty number is required (Warranty: {newItem.warranty})
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddItem}
                disabled={(() => {
                  if (!newItem.inventoryItemId) return true;
                  
                  // ✅ Check warranty number requirement
                  if (warrantyRequiresNumber(newItem.warranty)) {
                    if (!newItem.warrantyNumber || newItem.warrantyNumber.trim() === '') return true;
                  }
                  
                  return false;
                })()}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          {formData.items.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left">Item Code</th>
                      <th className="px-2 py-2 text-left">Item</th>
                      <th className="px-2 py-2 text-center">Qty</th>
                      <th className="px-2 py-2 text-right">Price</th>
                      <th className="px-2 py-2 text-center">Warranty</th>
                      <th className="px-2 py-2 text-center">Warranty #</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, idx) => {
                      const requiresWarrantyNumber = warrantyRequiresNumber(item.warranty);
                      
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                              {item.itemCode || 'SKU-N/A'}
                            </span>
                          </td>
                          
                          <td className="px-2 py-2">{item.itemName}</td>
                          <td className="px-2 py-2 text-center">{item.quantity}</td>
                          <td className="px-2 py-2 text-right">Rs.{item.unitPrice.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center">
                            <select
                              value={item.warranty}
                              onChange={(e) => updateItemWarranty(idx, e.target.value)}
                              className="px-1 py-1 border border-gray-300 rounded text-xs"
                            >
                              {WARRANTY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* ✅ UPDATED: Conditional Warranty Number Input */}
                          <td className="px-2 py-2 text-center">
                            {requiresWarrantyNumber ? (
                              <input
                                type="text"
                                placeholder="e.g., 1234 *"
                                maxLength="5"
                                value={item.warrantyNumber || ''}
                                onChange={(e) => updateItemWarrantyNumber(idx, e.target.value)}
                                className={`w-16 px-2 py-1 border ${
                                  !item.warrantyNumber ? 'border-red-500 bg-red-50' : 'border-green-300'
                                } rounded text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-green-500`}
                                required
                              />
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-2 text-right font-semibold">Rs.{item.total.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ✅ NEW: Validation Status */}
              {(() => {
                const hasWarrantyItems = formData.items.some(item => 
                  warrantyRequiresNumber(item.warranty)
                );
                
                if (hasWarrantyItems) {
                  const allValid = formData.items.every(item => {
                    // Check warranty number
                    if (warrantyRequiresNumber(item.warranty)) {
                      if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
                        return false;
                      }
                    }
                    
                    return true;
                  });
                  
                  return (
                    <div className={`mt-4 p-3 rounded-lg border-2 ${allValid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                      <div className="flex items-center">
                        {allValid ? (
                          <>
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-green-800">All items are valid ✓</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-red-800">Some items missing warranty numbers ⚠️</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs.)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax (Rs.)</label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Subtotal</p>
                <p className="text-lg font-bold">Rs.{subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Total</p>
                <p className="text-lg font-bold">Rs.{total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Balance</p>
                <p className="text-lg font-bold">Rs.{balance.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (Rs.)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (() => {
                // ✅ Check if any items with warranty are missing warranty number
                for (const item of formData.items) {
                  if (warrantyRequiresNumber(item.warranty)) {
                    if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
                      return true;
                    }
                  }
                }
                return false;
              })()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md font-medium text-sm"
            >
              {submitting ? 'Updating...' : 'Update Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEdit;