import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const InvoiceEdit = ({ invoiceId, onSuccess, onClose }) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    warrantyNumber: '', // ✅ NEW: Added warrantyNumber field
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

  // ✅ NEW: Update warranty number handler
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

    const item = {
      inventoryItem: { id: parseInt(newItem.inventoryItemId) },
      itemCode: selectedItem.sku, // ✅ NEW: Add SKU as itemCode
      itemName: selectedItem.name,
      quantity: newItem.quantity,
      unitPrice: selectedItem.sellingPrice,
      total: newItem.quantity * selectedItem.sellingPrice,
      warranty: newItem.warranty,
      warrantyNumber: newItem.warrantyNumber || '', // ✅ NEW: Add warranty number field
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
      warrantyNumber: '', // ✅ NEW: Reset warranty number
      serialNumbers: []
    });

    setError('');
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
        i === index ? { ...item, warranty } : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - formData.discount + formData.tax;
    const balance = total - formData.paidAmount;
    return { subtotal, total, balance };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

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
                  onChange={(e) => setNewItem({ ...newItem, warranty: e.target.value })}
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {WARRANTY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                
                {/* ✅ NEW: Warranty Number Input Field */}
                <input
                  type="text"
                  value={newItem.warrantyNumber}
                  onChange={(e) => setNewItem({ ...newItem, warrantyNumber: e.target.value.slice(0, 5) })}
                  placeholder="Warr. #"
                  maxLength="5"
                  className="px-2 py-2 border border-green-300 rounded-md text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Manual warranty number (4-5 digits)"
                />
                
                <input
                  type="text"
                  value={(newItem.quantity * (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice || 0)).toFixed(2)}
                  disabled
                  className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  placeholder="Total"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
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
                    {formData.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        {/* ✅ NEW: Item Code Column */}
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
                        
                        {/* ✅ NEW: Warranty Number Input Column */}
                        <td className="px-2 py-2 text-center">
                          <input
                            type="text"
                            placeholder="e.g., 1234"
                            maxLength="5"
                            value={item.warrantyNumber || ''}
                            onChange={(e) => updateItemWarrantyNumber(idx, e.target.value)}
                            className="w-16 px-2 py-1 border border-green-300 rounded text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
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
                    ))}
                  </tbody>
                </table>
              </div>
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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium text-sm"
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