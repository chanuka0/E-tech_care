
import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';

const WARRANTY_OPTIONS = [
  { value: '-', label: '-' },
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

// ✅ Helper function to check if warranty requires a warranty number
const warrantyRequiresNumber = (warranty) => {
  return warranty && warranty !== '-' && warranty !== 'No Warranty';
};

const CreateInvoiceModal = ({ 
  jobCard = null, 
  invoiceId = null,
  isEditing = false,
  onSuccess, 
  onClose 
}) => {
  const [loading, setLoading] = useState(isEditing && invoiceId ? true : false);
  const [error, setError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [validationError, setValidationError] = useState('');

  // ✅ NEW: Regular customer state
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
    // ✅ NEW: Regular customer fields
    isRegularCustomer: false,
    customerId: '',
    
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
    warranty: '-',
    warrantyNumber: '',
    serialNumbers: []
  });

  // Fetch inventory items and regular customers
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (dataLoaded) return;
      
      try {
        // ✅ Fetch both inventory and customers
        const [inventoryData, customersData] = await Promise.all([
          apiCall('/api/inventory'),
          apiCall('/api/customers/active')
        ]);
        
        if (isMounted) {
          setInventoryItems(inventoryData);
          setRegularCustomers(customersData?.customers || []);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (isMounted) {
          setError('Failed to load data');
        }
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dataLoaded]);

  // Fetch invoice data if editing
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
            isRegularCustomer: false,
            customerId: '',
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
  }, [isEditing, invoiceId]);

  // AUTO-POPULATE from jobCard.usedItems with serial numbers
  useEffect(() => {
    if (jobCard && jobCard.usedItems && jobCard.usedItems.length > 0 && !isEditing) {
      const autoPopulatedItems = jobCard.usedItems.map(used => ({
        inventoryItem: { id: used.inventoryItem.id },
        itemCode: used.inventoryItem.sku,
        itemName: used.inventoryItem.name,
        quantity: used.quantityUsed,
        unitPrice: used.unitPrice || used.inventoryItem.sellingPrice,
        total: used.quantityUsed * (used.unitPrice || used.inventoryItem.sellingPrice),
        warranty: used.warrantyPeriod || 'No Warranty',
        warrantyNumber: used.warrantyNumber || '',
        serialNumbers: used.usedSerialNumbers || []
      }));

      setInvoiceData(prev => ({
        ...prev,
        items: autoPopulatedItems
      }));
    }
  }, [jobCard, isEditing]);

  // ✅ NEW: Handle customer selection from dropdown
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    
    if (!customerId || customerId === '') {
      setInvoiceData(prev => ({
        ...prev,
        isRegularCustomer: false,
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: ''
      }));
      setSelectedCustomer(null);
      return;
    }

    const customerIdNum = parseInt(customerId, 10);
    const customer = regularCustomers.find(c => {
      const cId = c.customerId || c.id;
      return parseInt(cId, 10) === customerIdNum;
    });

    if (customer) {
      setInvoiceData(prev => ({
        ...prev,
        isRegularCustomer: true,
        customerId: customer.customerId || customer.id,
        customerName: customer.customerName,
        customerPhone: customer.phoneNumber,
        customerEmail: customer.email || ''
      }));
      setSelectedCustomer(customer);
      showSuccessMessage(`✅ Customer selected: ${customer.customerName}`);
    } else {
      setError('Selected customer not found');
    }
    
    setError('');
  };

  // ✅ NEW: Handle regular customer toggle
  const handleRegularCustomerToggle = (e) => {
    if (e.target.checked) {
      setInvoiceData(prev => ({
        ...prev,
        isRegularCustomer: true
      }));
    } else {
      setInvoiceData(prev => ({
        ...prev,
        isRegularCustomer: false,
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: ''
      }));
      setSelectedCustomer(null);
    }
  };

  // ✅ Validate serial numbers for serialized items
  const validateSerializedItem = (selectedItem, quantity, serialNumbers) => {
    if (!selectedItem) return true;
    
    // Check if item requires serialization
    if (selectedItem.hasSerialization) {
      // Check if serial numbers are provided
      if (!serialNumbers || serialNumbers.length === 0) {
        return {
          valid: false,
          message: `Serial number is required for item: ${selectedItem.name}`
        };
      }
      
      // Check if number of serials matches quantity
      if (serialNumbers.length !== quantity) {
        return {
          valid: false,
          message: `Number of serials (${serialNumbers.length}) must match quantity (${quantity}) for item: ${selectedItem.name}`
        };
      }
      
      // Check for duplicate serials
      const uniqueSerials = new Set(serialNumbers);
      if (uniqueSerials.size !== serialNumbers.length) {
        return {
          valid: false,
          message: `Duplicate serial numbers found for item: ${selectedItem.name}`
        };
      }
    }
    
    return { valid: true };
  };

  // ✅ UPDATED: Handle Add Item with Serial and Warranty Number Validation
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

    // ✅ Validate serialized items
    if (selectedItem.hasSerialization) {
      const validation = validateSerializedItem(
        selectedItem, 
        newItem.quantity, 
        newItem.serialNumbers
      );
      
      if (!validation.valid) {
        setValidationError(validation.message);
        return;
      }
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
      serialNumbers: newItem.serialNumbers,
      itemType: "PART"
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      inventoryItemId: '',
      quantity: 1,
      warranty: '-',
      warrantyNumber: '',
      serialNumbers: []
    });

    setError('');
    setValidationError('');
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
        i === index ? { 
          ...item, 
          warranty,
          // ✅ Clear warranty number if switching to "No Warranty" or "-"
          warrantyNumber: warrantyRequiresNumber(warranty) ? item.warrantyNumber : ''
        } : item
      )
    }));
  };

  const updateItemWarrantyNumber = (index, warrantyNumber) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, warrantyNumber } : item
      )
    }));
  };

  const addSerialToItem = (index) => {
    const item = invoiceData.items[index];
    const selectedItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
    
    if (selectedItem && selectedItem.hasSerialization) {
      // Show modal or prompt for serial numbers
      const serials = prompt(`Enter ${item.quantity} serial number(s) for ${item.itemName} (comma separated):`);
      if (serials) {
        const serialList = serials.split(',').map(s => s.trim()).filter(s => s);
        
        // Validate entered serials
        if (serialList.length !== item.quantity) {
          setValidationError(`Please enter exactly ${item.quantity} serial number(s)`);
          return;
        }
        
        setInvoiceData(prev => ({
          ...prev,
          items: prev.items.map((it, i) => 
            i === index ? { ...it, serialNumbers: serialList } : it
          )
        }));
        setValidationError('');
      }
    } else {
      const serial = prompt('Enter serial number:');
      if (serial && serial.trim()) {
        setInvoiceData(prev => ({
          ...prev,
          items: prev.items.map((it, i) => 
            i === index 
              ? { ...it, serialNumbers: [...(it.serialNumbers || []), serial.trim()] }
              : it
          )
        }));
      }
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

  // ✅ UPDATED: Validate all items before submitting (including warranty numbers)
  const validateAllItems = () => {
    for (const item of invoiceData.items) {
      const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
      
      // Validate serialized items
      if (inventoryItem && inventoryItem.hasSerialization) {
        if (!item.serialNumbers || item.serialNumbers.length === 0) {
          return {
            valid: false,
            message: `Serial number is required for item: ${item.itemName}`
          };
        }
        
        if (item.serialNumbers.length !== item.quantity) {
          return {
            valid: false,
            message: `Number of serials (${item.serialNumbers.length}) must match quantity (${item.quantity}) for item: ${item.itemName}`
          };
        }
      }

      // ✅ NEW: Validate warranty number
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

  const calculateTotals = () => {
    const itemsSubtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    
    // Add service category totals from job card (ONLY for job card invoices)
    const isJobCardInvoice = jobCard != null;
    const serviceTotal = isJobCardInvoice 
      ? (jobCard?.serviceCategories || []).reduce((sum, service) => {
          return sum + (service.servicePrice || 0);
        }, 0)
      : 0;
    
    const combinedSubtotal = itemsSubtotal + serviceTotal;
    const totalWithoutTax = combinedSubtotal - invoiceData.discount;
    const total = totalWithoutTax + invoiceData.tax;
    const balance = total - invoiceData.paidAmount;
    
    return { 
      itemsSubtotal,
      serviceTotal,
      combinedSubtotal,
      discount: invoiceData.discount,
      tax: invoiceData.tax,
      total, 
      balance,
      paidAmount: invoiceData.paidAmount
    };
  };

  // ✅ UPDATED: Check if invoice has at least services OR items
  const hasContentForInvoice = () => {
    const isJobCardInvoice = jobCard != null;
    const hasServices = isJobCardInvoice && jobCard?.serviceCategories && jobCard.serviceCategories.length > 0;
    const hasItems = invoiceData.items.length > 0;
    
    // ✅ For job card invoices: ALLOW invoice creation with ONLY services OR ONLY items OR BOTH
    // ✅ For direct invoices: Require at least items (services not applicable)
    if (isJobCardInvoice) {
      return hasServices || hasItems;
    } else {
      return hasItems; // Direct invoice must have items
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationError('');

    // ✅ UPDATED: Check if invoice has content (services or items)
    if (!hasContentForInvoice()) {
      const isJobCardInvoice = jobCard != null;
      setError(isJobCardInvoice ? 'Please add services or items to create invoice' : 'Please add items to create invoice');
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

    // ✅ Validate all items have required serial numbers AND warranty numbers
    const validation = validateAllItems();
    if (!validation.valid) {
      setValidationError(validation.message);
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

      // Check if invoice already exists for this job card
      const isJobCardInvoice = jobCard != null;
      if (!isEditing && isJobCardInvoice && jobCard?.id) {
        try {
          const existingInvoices = await apiCall(`/api/invoices/search/jobcard/${jobCard.jobNumber}`);
          
          if (existingInvoices.length > 0) {
            const existingInvoice = existingInvoices[0];
            const shouldUpdate = window.confirm(
              `An invoice (${existingInvoice.invoiceNumber}) already exists for job card ${jobCard.jobNumber}. Do you want to UPDATE the existing invoice instead of creating a new one?`
            );
            
            if (shouldUpdate) {
              response = await apiCall(`/api/invoices/${existingInvoice.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
              });
              showSuccessMessage('Invoice updated successfully!');
              if (onSuccess) onSuccess(response);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log('No existing invoice found or error searching, creating new one');
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
              {isEditing ? 'Edit Invoice' : isJobCardInvoice ? 'Create Invoice from Job Card' : 'Create Direct Invoice'}
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

          {/* ✅ SERIAL & WARRANTY VALIDATION ERROR */}
          {validationError && (
            <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{validationError}</span>
              </div>
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

          {/* ✅ NEW: Customer Information Section with Regular Customer Toggle */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>
              
              {/* ✅ Only show toggle for direct invoices (not job card invoices) */}
              {!isJobCardInvoice && !isEditing && (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invoiceData.isRegularCustomer}
                    onChange={handleRegularCustomerToggle}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Regular Customer</span>
                </label>
              )}
            </div>

            {/* ✅ Show dropdown if regular customer selected (only for direct invoices) */}
            {!isJobCardInvoice && !isEditing && invoiceData.isRegularCustomer ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={String(invoiceData.customerId)}
                    onChange={handleCustomerSelect}
                    className="w-full px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base"
                    required
                  >
                    <option value="">-- Select a Regular Customer --</option>
                    {regularCustomers && Array.isArray(regularCustomers) && regularCustomers.map((customer, index) => {
                      const cId = customer.customerId || customer.id;
                      return (
                        <option 
                          key={`${cId}-${index}`} 
                          value={String(cId)}
                        >
                          {customer.customerName} | {customer.phoneNumber}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1">Name</label>
                    <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
                      <p className="font-semibold text-gray-900">{invoiceData.customerName || '—'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1">Phone</label>
                    <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
                      <p className="font-semibold text-gray-900">{invoiceData.customerPhone || '—'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1">Email</label>
                    <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
                      <p className="text-sm text-gray-700">{invoiceData.customerEmail || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ✅ Show regular input fields for job card invoices or when regular customer not selected */
              !isJobCardInvoice || isEditing ? (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg">
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
              )
            )}
          </div>

          {/* ✅ ONLY SHOW SERVICES FOR JOB CARD INVOICES */}
          {isJobCardInvoice && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Services (From Job Card)</h4>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                {jobCard?.serviceCategories && jobCard.serviceCategories.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No services added to this job card</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can still create an invoice with only parts/items
                    </p>
                  </div>
                )}
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

          {/* ✅ UPDATED: Show message if no services and no items (ONLY for job card invoices) */}
          {isJobCardInvoice && !jobCard?.serviceCategories?.length && invoiceData.items.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-yellow-800">No services or items added yet</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You need to add at least services or parts/items to create an invoice
              </p>
            </div>
          )}

          {/* ✅ Show message if no items for DIRECT invoice */}
          {!isJobCardInvoice && invoiceData.items.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-yellow-800">No items added yet</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You need to add at least one item to create an invoice
              </p>
            </div>
          )}

          {/* Add Additional Items */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              {isJobCardInvoice ? 'Add Parts/Items (Optional)' : 'Add Parts/Items *'}
            </h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <select
                value={newItem.inventoryItemId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setNewItem({ 
                    ...newItem, 
                    inventoryItemId: selectedId,
                    serialNumbers: [] // Clear serials when item changes
                  });
                  
                  // Show warning if selected item requires serials
                  if (selectedId) {
                    const selected = inventoryItems.find(i => i.id === parseInt(selectedId));
                    if (selected && selected.hasSerialization) {
                      setValidationError(`${selected.name} requires serial numbers. Please add ${newItem.quantity} serial number(s) before adding.`);
                    } else {
                      setValidationError('');
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">{isJobCardInvoice ? 'Select Item (Optional)' : 'Select Item *'}</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name} 
                    {item.hasSerialization && ' 🔢'} {/* Indicator for serialized items */}
                    {item.quantity !== undefined && ` (Stock: ${item.quantity})`} 
                    {item.sellingPrice !== undefined && ` - Rs.${item.sellingPrice.toFixed(2)}`}
                  </option>
                ))}
              </select>

              {/* Show serialization warning */}
              {newItem.inventoryItemId && (() => {
                const selectedItem = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
                if (selectedItem && selectedItem.hasSerialization) {
                  return (
                    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-yellow-800 font-medium">
                          This item requires {newItem.quantity} serial number(s)
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please add serial numbers before adding to invoice
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-5 gap-2">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    setNewItem({ 
                      ...newItem, 
                      quantity: qty 
                    });
                    
                    // Update validation message
                    if (newItem.inventoryItemId) {
                      const selected = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
                      if (selected && selected.hasSerialization) {
                        setValidationError(`${selected.name} requires ${qty} serial number(s). Please add serials before adding.`);
                      }
                    }
                  }}
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
                      // ✅ Clear warranty number if switching to "No Warranty" or "-"
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

              {/* Serial Number Input Section */}
              {newItem.inventoryItemId && (() => {
                const selectedItem = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
                if (selectedItem && selectedItem.hasSerialization) {
                  return (
                    <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-blue-900 text-sm">Serial Numbers Required ({newItem.quantity})</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const serials = prompt(`Enter ${newItem.quantity} serial number(s) (comma separated):`);
                            if (serials) {
                              const serialList = serials.split(',').map(s => s.trim()).filter(s => s);
                              if (serialList.length === newItem.quantity) {
                                setNewItem({ ...newItem, serialNumbers: serialList });
                                setValidationError('');
                              } else {
                                setValidationError(`Please enter exactly ${newItem.quantity} serial number(s)`);
                              }
                            }
                          }}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          Add Serials
                        </button>
                      </div>
                      
                      {/* Display added serials */}
                      {newItem.serialNumbers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Added serials:</p>
                          <div className="flex flex-wrap gap-1">
                            {newItem.serialNumbers.map((serial, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                                {serial}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedSerials = [...newItem.serialNumbers];
                                    updatedSerials.splice(idx, 1);
                                    setNewItem({ ...newItem, serialNumbers: updatedSerials });
                                  }}
                                  className="text-blue-600 hover:text-red-600"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {newItem.serialNumbers.length}/{newItem.quantity} serials added
                          </p>
                        </div>
                      )}
                      
                      {newItem.serialNumbers.length === 0 && (
                        <p className="text-xs text-red-600">
                          ⚠️ Please add {newItem.quantity} serial number(s) for this item
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

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
                  if (!newItem.inventoryItemId) return !isJobCardInvoice;
                  const selectedItem = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
                  
                  // Check serialization
                  if (selectedItem && selectedItem.hasSerialization) {
                    if (newItem.serialNumbers.length !== newItem.quantity) return true;
                  }
                  
                  // ✅ NEW: Check warranty number requirement
                  if (warrantyRequiresNumber(newItem.warranty)) {
                    if (!newItem.warrantyNumber || newItem.warrantyNumber.trim() === '') return true;
                  }
                  
                  return false;
                })()}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium"
              >
                {newItem.inventoryItemId ? 'Add Item to Invoice' : isJobCardInvoice ? 'Skip Adding Items' : 'Select Item to Add'}
              </button>
              
              <p className="text-xs text-gray-600 text-center">
                {isJobCardInvoice ? 'Items are optional. You can create invoice with only services.' : 'At least one item is required for direct invoice.'}
              </p>
            </div>
          </div>

          {/* Items Table - Only show if there are items */}
          {invoiceData.items.length > 0 && (
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Added Parts/Items ({invoiceData.items.length})</h4>
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
                      <th className="px-2 py-2 text-center">Serials</th>
                      <th className="px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => {
                      const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
                      const requiresSerials = inventoryItem?.hasSerialization;
                      const requiresWarrantyNumber = warrantyRequiresNumber(item.warranty);
                      
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                              {item.itemCode || 'SKU-N/A'}
                            </span>
                          </td>
                          
                          <td className="px-2 py-2">
                            <div>
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              {requiresSerials && (
                                <span className="text-xs text-blue-600 font-medium">🔢 Serialized</span>
                              )}
                            </div>
                          </td>
                          
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
                            {requiresSerials ? (
                              <div>
                                {item.serialNumbers && item.serialNumbers.length > 0 ? (
                                  <div className="text-xs">
                                    <span className="text-green-600 font-medium">
                                      ✓ {item.serialNumbers.length}/{item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => addSerialToItem(idx)}
                                      className="ml-1 text-blue-600 hover:text-blue-900 text-xs underline"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => addSerialToItem(idx)}
                                    className="text-red-600 hover:text-red-900 text-xs font-medium"
                                  >
                                    ⚠️ Add Serials
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addSerialToItem(idx)}
                                className="text-blue-600 hover:text-blue-900 text-xs underline"
                              >
                                + Add
                              </button>
                            )}
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
                      );
                    })}
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
                        <p className="text-xs font-semibold text-gray-600">
                          {item.itemName} ({item.serialNumbers.length} serials):
                        </p>
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

              {/* ✅ UPDATED: Validation Status (includes warranty number check) */}
              {(() => {
                const hasSerializedItems = invoiceData.items.some(item => {
                  const invItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
                  return invItem?.hasSerialization;
                });

                const hasWarrantyItems = invoiceData.items.some(item => 
                  warrantyRequiresNumber(item.warranty)
                );
                
                if (hasSerializedItems || hasWarrantyItems) {
                  const allValid = invoiceData.items.every(item => {
                    const invItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
                    
                    // Check serials
                    if (invItem?.hasSerialization) {
                      if (!item.serialNumbers || item.serialNumbers.length !== item.quantity) {
                        return false;
                      }
                    }
                    
                    // ✅ NEW: Check warranty number
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
                            <span className="font-semibold text-red-800">Some items missing required information ⚠️</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Items Total */}
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-600">Parts/Items Subtotal:</p>
                <p className="text-2xl font-bold text-gray-900">Rs.{totals.itemsSubtotal.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-900 mb-4">Invoice Summary</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {/* Show Services Total ONLY if job card invoice and has services */}
              {isJobCardInvoice && totals.serviceTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Services Total:</span>
                  <span className="font-semibold text-green-700">Rs.{totals.serviceTotal.toFixed(2)}</span>
                </div>
              )}
              
              {/* Show Items Total if any */}
              {totals.itemsSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Parts/Items Subtotal:</span>
                  <span className="font-semibold text-blue-700">Rs.{totals.itemsSubtotal.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-3 flex justify-between font-medium">
                <span className="text-gray-700">Combined Subtotal:</span>
                <span className="text-gray-900">Rs.{totals.combinedSubtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <input
                  type="number"
                  value={invoiceData.discount}
                  onWheel={(e) => e.target.blur()}
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
                  onWheel={(e) => e.target.blur()}
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

          {/* ✅ UPDATED: Invoice Content Status */}
          <div className={`p-4 rounded-lg border-2 ${hasContentForInvoice() ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
            <div className="flex items-center">
              {hasContentForInvoice() ? (
                <>
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-green-800">Invoice ready to create</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-yellow-800">
                    {isJobCardInvoice ? 'Add services or items to create invoice' : 'Add items to create invoice'}
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>Invoice will include:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {isJobCardInvoice && jobCard?.serviceCategories?.length > 0 && (
                  <li>{jobCard.serviceCategories.length} service(s) from job card</li>
                )}
                {invoiceData.items.length > 0 && (
                  <li>{invoiceData.items.length} part(s)/item(s)</li>
                )}
                {!hasContentForInvoice() && (
                  <li>No content added yet</li>
                )}
              </ul>
            </div>
          </div>

          {/* Submit Button - Enabled if has services OR items AND all validations pass */}
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
              disabled={loading || !hasContentForInvoice() || (() => {
                // Check if any serialized items are missing serials
                for (const item of invoiceData.items) {
                  const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItem.id);
                  if (inventoryItem?.hasSerialization) {
                    if (!item.serialNumbers || item.serialNumbers.length !== item.quantity) {
                      return true;
                    }
                  }
                  
                  // ✅ NEW: Check if any items with warranty are missing warranty number
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
              {loading ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;