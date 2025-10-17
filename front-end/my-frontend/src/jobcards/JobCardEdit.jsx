// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';

// const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
//   const { apiCall } = useApi();
//   const { user, isAdmin } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerPhone: '',
//     customerEmail: '',
//     deviceType: 'LAPTOP',
//     brandId: '',
//     modelId: '',
//     faultDescription: '',
//     notes: '',
//     advancePayment: 0,
//     estimatedCost: 0,
//     status: 'PENDING'
//   });

//   const [originalData, setOriginalData] = useState(null);

//   const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR'];
//   const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
//   const brands = ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Samsung', 'Canon', 'Epson', 'Brother'];
//   const models = ['Model A', 'Model B', 'Model C', 'Model D', 'Model E'];

//   // Fetch job card data
//   useEffect(() => {
//     const fetchJobCard = async () => {
//       try {
//         setFetchLoading(true);
//         const data = await apiCall(`/api/jobcards/${jobCardId}`);
//         setFormData({
//           customerName: data.customerName || '',
//           customerPhone: data.customerPhone || '',
//           customerEmail: data.customerEmail || '',
//           deviceType: data.deviceType || 'LAPTOP',
//           brandId: data.brandId || '',
//           modelId: data.modelId || '',
//           faultDescription: data.faultDescription || '',
//           notes: data.notes || '',
//           advancePayment: data.advancePayment || 0,
//           estimatedCost: data.estimatedCost || 0,
//           status: data.status || 'PENDING'
//         });
//         setOriginalData(data);
//       } catch (err) {
//         setError('Failed to load job card details');
//         console.error(err);
//       } finally {
//         setFetchLoading(false);
//       }
//     };

//     if (jobCardId) {
//       fetchJobCard();
//     }
//   }, [jobCardId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Validation
//     if (!formData.customerName.trim()) {
//       setError('Customer name is required');
//       setLoading(false);
//       return;
//     }

//     if (!formData.customerPhone.trim()) {
//       setError('Customer phone is required');
//       setLoading(false);
//       return;
//     }

//     if (!formData.faultDescription.trim()) {
//       setError('Fault description is required');
//       setLoading(false);
//       return;
//     }

//     try {
//       const payload = {
//         ...formData,
//         advancePayment: parseFloat(formData.advancePayment) || 0,
//         estimatedCost: parseFloat(formData.estimatedCost) || 0,
//         serials: originalData?.serials || []  // ← ADD THIS LINE to preserve serials

//       };

//       const response = await apiCall(`/api/jobcards/${jobCardId}`, {
//         method: 'PUT',
//         body: JSON.stringify(payload)
//       });

//       // Success notification
//       const successMsg = document.createElement('div');
//       successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//       successMsg.textContent = `Job Card ${response.jobNumber} updated successfully!`;
//       document.body.appendChild(successMsg);
//       setTimeout(() => successMsg.remove(), 3000);

//       if (onSuccess) onSuccess(response);
//     } catch (err) {
//       setError(err.message || 'Failed to update job card');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetchLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Edit Job Card</h2>
//             {originalData && (
//               <p className="text-sm text-gray-500 mt-1">Job Number: {originalData.jobNumber}</p>
//             )}
//           </div>
//           {onCancel && (
//             <button
//               onClick={onCancel}
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

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Customer Information */}
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
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="customerPhone"
//                   value={formData.customerPhone}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email (Optional)
//                 </label>
//                 <input
//                   type="email"
//                   name="customerEmail"
//                   value={formData.customerEmail}
//                   onChange={handleChange}
//                   autoComplete="off"
//                   placeholder="example@email.com"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Device Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Device Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="deviceType"
//                   value={formData.deviceType}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   {deviceTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Brand
//                 </label>
//                 <select
//                   name="brandId"
//                   value={formData.brandId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Brand</option>
//                   {brands.map(brand => (
//                     <option key={brand} value={brand}>{brand}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Model
//                 </label>
//                 <select
//                   name="modelId"
//                   value={formData.modelId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Model</option>
//                   {models.map(model => (
//                     <option key={model} value={model}>{model}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Status Update */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Job Status <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   {statusOptions.map(status => (
//                     <option key={status} value={status}>{status.replace('_', ' ')}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             {formData.status === 'COMPLETED' && (
//               <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="text-sm text-green-800">
//                   ℹ️ Marking as COMPLETED will record the completion timestamp.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Service Details */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Fault Description <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   name="faultDescription"
//                   value={formData.faultDescription}
//                   onChange={handleChange}
//                   rows="3"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Additional Notes
//                 </label>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows="3"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Payment Information */}
//           <div className="pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Advance Payment
//                 </label>
//                 <input
//                   type="number"
//                   name="advancePayment"
//                   value={formData.advancePayment}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Estimated Cost
//                 </label>
//                 <input
//                   type="number"
//                   name="estimatedCost"
//                   value={formData.estimatedCost}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Serial Numbers Display (Read-only) */}
//           {originalData?.serials && originalData.serials.length > 0 && (
//             <div className="pb-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Serial Numbers</h3>
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="space-y-2">
//                   {originalData.serials.map((serial, index) => (
//                     <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
//                       <div>
//                         <span className="font-medium text-gray-900">{serial.serialType}:</span>
//                         <span className="ml-2 text-gray-700">{serial.serialValue}</span>
//                       </div>
//                       <span className="text-xs text-gray-500">Read-only</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Form Actions */}
//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             {onCancel && (
//               <button
//                 type="button"
//                 onClick={onCancel}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             )}
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
//             >
//               {loading ? 'Updating...' : 'Update Job Card'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default JobCardEdit;

import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import CancelOrderModal from './CancelOrderModal';

const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
  const { apiCall } = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [faults, setFaults] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'LAPTOP',
    brandId: '',
    modelId: '',
    faultId: '', // NEW: Selected fault
    faultDescription: '',
    notes: '',
    advancePayment: 0,
    estimatedCost: 0,
    status: 'PENDING',
    usedItems: [] // NEW: Parts used
  });

  const [originalData, setOriginalData] = useState(null);

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR'];
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
  const brands = ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Samsung', 'Canon', 'Epson', 'Brother'];
  const models = ['Model A', 'Model B', 'Model C', 'Model D', 'Model E'];

  // Fetch faults and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faultsData, itemsData] = await Promise.all([
          apiCall('/api/faults'),
          apiCall('/api/inventory')
        ]);
        setFaults(faultsData);
        setInventoryItems(itemsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch job card
  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        setFetchLoading(true);
        const data = await apiCall(`/api/jobcards/${jobCardId}`);
        setFormData({
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          deviceType: data.deviceType || 'LAPTOP',
          brandId: data.brandId || '',
          modelId: data.modelId || '',
          faultId: data.fault?.id || '',
          faultDescription: data.faultDescription || '',
          notes: data.notes || '',
          advancePayment: data.advancePayment || 0,
          estimatedCost: data.estimatedCost || 0,
          status: data.status || 'PENDING',
          usedItems: data.usedItems || []
        });
        setOriginalData(data);
      } catch (err) {
        setError('Failed to load job card');
      } finally {
        setFetchLoading(false);
      }
    };

    if (jobCardId) {
      fetchJobCard();
    }
  }, [jobCardId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addUsedItem = (itemId, quantity) => {
    if (!itemId || !quantity) {
      setError('Please select item and quantity');
      return;
    }

    const item = inventoryItems.find(i => i.id === parseInt(itemId));
    if (!item) {
      setError('Item not found');
      return;
    }

    if (quantity > item.quantity) {
      setError(`Only ${item.quantity} available in stock`);
      return;
    }

    const usedItem = {
      inventoryItemId: parseInt(itemId),
      inventoryItem: item,
      quantityUsed: parseInt(quantity),
      unitPrice: item.sellingPrice
    };

    setFormData(prev => ({
      ...prev,
      usedItems: [...prev.usedItems, usedItem]
    }));
    setError('');
  };

  const removeUsedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      usedItems: prev.usedItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }

    if (!formData.faultDescription.trim()) {
      setError('Fault description is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        advancePayment: parseFloat(formData.advancePayment) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        serials: originalData?.serials || []
      };

      const response = await apiCall(`/api/jobcards/${jobCardId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = `Job Card updated successfully!`;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to update job card');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Job Card</h2>
            {originalData && (
              <p className="text-sm text-gray-500 mt-1">Job Number: {originalData.jobNumber}</p>
            )}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
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
          {/* Customer Information */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
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

          {/* Device Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  name="modelId"
                  value={formData.modelId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancel Job Card
                </label>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>
            {formData.status === 'COMPLETED' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ℹ️ Marking as COMPLETED will record the completion timestamp.
                </p>
              </div>
            )}
          </div>

          {/* Service Details - Fault List */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fault Type
                </label>
                <select
                  name="faultId"
                  value={formData.faultId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Fault Type</option>
                  {faults.map(fault => (
                    <option key={fault.id} value={fault.id}>{fault.faultName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fault Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="faultDescription"
                  value={formData.faultDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Used Items (Parts) */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Used Items / Parts</h3>
            <UsedItemsSection
              items={inventoryItems}
              usedItems={formData.usedItems}
              onAdd={addUsedItem}
              onRemove={removeUsedItem}
            />
          </div>

          {/* Payment Information */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment
                </label>
                <input
                  type="number"
                  name="advancePayment"
                  value={formData.advancePayment}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Serial Numbers Display */}
          {originalData?.serials && originalData.serials.length > 0 && (
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Serial Numbers</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {originalData.serials.map((serial, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <div>
                      <span className="font-medium text-gray-900">{serial.serialType}:</span>
                      <span className="ml-2 text-gray-700">{serial.serialValue}</span>
                    </div>
                    <span className="text-xs text-gray-500">Read-only</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {loading ? 'Updating...' : 'Update Job Card'}
            </button>
          </div>
        </form>
      </div>

      {showCancelModal && (
        <CancelOrderModal
          jobCardId={jobCardId}
          onSuccess={() => {
            setShowCancelModal(false);
            if (onSuccess) onSuccess();
          }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

// Helper Component: UsedItemsSection
const UsedItemsSection = ({ items, usedItems, onAdd, onRemove }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    onAdd(selectedItem, quantity);
    setSelectedItem('');
    setQuantity('');
  };

  const selectedItemData = items.find(i => i.id === parseInt(selectedItem));

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      {/* Add new item */}
      <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Used Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max={selectedItemData?.quantity || 1}
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>

        {selectedItemData && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            Price: Rs.{selectedItemData.sellingPrice.toFixed(2)} | Available: {selectedItemData.quantity}
            {selectedItemData.quantity <= selectedItemData.minThreshold && (
              <span className="ml-2 text-red-600 font-medium">⚠️ Low Stock!</span>
            )}
          </div>
        )}
      </div>

      {/* Used Items List */}
      {usedItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items Used in Repair:</h4>
          <div className="space-y-2">
            {usedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{item.inventoryItem.name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantityUsed} × ${item.unitPrice.toFixed(2)} = ${(item.quantityUsed * item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
              <span className="font-medium text-blue-900">
                Total Parts Cost: Rs.{usedItems.reduce((sum, item) => sum + (item.quantityUsed * item.unitPrice), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardEdit;