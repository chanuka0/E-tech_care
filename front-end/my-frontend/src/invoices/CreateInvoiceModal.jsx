import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const WARRANTY_OPTIONS = [
  { value: 'No Warranty', label: 'No Warranty' },
  { value: '7 days', label: '7 Days' },
  { value: '14 days', label: '14 Days' },
  { value: '30 days', label: '30 Days' },
  { value: '2 months', label: '2 Months' },
  { value: '3 months', label: '3 Months' },
  { value: '4 months', label: '4 Months' },
  { value: '6 months', label: '6 Months' },
  { value: '1 year', label: '1 Year' },
  { value: '2 years', label: '2 Years' },
  { value: '3 years', label: '3 Years' },
  { value: '4 years', label: '4 Years' },
  { value: '5 years', label: '5 Years' }
];

const CreateInvoiceModal = ({ 
  jobCard = null, 
  invoiceId = null,
  isEditing = false,
  onSuccess, 
  onClose 
}) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(isEditing && invoiceId ? true : false);
  const [error, setError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Check if job card is COMPLETED (required for invoice creation)
  if (!isEditing && jobCard && jobCard.status !== 'COMPLETED') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Create Invoice</h3>
            <p className="text-gray-600 mb-4">
              Invoices can only be created for <strong>COMPLETED</strong> job cards.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Current Status: <span className="font-semibold">{jobCard?.status}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [invoiceData, setInvoiceData] = useState({
    jobCard: jobCard ? { id: jobCard.id } : null,
    customerName: jobCard?.customerName || '',
    customerPhone: jobCard?.customerPhone || '',
    customerEmail: jobCard?.customerEmail || '',
    items: [],
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
    paidAmount: jobCard?.advancePayment || 0
  });

  const [newItem, setNewItem] = useState({
    inventoryItemId: '',
    quantity: 1,
    warranty: 'No Warranty',
    serialNumbers: []
  });

  // Fetch inventory items - FIXED VERSION
  useEffect(() => {
    let isMounted = true;
    
    const fetchInventory = async () => {
      if (dataLoaded) return;
      
      try {
        const data = await apiCall('/api/inventory');
        if (isMounted) {
          setInventoryItems(data);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        if (isMounted) {
          setError('Failed to load inventory items');
        }
      }
    };
    
    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, [apiCall, dataLoaded]);

  // Fetch invoice data if editing - FIXED VERSION
  useEffect(() => {
    let isMounted = true;
    
    const fetchInvoiceData = async () => {
      if (!isEditing || !invoiceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiCall(`/api/invoices/${invoiceId}`);
        
        if (isMounted) {
          setInvoiceData({
            jobCard: data.jobCard ? { id: data.jobCard.id } : null,
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            customerEmail: data.customerEmail || '',
            items: data.items || [],
            discount: data.discount || 0,
            tax: data.tax || 0,
            paymentMethod: data.paymentMethod || 'CASH',
            paidAmount: data.paidAmount || 0
          });
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load invoice data');
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInvoiceData();

    return () => {
      isMounted = false;
    };
  }, [isEditing, invoiceId, apiCall]);

  // UPDATED: AUTO-POPULATE from jobCard.usedItems with serial numbers and warranty
  useEffect(() => {
    if (jobCard && jobCard.usedItems && jobCard.usedItems.length > 0 && !isEditing) {
      const autoPopulatedItems = jobCard.usedItems.map(used => ({
        inventoryItem: { id: used.inventoryItem.id },
        itemName: used.inventoryItem.name,
        quantity: used.quantityUsed,
        unitPrice: used.unitPrice || used.inventoryItem.sellingPrice,
        total: used.quantityUsed * (used.unitPrice || used.inventoryItem.sellingPrice),
        warranty: used.warrantyPeriod || 'No Warranty',
        serialNumbers: used.usedSerialNumbers || []
      }));

      setInvoiceData(prev => ({
        ...prev,
        items: autoPopulatedItems
      }));
    }
  }, [jobCard, isEditing]);

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
      itemName: selectedItem.name,
      quantity: newItem.quantity,
      unitPrice: selectedItem.sellingPrice,
      total: newItem.quantity * selectedItem.sellingPrice,
      warranty: newItem.warranty,
      serialNumbers: newItem.serialNumbers
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      inventoryItemId: '',
      quantity: 1,
      warranty: 'No Warranty',
      serialNumbers: []
    });

    setError('');
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemWarranty = (index, warranty) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, warranty } : item
      )
    }));
  };

  const addSerialToItem = (index) => {
    const serial = prompt('Enter serial number:');
    if (serial && serial.trim()) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === index 
            ? { ...item, serialNumbers: [...(item.serialNumbers || []), serial] }
            : item
        )
      }));
    }
  };

  const removeSerialFromItem = (itemIndex, serialIndex) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === itemIndex
          ? { ...item, serialNumbers: item.serialNumbers.filter((_, j) => j !== serialIndex) }
          : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    
    // Add service category totals from job card
    const serviceTotal = (jobCard?.serviceCategories || []).reduce((sum, service) => {
      return sum + (service.servicePrice || 0);
    }, 0);
    
    const totalWithoutTax = subtotal + serviceTotal - invoiceData.discount;
    const total = totalWithoutTax + invoiceData.tax;
    const balance = total - invoiceData.paidAmount;
    
    return { 
      itemsSubtotal: subtotal,
      serviceTotal,
      combinedSubtotal: subtotal + serviceTotal,
      discount: invoiceData.discount,
      tax: invoiceData.tax,
      total, 
      balance,
      paidAmount: invoiceData.paidAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (invoiceData.items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }

    if (!invoiceData.customerName.trim()) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }

    if (!invoiceData.customerPhone.trim()) {
      setError('Customer phone is required');
      setLoading(false);
      return;
    }

    try {
      const totals = calculateTotals();

      const payload = {
      jobCard: invoiceData.jobCard,
      customerName: invoiceData.customerName,
      customerPhone: invoiceData.customerPhone,
      customerEmail: invoiceData.customerEmail,
      items: invoiceData.items,
      serviceTotal: totals.serviceTotal,
      itemsSubtotal: totals.itemsSubtotal,
      subtotal: totals.combinedSubtotal,
      discount: invoiceData.discount,
      tax: invoiceData.tax,
      total: totals.total,
      paidAmount: invoiceData.paidAmount,
      balance: totals.balance,
      paymentMethod: invoiceData.paymentMethod,
      paymentStatus: invoiceData.paidAmount >= totals.total ? 'PAID' : invoiceData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      createdBy: getUserIdFromToken()

      };

      let response;
;
    // NEW: Check if invoice already exists for this job card (only for new invoices from job cards)
    if (!isEditing && isJobCardInvoice && jobCard?.id) {
      try {
        // Search for existing invoices for this job card
        const existingInvoices = await apiCall(`/api/invoices/search/jobcard/${jobCard.jobNumber}`);
        
        if (existingInvoices.length > 0) {
          const existingInvoice = existingInvoices[0];
          const shouldUpdate = window.confirm(
            `An invoice (${existingInvoice.invoiceNumber}) already exists for job card ${jobCard.jobNumber}. Do you want to UPDATE the existing invoice instead of creating a new one?`
          );
          
          if (shouldUpdate) {
            // Update the existing invoice
            response = await apiCall(`/api/invoices/${existingInvoice.id}`, {
              method: 'PUT',
              body: JSON.stringify(payload)
            });
            showSuccessMessage('Invoice updated successfully!');
            if (onSuccess) onSuccess(response);
            setLoading(false);
            return;
          }
          // If user chooses "Cancel", continue to create new invoice
        }
      } catch (err) {
        console.log('No existing invoice found or error searching, creating new one');
        // Continue to create new invoice
      }
    }
      if (isEditing && invoiceId) {
        response = await apiCall(`/api/invoices/${invoiceId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        response = await apiCall('/api/invoices', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      showSuccessMessage(isEditing ? 'Invoice updated successfully!' : 'Invoice created successfully!');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to save invoice');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let userId = payload.userId || payload.id || payload.sub;
        return typeof userId === 'string' ? parseInt(userId, 10) : userId;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return 1;
  };

  const showSuccessMessage = (message) => {
    // Remove any existing messages first
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const msg = document.createElement('div');
    msg.className = 'success-message fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => {
      if (msg.parentNode) {
        msg.remove();
      }
    }, 3000);
  };

  const totals = calculateTotals();
  const isJobCardInvoice = jobCard != null;

  if (loading && isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold">
              {isEditing ? 'Edit Invoice' : 'Create Invoice from Job Card'}
            </h3>
            {isJobCardInvoice && jobCard && (
              <p className="text-blue-100 text-sm mt-1">
                Job Card: {jobCard.jobNumber}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Job Card Information */}
          {isJobCardInvoice && jobCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div>
                <p className="text-xs text-blue-600 font-semibold">Job Card Number</p>
                <p className="font-bold text-gray-900">{jobCard.jobNumber}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">Device Type</p>
                <p className="font-semibold text-gray-900">{jobCard.deviceType}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">Device Serial</p>
                <p className="font-semibold text-gray-900">
                  {jobCard.serials?.find(s => s.serialType === 'DEVICE_SERIAL')?.serialValue || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">Advance Payment</p>
                <p className="font-bold text-green-600">Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          )}

          {/* Customer Details */}
          {!isJobCardInvoice || isEditing ? (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={invoiceData.customerName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Customer Phone *"
                  value={invoiceData.customerPhone}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerPhone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Customer Email (Optional)"
                  value={invoiceData.customerEmail}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerEmail: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{invoiceData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{invoiceData.customerPhone}</p>
                </div>
                {invoiceData.customerEmail && (
                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{invoiceData.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Categories from Job Card */}
          {isJobCardInvoice && jobCard?.serviceCategories && jobCard.serviceCategories.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Services (From Job Card)</h4>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                <div className="space-y-2">
                  {jobCard.serviceCategories.map(service => (
                    <div key={service.id} className="flex justify-between items-center bg-white p-3 rounded border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-gray-600">{service.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-green-700">Rs.{service.servicePrice?.toFixed(2) || '0.00'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t-2 border-green-300 text-right">
                  <p className="text-sm text-gray-600">Total Services:</p>
                  <p className="text-2xl font-bold text-green-700">Rs.{totals.serviceTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Faults from Job Card */}
          {isJobCardInvoice && jobCard?.faults && jobCard.faults.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Faults Reported</h4>
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                <div className="space-y-2 mb-3">
                  {jobCard.faults.map(fault => (
                    <span key={fault.id} className="inline-block bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
                      {fault.faultName}
                    </span>
                  ))}
                </div>
                {jobCard.faultDescription && (
                  <div className="bg-white p-3 rounded border border-red-200 mt-3">
                    <p className="text-xs text-gray-600 font-medium">Description:</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{jobCard.faultDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Used Items from Job Card - NEW SECTION */}
          {isJobCardInvoice && jobCard?.usedItems && jobCard.usedItems.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 15h8" />
                </svg>
                Used Parts (Auto-populated from Job Card)
              </h4>
              <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                <div className="space-y-3">
                  {invoiceData.items.filter(item => 
                    jobCard.usedItems.some(used => used.inventoryItem.id === item.inventoryItem.id)
                  ).map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × Rs.{item.unitPrice.toFixed(2)} = Rs.{item.total.toFixed(2)}
                          </p>
                        </div>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          {item.warranty}
                        </span>
                      </div>
                      {item.serialNumbers && item.serialNumbers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 font-medium mb-1">Serial Numbers:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.serialNumbers.map((serial, sIdx) => (
                              <span key={sIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                {serial}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t-2 border-purple-300 text-right">
                  <p className="text-sm text-gray-600">Auto-populated Parts Total:</p>
                  <p className="text-xl font-bold text-purple-700">
                    Rs.{invoiceData.items
                      .filter(item => jobCard.usedItems.some(used => used.inventoryItem.id === item.inventoryItem.id))
                      .reduce((sum, item) => sum + item.total, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Additional Items */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-4">Add Additional Items</h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <select
                value={newItem.inventoryItemId}
                onChange={(e) => setNewItem({ ...newItem, inventoryItemId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select Item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.quantity}) - Rs.{item.sellingPrice.toFixed(2)}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-4 gap-2">
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
                Add Additional Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          {invoiceData.items.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left">Item</th>
                      <th className="px-2 py-2 text-center">Qty</th>
                      <th className="px-2 py-2 text-right">Price</th>
                      <th className="px-2 py-2 text-center">Warranty</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-center">Serials</th>
                      <th className="px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
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
                        <td className="px-2 py-2 text-right font-semibold">Rs.{item.total.toFixed(2)}</td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => addSerialToItem(idx)}
                            className="text-blue-600 hover:text-blue-900 text-xs underline"
                          >
                            + Add
                          </button>
                        </td>
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

              {/* Serials Display */}
              {invoiceData.items.some(item => item.serialNumbers?.length > 0) && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Serial Numbers</h5>
                  {invoiceData.items.map((item, idx) => (
                    item.serialNumbers?.length > 0 && (
                      <div key={idx} className="mb-2">
                        <p className="text-xs font-semibold text-gray-600">{item.itemName}:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.serialNumbers.map((serial, sIdx) => (
                            <span key={sIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                              {serial}
                              <button
                                type="button"
                                onClick={() => removeSerialFromItem(idx, sIdx)}
                                className="text-blue-600 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Items Total */}
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-600">Items Subtotal:</p>
                <p className="text-2xl font-bold text-gray-900">Rs.{totals.itemsSubtotal.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Subtotal:</span>
                <span className="font-semibold text-gray-900">Rs.{totals.itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Services Total:</span>
                <span className="font-semibold text-green-700">Rs.{totals.serviceTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between font-medium">
                <span className="text-gray-700">Combined Subtotal:</span>
                <span className="text-gray-900">Rs.{totals.combinedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <input
                  type="number"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <input
                  type="number"
                  value={invoiceData.tax}
                  onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Subtotal</p>
                <p className="text-lg font-bold">Rs.{totals.combinedSubtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Total</p>
                <p className="text-lg font-bold">Rs.{totals.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Balance</p>
                <p className="text-lg font-bold">Rs.{totals.balance.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={invoiceData.paymentMethod}
                  onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
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
                  value={invoiceData.paidAmount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, paidAmount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium text-sm"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;