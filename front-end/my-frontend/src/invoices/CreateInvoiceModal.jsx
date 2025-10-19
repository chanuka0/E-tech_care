// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';

// const CreateInvoiceModal = ({ jobCard, onSuccess, onClose }) => {
//   const { apiCall } = useApi();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [inventoryItems, setInventoryItems] = useState([]);

//   const [invoiceData, setInvoiceData] = useState({
//     jobCardId: jobCard.id,
//     customerName: jobCard.customerName,
//     customerPhone: jobCard.customerPhone,
//     items: [],
//     discount: 0,
//     tax: 0,
//     specialNotes: '',
//     warranty: '',
//     paymentMethod: 'CASH',
//     paidAmount: jobCard.advancePayment || 0
//   });

//   const [newItem, setNewItem] = useState({
//     inventoryItemId: '',
//     quantity: 1,
//     description: '',
//     serialNumbers: []
//   });

//   useEffect(() => {
//     const fetchInventory = async () => {
//       try {
//         const data = await apiCall('/api/inventory');
//         setInventoryItems(data);
//       } catch (err) {
//         console.error('Failed to fetch inventory:', err);
//       }
//     };
//     fetchInventory();
//   }, []);

//   const handleAddItem = () => {
//     if (!newItem.inventoryItemId || newItem.quantity <= 0) {
//       setError('Please select item and quantity');
//       return;
//     }

//     const selectedItem = inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId));
//     if (!selectedItem) {
//       setError('Item not found');
//       return;
//     }

//     if (newItem.quantity > selectedItem.quantity) {
//       setError(`Only ${selectedItem.quantity} available`);
//       return;
//     }

//     // const item = {
//     //   inventoryItemId: parseInt(newItem.inventoryItemId),
//     //   itemName: selectedItem.name,
//     //   quantity: newItem.quantity,
//     //   unitPrice: selectedItem.sellingPrice,
//     //   description: newItem.description || selectedItem.description,
//     //   total: newItem.quantity * selectedItem.sellingPrice,
//     //   serialNumbers: newItem.serialNumbers
//     // };

//     // inside handleAddItem()
// const item = {
//   inventoryItem: { id: parseInt(newItem.inventoryItemId) }, // <-- send nested object
//   itemName: selectedItem.name,
//   quantity: newItem.quantity,
//   unitPrice: selectedItem.sellingPrice,
//   description: newItem.description || selectedItem.description,
//   total: newItem.quantity * selectedItem.sellingPrice,
//   serialNumbers: newItem.serialNumbers
// };

//     setInvoiceData(prev => ({
//       ...prev,
//       items: [...prev.items, item]
//     }));

//     setNewItem({
//       inventoryItemId: '',
//       quantity: 1,
//       description: '',
//       serialNumbers: []
//     });

//     setError('');
//   };

//   const removeItem = (index) => {
//     setInvoiceData(prev => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index)
//     }));
//   };

//   const calculateTotals = () => {
//     const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
//     const total = subtotal - invoiceData.discount + invoiceData.tax;
//     const balance = total - invoiceData.paidAmount;

//     return { subtotal, total, balance };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (invoiceData.items.length === 0) {
//       setError('Please add at least one item');
//       setLoading(false);
//       return;
//     }

//     try {
//       const { subtotal, total, balance } = calculateTotals();

//       const payload = {
//         jobCardId: jobCard.id,
//         customerName: invoiceData.customerName,
//         customerPhone: invoiceData.customerPhone,
//         items: invoiceData.items,
//         subtotal,
//         discount: invoiceData.discount,
//         tax: invoiceData.tax,
//         total,
//         paidAmount: invoiceData.paidAmount,
//         balance,
//         paymentMethod: invoiceData.paymentMethod,
//         paymentStatus: invoiceData.paidAmount >= total ? 'PAID' : invoiceData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
//         specialNotes: invoiceData.specialNotes,
//         warranty: invoiceData.warranty,
//         createdBy: getUserIdFromToken()
//       };

//       const response = await apiCall('/api/invoices', {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       showSuccessMessage('Invoice created successfully!');
//       if (onSuccess) onSuccess(response);
//     } catch (err) {
//       setError(err.message || 'Failed to create invoice');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getUserIdFromToken = () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         let userId = payload.userId || payload.id || payload.sub;
//         return typeof userId === 'string' ? parseInt(userId, 10) : userId;
//       }
//     } catch (error) {
//       console.error('Error decoding token:', error);
//     }
//     return 1;
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const { subtotal, total, balance } = calculateTotals();

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
//         <div className="bg-blue-600 text-white p-6 flex justify-between items-center sticky top-0">
//           <h3 className="text-xl font-bold">Create Invoice from Job Card</h3>
//           <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-96 overflow-y-auto">
//           {error && (
//             <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Job Card & Customer Info */}
//           <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//             <div>
//               <p className="text-xs text-gray-600">Job Card</p>
//               <p className="font-semibold text-gray-900">{jobCard.jobNumber}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-600">Customer</p>
//               <p className="font-semibold text-gray-900">{jobCard.customerName}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-600">Advance Payment</p>
//               <p className="font-semibold text-green-600">Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-600">Estimated Cost</p>
//               <p className="font-semibold text-blue-600">Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}</p>
//             </div>
//           </div>

//           {/* Add Items */}
//           <div className="border-b pb-4">
//             <h4 className="font-semibold text-gray-900 mb-4">Add Items</h4>
//             <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
//                 <select
//                   value={newItem.inventoryItemId}
//                   onChange={(e) => setNewItem({ ...newItem, inventoryItemId: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 >
//                   <option value="">Select Item</option>
//                   {inventoryItems.map(item => (
//                     <option key={item.id} value={item.id}>
//                       {item.name} (Qty: {item.quantity}) - Rs.{item.sellingPrice.toFixed(2)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="grid grid-cols-3 gap-2">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                   <input
//                     type="number"
//                     value={newItem.quantity}
//                     onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
//                     min="1"
//                     className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
//                   <input
//                     type="text"
//                     value={newItem.inventoryItemId ? inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice.toFixed(2) || '0' : '0'}
//                     disabled
//                     className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
//                   <input
//                     type="text"
//                     value={(newItem.quantity * (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice || 0)).toFixed(2)}
//                     disabled
//                     className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                 <textarea
//                   value={newItem.description}
//                   onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
//                   rows="2"
//                   className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
//                   placeholder="Optional description"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleAddItem}
//                 className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
//               >
//                 Add Item
//               </button>
//             </div>
//           </div>

//           {/* Added Items Table */}
//           {invoiceData.items.length > 0 && (
//             <div className="border-b pb-4">
//               <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-2 py-2 text-left">Item</th>
//                       <th className="px-2 py-2 text-center">Qty</th>
//                       <th className="px-2 py-2 text-right">Rate</th>
//                       <th className="px-2 py-2 text-right">Total</th>
//                       <th className="px-2 py-2 text-center">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {invoiceData.items.map((item, idx) => (
//                       <tr key={idx} className="border-t">
//                         <td className="px-2 py-2">{item.itemName}</td>
//                         <td className="px-2 py-2 text-center">{item.quantity}</td>
//                         <td className="px-2 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
//                         <td className="px-2 py-2 text-right font-semibold">${item.total.toFixed(2)}</td>
//                         <td className="px-2 py-2 text-center">
//                           <button
//                             type="button"
//                             onClick={() => removeItem(idx)}
//                             className="text-red-600 hover:text-red-900 text-xs"
//                           >
//                             Remove
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Discount, Tax, Notes */}
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
//                 <input
//                   type="number"
//                   value={invoiceData.discount}
//                   onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
//                 <input
//                   type="number"
//                   value={invoiceData.tax}
//                   onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
//               <input
//                 type="text"
//                 value={invoiceData.warranty}
//                 onChange={(e) => setInvoiceData({ ...invoiceData, warranty: e.target.value })}
//                 placeholder="e.g., 30 days, 1 year"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
//               <textarea
//                 value={invoiceData.specialNotes}
//                 onChange={(e) => setInvoiceData({ ...invoiceData, specialNotes: e.target.value })}
//                 rows="2"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 placeholder="Any special notes for this invoice"
//               />
//             </div>
//           </div>

//           {/* Payment Section */}
//           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
//             <div className="grid grid-cols-3 gap-3 text-sm">
//               <div>
//                 <p className="text-blue-600 font-medium">Subtotal</p>
//                 <p className="text-lg font-bold">Rs.{subtotal.toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className="text-blue-600 font-medium">Total</p>
//                 <p className="text-lg font-bold">Rs.{total.toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className="text-blue-600 font-medium">Balance</p>
//                 <p className="text-lg font-bold">Rs.{balance.toFixed(2)}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//                 <select
//                   value={invoiceData.paymentMethod}
//                   onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 >
//                   <option value="CASH">Cash</option>
//                   <option value="CARD">Card</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
//                 <input
//                   type="number"
//                   value={invoiceData.paidAmount}
//                   onChange={(e) => setInvoiceData({ ...invoiceData, paidAmount: parseFloat(e.target.value) || 0 })}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex space-x-3 pt-4 border-t sticky bottom-0 bg-white">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium"
//             >
//               {loading ? 'Creating...' : 'Create Invoice'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

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

const CreateInvoiceModal = ({ jobCard = null, onSuccess, onClose }) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);

  const [invoiceData, setInvoiceData] = useState({
    jobCardId: jobCard?.id || null,
    customerName: jobCard?.customerName || '',
    customerPhone: jobCard?.customerPhone || '',
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

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await apiCall('/api/inventory');
        setInventoryItems(data);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        setError('Failed to load inventory items');
      }
    };
    fetchInventory();
  }, [apiCall]);

  // AUTO-POPULATE from jobCard.usedItems only if jobCard exists
  useEffect(() => {
    if (jobCard && jobCard.usedItems && jobCard.usedItems.length > 0) {
      const autoPopulatedItems = jobCard.usedItems.map(used => ({
        inventoryItem: { id: used.inventoryItem.id },
        itemName: used.inventoryItem.name,
        quantity: used.quantityUsed,
        unitPrice: used.inventoryItem.sellingPrice,
        total: used.quantityUsed * used.inventoryItem.sellingPrice,
        warranty: 'No Warranty',
        serialNumbers: []
      }));

      setInvoiceData(prev => ({
        ...prev,
        items: autoPopulatedItems
      }));
    }
  }, [jobCard]);

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
    const total = subtotal - invoiceData.discount + invoiceData.tax;
    const balance = total - invoiceData.paidAmount;
    return { subtotal, total, balance };
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
      const { subtotal, total, balance } = calculateTotals();

      const payload = {
        jobCardId: invoiceData.jobCardId,
        customerName: invoiceData.customerName,
        customerPhone: invoiceData.customerPhone,
        items: invoiceData.items,
        subtotal,
        discount: invoiceData.discount,
        tax: invoiceData.tax,
        total,
        paidAmount: invoiceData.paidAmount,
        balance,
        paymentMethod: invoiceData.paymentMethod,
        paymentStatus: invoiceData.paidAmount >= total ? 'PAID' : invoiceData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
        createdBy: getUserIdFromToken()
      };

      const response = await apiCall('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showSuccessMessage('Invoice created successfully!');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
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
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const { subtotal, total, balance } = calculateTotals();
  const isJobCardInvoice = jobCard != null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-xl font-bold">
            {isJobCardInvoice ? 'Create Invoice from Job Card' : 'Create Direct Invoice'}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Job Card Info - Only show if from job card */}
          {isJobCardInvoice && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Job Card</p>
                <p className="font-semibold text-gray-900">{jobCard.jobNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{jobCard.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Advance Payment</p>
                <p className="font-semibold text-green-600">Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Estimated Cost</p>
                <p className="font-semibold text-blue-600">Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          )}

          {/* Customer Details - For Direct Invoices */}
          {!isJobCardInvoice && (
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
              </div>
            </div>
          )}

          {/* Add Items */}
          <div className="border-b pb-4">
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
                Add Item
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
            </div>
          )}

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs.)</label>
              <input
                type="number"
                value={invoiceData.discount}
                onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax (Rs.)</label>
              <input
                type="number"
                value={invoiceData.tax}
                onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
