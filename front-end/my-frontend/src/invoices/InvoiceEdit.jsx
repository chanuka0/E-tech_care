// import { useState, useEffect } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';

// // ✅ Helper function to check if warranty requires a warranty number
// const warrantyRequiresNumber = (warranty) => {
//   return warranty && warranty !== '-' && warranty !== 'No Warranty';
// };

// const InvoiceEdit = ({ invoiceId, onSuccess, onClose }) => {
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [validationError, setValidationError] = useState('');
//   const [inventoryItems, setInventoryItems] = useState([]);
  
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerPhone: '',
//     customerEmail: '',
//     items: [],
//     discount: 0,
//     tax: 0,
//     paymentMethod: 'CASH',
//     paidAmount: 0
//   });

//   const [newItem, setNewItem] = useState({
//     inventoryItemId: '',
//     quantity: 1,
//     warranty: 'No Warranty',
//     warrantyNumber: '',
//     serialNumbers: []
//   });

//   const WARRANTY_OPTIONS = [
//     { value: 'No Warranty', label: 'No Warranty' },
//     { value: '7 days', label: '7 Days' },
//     { value: '14 days', label: '14 Days' },
//     { value: '30 days', label: '30 Days' },
//     { value: '2 months', label: '2 Months' },
//     { value: '3 months', label: '3 Months' },
//     { value: '6 months', label: '6 Months' },
//     { value: '1 year', label: '1 Year' },
//     { value: '2 years', label: '2 Years' },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [invoiceData, inventoryData] = await Promise.all([
//           apiCall(`/api/invoices/${invoiceId}`),
//           apiCall('/api/inventory')
//         ]);
        
//         setFormData({
//           customerName: invoiceData.customerName || '',
//           customerPhone: invoiceData.customerPhone || '',
//           customerEmail: invoiceData.customerEmail || '',
//           items: invoiceData.items || [],
//           discount: invoiceData.discount || 0,
//           tax: invoiceData.tax || 0,
//           paymentMethod: invoiceData.paymentMethod || 'CASH',
//           paidAmount: invoiceData.paidAmount || 0
//         });
        
//         setInventoryItems(inventoryData);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load invoice');
//         console.error(err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [invoiceId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'discount' || name === 'tax' || name === 'paidAmount' 
//         ? parseFloat(value) || 0 
//         : value
//     }));
//   };

//   const updateItemWarrantyNumber = (index, warrantyNumber) => {
//     setFormData(prev => ({
//       ...prev,
//       items: prev.items.map((item, i) => 
//         i === index ? { ...item, warrantyNumber } : item
//       )
//     }));
//   };

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

//     // ✅ NEW: Validate warranty number
//     if (warrantyRequiresNumber(newItem.warranty)) {
//       if (!newItem.warrantyNumber || newItem.warrantyNumber.trim() === '') {
//         setValidationError(`Warranty number is required when warranty is selected (Warranty: ${newItem.warranty})`);
//         return;
//       }
//     }

//     const item = {
//       inventoryItem: { id: parseInt(newItem.inventoryItemId) },
//       itemCode: selectedItem.sku,
//       itemName: selectedItem.name,
//       quantity: newItem.quantity,
//       unitPrice: selectedItem.sellingPrice,
//       total: newItem.quantity * selectedItem.sellingPrice,
//       warranty: newItem.warranty,
//       warrantyNumber: warrantyRequiresNumber(newItem.warranty) ? newItem.warrantyNumber : '',
//       serialNumbers: newItem.serialNumbers
//     };

//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, item]
//     }));

//     setNewItem({
//       inventoryItemId: '',
//       quantity: 1,
//       warranty: 'No Warranty',
//       warrantyNumber: '',
//       serialNumbers: []
//     });

//     setError('');
//     setValidationError('');
//   };

//   const removeItem = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index)
//     }));
//   };

//   const updateItemWarranty = (index, warranty) => {
//     setFormData(prev => ({
//       ...prev,
//       items: prev.items.map((item, i) => 
//         i === index ? { 
//           ...item, 
//           warranty,
//           // ✅ Clear warranty number if switching to "No Warranty" or "-"
//           warrantyNumber: warrantyRequiresNumber(warranty) ? item.warrantyNumber : ''
//         } : item
//       )
//     }));
//   };

//   const calculateTotals = () => {
//     const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
//     const total = subtotal - formData.discount + formData.tax;
//     const balance = total - formData.paidAmount;
//     return { subtotal, total, balance };
//   };

//   // ✅ NEW: Validate all items before submitting (including warranty numbers)
//   const validateAllItems = () => {
//     for (const item of formData.items) {
//       // ✅ Validate warranty number
//       if (warrantyRequiresNumber(item.warranty)) {
//         if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
//           return {
//             valid: false,
//             message: `Warranty number is required for item: ${item.itemName} (Warranty: ${item.warranty})`
//           };
//         }
//       }
//     }
    
//     return { valid: true };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError('');
//     setValidationError('');

//     if (formData.items.length === 0) {
//       setError('Please add at least one item');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.customerName.trim()) {
//       setError('Customer name is required');
//       setSubmitting(false);
//       return;
//     }

//     // ✅ NEW: Validate all items have required warranty numbers
//     const validation = validateAllItems();
//     if (!validation.valid) {
//       setValidationError(validation.message);
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const { subtotal, total, balance } = calculateTotals();

//       const payload = {
//         customerName: formData.customerName,
//         customerPhone: formData.customerPhone,
//         customerEmail: formData.customerEmail,
//         items: formData.items,
//         subtotal,
//         discount: formData.discount,
//         tax: formData.tax,
//         total,
//         paidAmount: formData.paidAmount,
//         balance,
//         paymentMethod: formData.paymentMethod,
//         paymentStatus: formData.paidAmount >= total ? 'PAID' : formData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
//       };

//       const response = await apiCall(`/api/invoices/${invoiceId}`, {
//         method: 'PUT',
//         body: JSON.stringify(payload)
//       });

//       showSuccessMessage('Invoice updated successfully!');
//       if (onSuccess) onSuccess(response);
//     } catch (err) {
//       setError(err.message || 'Failed to update invoice');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const { subtotal, total, balance } = calculateTotals();

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* ✅ VALIDATION ERROR */}
//         {validationError && (
//           <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <span className="font-semibold">{validationError}</span>
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Customer Details */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Customer Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   value={formData.customerName}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//                 <input
//                   type="tel"
//                   name="customerPhone"
//                   value={formData.customerPhone}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                 <input
//                   type="email"
//                   name="customerEmail"
//                   value={formData.customerEmail}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Add Items */}
//           <div className="border-b border-gray-200 pb-6">
//             <h4 className="font-semibold text-gray-900 mb-4">Add Items</h4>
//             <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
//               <select
//                 value={newItem.inventoryItemId}
//                 onChange={(e) => setNewItem({ ...newItem, inventoryItemId: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//               >
//                 <option value="">Select Item</option>
//                 {inventoryItems.map(item => (
//                   <option key={item.id} value={item.id}>
//                     {item.sku} - {item.name} (Stock: {item.quantity}) - Rs.{item.sellingPrice.toFixed(2)}
//                   </option>
//                 ))}
//               </select>

//               <div className="grid grid-cols-5 gap-2">
//                 <input
//                   type="number"
//                   value={newItem.quantity}
//                   onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
//                   min="1"
//                   className="px-2 py-2 border border-gray-300 rounded-md text-sm"
//                   placeholder="Qty"
//                 />
//                 <input
//                   type="text"
//                   value={newItem.inventoryItemId ? inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice.toFixed(2) || '0' : '0'}
//                   disabled
//                   className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
//                   placeholder="Price"
//                 />
//                 <select
//                   value={newItem.warranty}
//                   onChange={(e) => {
//                     const warranty = e.target.value;
//                     setNewItem({ 
//                       ...newItem, 
//                       warranty,
//                       // ✅ Clear warranty number if switching to "No Warranty"
//                       warrantyNumber: warrantyRequiresNumber(warranty) ? newItem.warrantyNumber : ''
//                     });
//                   }}
//                   className="px-2 py-2 border border-gray-300 rounded-md text-sm"
//                 >
//                   {WARRANTY_OPTIONS.map(opt => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
                
//                 {/* ✅ UPDATED: Conditional Warranty Number Input */}
//                 {warrantyRequiresNumber(newItem.warranty) ? (
//                   <input
//                     type="text"
//                     value={newItem.warrantyNumber}
//                     onChange={(e) => setNewItem({ ...newItem, warrantyNumber: e.target.value.slice(0, 5) })}
//                     placeholder="Warr. # *"
//                     maxLength="5"
//                     className="px-2 py-2 border border-red-300 rounded-md text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-500"
//                     title="Warranty number required (4-5 digits)"
//                     required
//                   />
//                 ) : (
//                   <input
//                     type="text"
//                     value=""
//                     disabled
//                     placeholder="N/A"
//                     className="px-2 py-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-center text-gray-400"
//                     title="No warranty number required"
//                   />
//                 )}
                
//                 <input
//                   type="text"
//                   value={(newItem.quantity * (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice || 0)).toFixed(2)}
//                   disabled
//                   className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
//                   placeholder="Total"
//                 />
//               </div>

//               {/* ✅ NEW: Warranty Number Warning */}
//               {warrantyRequiresNumber(newItem.warranty) && !newItem.warrantyNumber && (
//                 <div className="bg-red-50 border border-red-300 p-3 rounded-lg">
//                   <div className="flex items-center">
//                     <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     <span className="text-red-800 font-medium">
//                       Warranty number is required (Warranty: {newItem.warranty})
//                     </span>
//                   </div>
//                 </div>
//               )}

//               <button
//                 type="button"
//                 onClick={handleAddItem}
//                 disabled={(() => {
//                   if (!newItem.inventoryItemId) return true;
                  
//                   // ✅ Check warranty number requirement
//                   if (warrantyRequiresNumber(newItem.warranty)) {
//                     if (!newItem.warrantyNumber || newItem.warrantyNumber.trim() === '') return true;
//                   }
                  
//                   return false;
//                 })()}
//                 className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium"
//               >
//                 Add Item
//               </button>
//             </div>
//           </div>

//           {/* Items Table */}
//           {formData.items.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-xs">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-2 py-2 text-left">Item Code</th>
//                       <th className="px-2 py-2 text-left">Item</th>
//                       <th className="px-2 py-2 text-center">Qty</th>
//                       <th className="px-2 py-2 text-right">Price</th>
//                       <th className="px-2 py-2 text-center">Warranty</th>
//                       <th className="px-2 py-2 text-center">Warranty #</th>
//                       <th className="px-2 py-2 text-right">Total</th>
//                       <th className="px-2 py-2 text-center">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, idx) => {
//                       const requiresWarrantyNumber = warrantyRequiresNumber(item.warranty);
                      
//                       return (
//                         <tr key={idx} className="border-t">
//                           <td className="px-2 py-2">
//                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
//                               {item.itemCode || 'SKU-N/A'}
//                             </span>
//                           </td>
                          
//                           <td className="px-2 py-2">{item.itemName}</td>
//                           <td className="px-2 py-2 text-center">{item.quantity}</td>
//                           <td className="px-2 py-2 text-right">Rs.{item.unitPrice.toFixed(2)}</td>
//                           <td className="px-2 py-2 text-center">
//                             <select
//                               value={item.warranty}
//                               onChange={(e) => updateItemWarranty(idx, e.target.value)}
//                               className="px-1 py-1 border border-gray-300 rounded text-xs"
//                             >
//                               {WARRANTY_OPTIONS.map(opt => (
//                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//                               ))}
//                             </select>
//                           </td>
                          
//                           {/* ✅ UPDATED: Conditional Warranty Number Input */}
//                           <td className="px-2 py-2 text-center">
//                             {requiresWarrantyNumber ? (
//                               <input
//                                 type="text"
//                                 placeholder="e.g., 1234 *"
//                                 maxLength="5"
//                                 value={item.warrantyNumber || ''}
//                                 onChange={(e) => updateItemWarrantyNumber(idx, e.target.value)}
//                                 className={`w-16 px-2 py-1 border ${
//                                   !item.warrantyNumber ? 'border-red-500 bg-red-50' : 'border-green-300'
//                                 } rounded text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-green-500`}
//                                 required
//                               />
//                             ) : (
//                               <span className="text-xs text-gray-400">N/A</span>
//                             )}
//                           </td>
                          
//                           <td className="px-2 py-2 text-right font-semibold">Rs.{item.total.toFixed(2)}</td>
//                           <td className="px-2 py-2 text-center">
//                             <button
//                               type="button"
//                               onClick={() => removeItem(idx)}
//                               className="text-red-600 hover:text-red-900 text-xs"
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* ✅ NEW: Validation Status */}
//               {(() => {
//                 const hasWarrantyItems = formData.items.some(item => 
//                   warrantyRequiresNumber(item.warranty)
//                 );
                
//                 if (hasWarrantyItems) {
//                   const allValid = formData.items.every(item => {
//                     // Check warranty number
//                     if (warrantyRequiresNumber(item.warranty)) {
//                       if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
//                         return false;
//                       }
//                     }
                    
//                     return true;
//                   });
                  
//                   return (
//                     <div className={`mt-4 p-3 rounded-lg border-2 ${allValid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
//                       <div className="flex items-center">
//                         {allValid ? (
//                           <>
//                             <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                             </svg>
//                             <span className="font-semibold text-green-800">All items are valid ✓</span>
//                           </>
//                         ) : (
//                           <>
//                             <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                             </svg>
//                             <span className="font-semibold text-red-800">Some items missing warranty numbers ⚠️</span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               })()}
//             </div>
//           )}

//           {/* Discount & Tax */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs.)</label>
//               <input
//                 type="number"
//                 name="discount"
//                 value={formData.discount}
//                 onChange={handleChange}
//                 onWheel={(e) => e.target.blur()}
//                 min="0"
//                 step="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Tax (Rs.)</label>
//               <input
//                 type="number"
//                 name="tax"
//                 value={formData.tax}
//                 onChange={handleChange}
//                 onWheel={(e) => e.target.blur()}
//                 min="0"
//                 step="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
//                   name="paymentMethod"
//                   value={formData.paymentMethod}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 >
//                   <option value="CASH">Cash</option>
//                   <option value="CARD">Card</option>
//                   <option value="CHEQUE">Cheque</option>
//                   <option value="UPI">UPI</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (Rs.)</label>
//                 <input
//                   type="number"
//                   name="paidAmount"
//                   value={formData.paidAmount}
//                   onWheel={(e) => e.target.blur()}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting || (() => {
//                 // ✅ Check if any items with warranty are missing warranty number
//                 for (const item of formData.items) {
//                   if (warrantyRequiresNumber(item.warranty)) {
//                     if (!item.warrantyNumber || item.warrantyNumber.trim() === '') {
//                       return true;
//                     }
//                   }
//                 }
//                 return false;
//               })()}
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md font-medium text-sm"
//             >
//               {submitting ? 'Updating...' : 'Update Invoice'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default InvoiceEdit;


import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';

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

  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    items: [], discount: 0, tax: 0, paymentMethod: 'CASH', paidAmount: 0
  });

  const [newItem, setNewItem] = useState({
    inventoryItemId: '', quantity: 1, warranty: 'No Warranty', warrantyNumber: '', serialNumbers: []
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [invoiceData, inventoryData] = await Promise.all([
          apiCall(`/api/invoices/${invoiceId}`),
          apiCall('/api/inventory')
        ]);
        setFormData({
          customerName: invoiceData.customerName || '', customerPhone: invoiceData.customerPhone || '',
          customerEmail: invoiceData.customerEmail || '', items: invoiceData.items || [],
          discount: invoiceData.discount || 0, tax: invoiceData.tax || 0,
          paymentMethod: invoiceData.paymentMethod || 'CASH', paidAmount: invoiceData.paidAmount || 0
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

  const calcTotals = (data = formData) => {
    const subtotal = data.items.reduce((s, i) => s + i.total, 0);
    const total = subtotal - data.discount + data.tax;
    const balance = total - data.paidAmount;
    return { subtotal, total, balance };
  };

  // ✅ FIX 2: Paid amount cannot exceed total
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
    setFormData(p => ({
      ...p,
      items: [...p.items, {
        inventoryItem: { id: parseInt(newItem.inventoryItemId) },
        itemCode: sel.sku, itemName: sel.name, quantity: newItem.quantity,
        unitPrice: sel.sellingPrice, total: newItem.quantity * sel.sellingPrice,
        warranty: newItem.warranty, warrantyNumber: warrantyRequiresNumber(newItem.warranty) ? newItem.warrantyNumber : '',
        serialNumbers: newItem.serialNumbers
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
    if (formData.items.length === 0) { setError('Add at least one item'); setSubmitting(false); return; }
    if (!formData.customerName.trim()) { setError('Customer name required'); setSubmitting(false); return; }
    const v = validateAllItems();
    if (!v.valid) { setValidationError(v.message); setSubmitting(false); return; }

    const { subtotal, total } = calcTotals();
    // ✅ Final guard
    const safePaid = Math.min(formData.paidAmount, total);

    try {
      const payload = {
        customerName: formData.customerName, customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail, items: formData.items, subtotal,
        discount: formData.discount, tax: formData.tax, total,
        paidAmount: safePaid, balance: total - safePaid,
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

  const { subtotal, total, balance } = calcTotals();
  const paidExceeds = formData.paidAmount > total;
  const allValid = formData.items.every(it => !warrantyRequiresNumber(it.warranty) || it.warrantyNumber?.trim());
  const canSubmit = formData.items.length > 0 && formData.customerName.trim() && allValid && !paidExceeds && !submitting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* ✅ FIX 1: Single page — h-screen flex flex-col overflow-hidden */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center flex-shrink-0">
          <h3 className="text-base font-bold">Edit Invoice</h3>
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

            {/* === COL 1: Customer Info + Items List === */}
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
                </div>
              </div>

              {/* Existing Items list */}
              <div className={sec + ' flex-1 flex flex-col overflow-hidden min-h-0'}>
                <p className={secT}>Current Items ({formData.items.length})</p>
                <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                  {formData.items.length === 0
                    ? <p className="text-xs text-gray-400">No items added yet</p>
                    : formData.items.map((item, idx) => {
                      const needsW = warrantyRequiresNumber(item.warranty);
                      const itemOk = !needsW || item.warrantyNumber?.trim();
                      return (
                        <div key={idx} className={`border rounded p-1.5 text-xs ${!itemOk ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{item.itemName}</p>
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
                  <p className="text-xs font-bold text-gray-700">Items Total: Rs.{subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* === COL 2: Add New Items === */}
            <div className="flex flex-col overflow-hidden min-h-0">
              <div className={sec + ' flex-1 flex flex-col overflow-hidden min-h-0'}>
                <p className={secT}>Add Items</p>
                <div className="space-y-1.5 flex-shrink-0">
                  <select value={newItem.inventoryItemId} onChange={e => setNewItem({ ...newItem, inventoryItemId: e.target.value, serialNumbers: [] })} className={inp}>
                    <option value="">Select Item</option>
                    {inventoryItems.map(it => (
                      <option key={it.id} value={it.id}>{it.sku} - {it.name} (Stock: {it.quantity}) Rs.{it.sellingPrice?.toFixed(2)}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-5 gap-1">
                    {/* ✅ FIX 3: onWheel blur */}
                    <input type="number" value={newItem.quantity} min="1" placeholder="Qty"
                      onWheel={e => e.target.blur()}
                      onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className={inp} />
                    <input type="text" value={newItem.inventoryItemId ? (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice.toFixed(2) || '0') : '0'} disabled className={inp + ' bg-gray-100'} placeholder="Price" />
                    <select value={newItem.warranty} onChange={e => { const w = e.target.value; setNewItem({ ...newItem, warranty: w, warrantyNumber: warrantyRequiresNumber(w) ? newItem.warrantyNumber : '' }); }} className={inp}>
                      {WARRANTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {warrantyRequiresNumber(newItem.warranty)
                      ? <input type="text" value={newItem.warrantyNumber} onChange={e => setNewItem({ ...newItem, warrantyNumber: e.target.value.slice(0, 5) })} placeholder="W# *" maxLength="5" className={inp + ' border-red-300 font-mono text-center'} />
                      : <input type="text" disabled placeholder="N/A" className={inp + ' bg-gray-100 text-center text-gray-400'} />}
                    <input type="text" value={(newItem.quantity * (inventoryItems.find(i => i.id === parseInt(newItem.inventoryItemId))?.sellingPrice || 0)).toFixed(2)} disabled className={inp + ' bg-gray-100'} />
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

                {/* Warranty items validation */}
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
                    {/* ✅ FIX 3: onWheel blur */}
                    <input type="number" name="discount" value={formData.discount} min="0" step="0.01"
                      onWheel={e => e.target.blur()}
                      onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Tax (Rs.)</label>
                    {/* ✅ FIX 3: onWheel blur */}
                    <input type="number" name="tax" value={formData.tax} min="0" step="0.01"
                      onWheel={e => e.target.blur()}
                      onChange={handleChange} className={inp} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-2">
                <p className={secT}>Cost Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Items:</span><span className="font-semibold">Rs.{subtotal.toFixed(2)}</span></div>
                  {formData.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount:</span><span className="text-red-600">-Rs.{formData.discount.toFixed(2)}</span></div>}
                  {formData.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax:</span><span>+Rs.{formData.tax.toFixed(2)}</span></div>}
                  <div className="flex justify-between border-t-2 border-gray-400 pt-1"><span className="font-bold text-gray-900">TOTAL:</span><span className="font-bold text-blue-700 text-sm">Rs.{total.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Checklist */}
              <div className={sec}>
                <p className={secT}>Checklist</p>
                <ul className="text-xs space-y-1">
                  <li className={formData.customerName.trim() ? 'text-green-600' : 'text-red-600'}>{formData.customerName.trim() ? '✓' : '✕'} Customer name</li>
                  <li className={formData.items.length > 0 ? 'text-green-600' : 'text-red-600'}>{formData.items.length > 0 ? '✓' : '✕'} Has items ({formData.items.length})</li>
                  <li className={!paidExceeds ? 'text-green-600' : 'text-red-600'}>{!paidExceeds ? '✓' : '✕'} Paid ≤ total</li>
                  <li className={allValid ? 'text-green-600' : 'text-red-600'}>{allValid ? '✓' : '✕'} All warranty numbers</li>
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
                    {/* ✅ FIX 2 + FIX 3: capped handler + onWheel blur */}
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
                  <p className="text-xs text-blue-500 font-medium">Total</p>
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