// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import CancelOrderModal from './CancelOrderModal';

// const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
//   const { apiCall } = useApi();
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [faults, setFaults] = useState([]);
//   const [services, setServices] = useState([]);
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [models, setModels] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
  
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerPhone: '',
//     customerEmail: '',
//     deviceType: 'LAPTOP',
//     brandId: '',
//     modelId: '',
//     processorId: '',
//     deviceConditionIds: [],
//     faultDescription: '',
//     notes: '',
//     advancePayment: 0,
//     estimatedCost: 0,
//     status: 'PENDING',
//     usedItems: [],
//     selectedFaults: [],
//     selectedServices: [],
//     oneDayService: false,
//   });

//   const [originalData, setOriginalData] = useState(null);

//   const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR'];
//   const statusOptions = [
//     'PENDING', 
//     'IN_PROGRESS', 
//     'WAITING_FOR_PARTS',
//     'WAITING_FOR_APPROVAL',
//     'COMPLETED', 
//     'DELIVERED'
//   ];

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [faultsData, servicesData, itemsData, brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
//           apiCall('/api/faults'),
//           apiCall('/api/service-categories'),
//           apiCall('/api/inventory'),
//           apiCall('/api/brands'),
//           apiCall('/api/models'),
//           apiCall('/api/processors'),
//           apiCall('/api/device-conditions')
//         ]);
//         setFaults(faultsData || []);
//         setServices(servicesData || []);
//         setInventoryItems(itemsData || []);
//         setBrands(brandsData || []);
//         setModels(modelsData || []);
//         setProcessors(processorsData || []);
//         setDeviceConditions(conditionsData || []);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//       }
//     };
//     fetchData();
//   }, []);

//   // Fetch job card
//   useEffect(() => {
//     const fetchJobCard = async () => {
//       try {
//         setFetchLoading(true);
//         const data = await apiCall(`/api/jobcards/${jobCardId}`);
        
//         console.log('Fetched job card data:', data);
        
//         const faultIds = data.faults?.map(f => f.id) || [];
//         const serviceObjs = data.serviceCategories || [];
//         const deviceConditionIds = data.deviceConditions?.map(dc => dc.id) || [];

//         setFormData({
//           customerName: data.customerName || '',
//           customerPhone: data.customerPhone || '',
//           customerEmail: data.customerEmail || '',
//           deviceType: data.deviceType || 'LAPTOP',
//           brandId: data.brand?.id || '',
//           modelId: data.model?.id || '',
//           processorId: data.processor?.id || '',
//           deviceConditionIds: deviceConditionIds,
//           faultDescription: data.faultDescription || '',
//           notes: data.notes || '',
//           advancePayment: data.advancePayment || 0,
//           estimatedCost: data.estimatedCost || 0,
//           status: data.status || 'PENDING',
//           usedItems: data.usedItems?.map(item => ({
//             ...item,
//             usedSerialNumbers: item.usedSerialNumbers || []
//           })) || [],
//           selectedFaults: faultIds,
//           selectedServices: serviceObjs,
//           oneDayService: data.oneDayService || false, 
//         });
//         setOriginalData(data);
//       } catch (err) {
//         setError('Failed to load job card');
//         console.error('Error fetching job card:', err);
//       } finally {
//         setFetchLoading(false);
//       }
//     };

//     if (jobCardId) {
//       fetchJobCard();
//     }
//   }, [jobCardId]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleOneDayServiceToggle = (checked) => {
//     setFormData(prev => ({
//       ...prev,
//       oneDayService: checked
//     }));
//   };

//   // FAULT TAGS MANAGEMENT
//   const addFault = (faultId) => {
//     if (!faultId) {
//       setError('Please select a fault');
//       return;
//     }
    
//     if (formData.selectedFaults.includes(parseInt(faultId))) {
//       setError('This fault is already selected');
//       return;
//     }

//     setFormData(prev => ({
//       ...prev,
//       selectedFaults: [...prev.selectedFaults, parseInt(faultId)]
//     }));
//     setError('');
//   };

//   const removeFault = (faultId) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedFaults: prev.selectedFaults.filter(id => id !== faultId)
//     }));
//   };

//   // SERVICE TAGS MANAGEMENT
//   const addService = (serviceId) => {
//     if (!serviceId) {
//       setError('Please select a service');
//       return;
//     }

//     const selectedService = services.find(s => s.id === parseInt(serviceId));
    
//     if (formData.selectedServices.some(s => s.id === parseInt(serviceId))) {
//       setError('This service is already selected');
//       return;
//     }

//     setFormData(prev => ({
//       ...prev,
//       selectedServices: [...prev.selectedServices, selectedService]
//     }));
//     setError('');
//   };

//   const removeService = (serviceId) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
//     }));
//   };

//   // DEVICE CONDITION MANAGEMENT
//   const addDeviceCondition = (conditionId) => {
//     if (!conditionId) {
//       setError('Please select a device condition');
//       return;
//     }
    
//     if (formData.deviceConditionIds.includes(parseInt(conditionId))) {
//       setError('This device condition is already selected');
//       return;
//     }

//     setFormData(prev => ({
//       ...prev,
//       deviceConditionIds: [...prev.deviceConditionIds, parseInt(conditionId)]
//     }));
//     setError('');
//   };

//   const removeDeviceCondition = (conditionId) => {
//     setFormData(prev => ({
//       ...prev,
//       deviceConditionIds: prev.deviceConditionIds.filter(id => id !== conditionId)
//     }));
//   };

//   const calculateTotalServicePrice = () => {
//     return formData.selectedServices.reduce((sum, service) => sum + (service.servicePrice || 0), 0);
//   };

//   // USED ITEMS MANAGEMENT
//   const addUsedItem = (itemId, quantity, serialNumbers = []) => {
//     if (!itemId || !quantity) {
//       setError('Please select item and quantity');
//       return;
//     }

//     const item = inventoryItems.find(i => i.id === parseInt(itemId));
//     if (!item) {
//       setError('Item not found');
//       return;
//     }

//     if (item.hasSerialization) {
//       if (serialNumbers.length === 0) {
//         setError('Please select serial numbers for this item');
//         return;
//       }
//       if (serialNumbers.length !== parseInt(quantity)) {
//         setError(`Number of selected serials (${serialNumbers.length}) must match quantity (${quantity})`);
//         return;
//       }
//     } else {
//       if (parseInt(quantity) > item.quantity) {
//         setError(`Only ${item.quantity} available in stock`);
//         return;
//       }
//     }

//     const usedItem = {
//       inventoryItemId: parseInt(itemId),
//       inventoryItem: item,
//       quantityUsed: parseInt(quantity),
//       unitPrice: item.sellingPrice,
//       usedSerialNumbers: serialNumbers
//     };

//     setFormData(prev => ({
//       ...prev,
//       usedItems: [...prev.usedItems, usedItem]
//     }));
//     setError('');
//   };

//   const removeUsedItem = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       usedItems: prev.usedItems.filter((_, i) => i !== index)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

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

//     try {
//       const usedItems = formData.usedItems.map(item => ({
//         id: item.id || null,
//         inventoryItemId: item.inventoryItem.id,
//         quantityUsed: item.quantityUsed,
//         unitPrice: item.unitPrice,
//         usedSerialNumbers: item.usedSerialNumbers || []
//       }));

//       const payload = {
//         customerName: formData.customerName,
//         customerPhone: formData.customerPhone,
//         customerEmail: formData.customerEmail,
//         deviceType: formData.deviceType,
//         brandId: formData.brandId ? parseInt(formData.brandId) : null,
//         modelId: formData.modelId ? parseInt(formData.modelId) : null,
//         processorId: formData.processorId ? parseInt(formData.processorId) : null,
//         deviceConditionIds: formData.deviceConditionIds,
//         faultIds: formData.selectedFaults,
//         serviceCategoryIds: formData.selectedServices.map(s => s.id),
//         faultDescription: formData.faultDescription,
//         notes: formData.notes,
//         advancePayment: parseFloat(formData.advancePayment) || 0,
//         estimatedCost: parseFloat(formData.estimatedCost) || 0,
//         status: formData.status,
//         usedItems: usedItems,
//         oneDayService: formData.oneDayService
//       };

//       console.log('Sending payload:', payload);

//       const response = await apiCall(`/api/jobcards/${jobCardId}`, {
//         method: 'PUT',
//         body: JSON.stringify(payload)
//       });

//       const successMsg = document.createElement('div');
//       successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//       successMsg.textContent = `Job Card updated successfully! ${formData.oneDayService ? '🚨 One Day Service Enabled' : ''}`;
//       document.body.appendChild(successMsg);
//       setTimeout(() => successMsg.remove(), 3000);

//       if (onSuccess) onSuccess(response);
//     } catch (err) {
//       setError(err.message || 'Failed to update job card');
//       console.error('Update error:', err);
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

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email (Optional)
//                 </label>
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

//           {/* Device Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
//                 <select
//                   name="brandId"
//                   value={formData.brandId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Brand</option>
//                   {brands.map(brand => (
//                     <option key={brand.id} value={brand.id}>{brand.brandName}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
//                 <select
//                   name="modelId"
//                   value={formData.modelId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Model</option>
//                   {models.map(model => (
//                     <option key={model.id} value={model.id}>{model.modelName}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
//                 <select
//                   name="processorId"
//                   value={formData.processorId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Processor</option>
//                   {processors.map(processor => (
//                     <option key={processor.id} value={processor.id}>{processor.processorName}</option>
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
//                     <option key={status} value={status}>
//                       {status === 'WAITING_FOR_PARTS' ? '⏳ Waiting for Parts' :
//                        status === 'WAITING_FOR_APPROVAL' ? '👥 Waiting for Approval' :
//                        status.replace('_', ' ')}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Cancel Job Card
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setShowCancelModal(true)}
//                   className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
//                 >
//                   Cancel Order
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* One Day Service Toggle */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Priority</h3>
//             <div className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <div className="flex-shrink-0">
//                   <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-lg font-semibold text-gray-900">One Day Service</h4>
//                   <p className="text-sm text-gray-600">Enable for urgent priority service (24-hour turnaround)</p>
//                 </div>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={formData.oneDayService}
//                   onChange={(e) => handleOneDayServiceToggle(e.target.checked)}
//                   className="sr-only peer"
//                 />
//                 <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-600"></div>
//               </label>
//             </div>
//           </div>

//           {/* Device Condition */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Condition (Multiple)</h3>
//             <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Device Condition</label>
//                 <select
//                   onChange={(e) => addDeviceCondition(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 >
//                   <option value="">-- Select a device condition --</option>
//                   {deviceConditions.map(condition => (
//                     <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
//                   ))}
//                 </select>
//               </div>

//               {formData.deviceConditionIds.length > 0 && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Device Conditions:</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.deviceConditionIds.map(conditionId => {
//                       const condition = deviceConditions.find(c => c.id === conditionId);
//                       return (
//                         <div key={conditionId} className="flex items-center gap-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
//                           <span className="font-medium">{condition?.conditionName}</span>
//                           <button
//                             type="button"
//                             onClick={() => removeDeviceCondition(conditionId)}
//                             className="text-yellow-600 hover:text-yellow-900 font-bold"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Faults Section */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Faults (Optional)</h3>
//             <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Fault Type</label>
//                 <select
//                   onChange={(e) => addFault(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                 >
//                   <option value="">-- Select a fault (Optional) --</option>
//                   {faults.map(fault => (
//                     <option key={fault.id} value={fault.id}>
//                       {fault.faultName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {formData.selectedFaults.length > 0 && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Faults:</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.selectedFaults.map(faultId => {
//                       const fault = faults.find(f => f.id === faultId);
//                       return (
//                         <div key={faultId} className="flex items-center gap-2 bg-red-200 text-red-800 px-3 py-1 rounded-full">
//                           <span className="font-medium">{fault?.faultName}</span>
//                           <button
//                             type="button"
//                             onClick={() => removeFault(faultId)}
//                             className="text-red-600 hover:text-red-900 font-bold"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Services Section */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Services (Optional)</h3>
//             <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
//                 <select
//                   onChange={(e) => addService(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 >
//                   <option value="">-- Select a service (Optional) --</option>
//                   {services.map(service => (
//                     <option key={service.id} value={service.id}>
//                       {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {formData.selectedServices.length > 0 && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services:</h4>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {formData.selectedServices.map(service => (
//                       <div key={service.id} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded-full">
//                         <span className="font-medium">
//                           {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() => removeService(service.id)}
//                           className="text-green-600 hover:text-green-900 font-bold"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
//                     <div className="flex justify-between items-center">
//                       <span className="font-semibold text-gray-900">Total Service Price:</span>
//                       <span className="text-2xl font-bold text-green-700">
//                         Rs.{calculateTotalServicePrice().toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Service Details */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Fault Description (Optional)
//                 </label>
//                 <textarea
//                   name="faultDescription"
//                   value={formData.faultDescription}
//                   onChange={handleChange}
//                   rows="3"
//                   placeholder="Detailed description of the fault (optional)..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

//           {/* Used Items */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Used Items / Parts</h3>
//             <UsedItemsSection
//               items={inventoryItems}
//               usedItems={formData.usedItems}
//               onAdd={addUsedItem}
//               onRemove={removeUsedItem}
//             />
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

//       {/* Cancel Modal */}
//       {showCancelModal && originalData && (
//         <CancelOrderModal
//           jobCard={originalData}
//           onSuccess={() => {
//             setShowCancelModal(false);
//             if (onSuccess) onSuccess();
//           }}
//           onClose={() => setShowCancelModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// // COMPLETE UsedItemsSection Component
// const UsedItemsSection = ({ items, usedItems, onAdd, onRemove }) => {
//   const { apiCall } = useApi();
//   const [selectedItem, setSelectedItem] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [availableSerials, setAvailableSerials] = useState([]);
//   const [selectedSerials, setSelectedSerials] = useState([]);
//   const [loadingSerials, setLoadingSerials] = useState(false);
//   const [serialSearch, setSerialSearch] = useState('');
//   const [barcodeInput, setBarcodeInput] = useState('');

//   const selectedItemData = items.find(i => i.id === parseInt(selectedItem));

//   // Filter available serials based on search
//   const filteredSerials = availableSerials.filter(serial => 
//     serial.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
//   );

//   // Fetch available serials when item with serialization is selected
//   useEffect(() => {
//     const fetchAvailableSerials = async () => {
//       if (selectedItemData?.hasSerialization) {
//         setLoadingSerials(true);
//         try {
//           const serials = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);
//           setAvailableSerials(serials || []);
//         } catch (err) {
//           console.error('Error fetching serials:', err);
//           setAvailableSerials([]);
//         } finally {
//           setLoadingSerials(false);
//         }
//       } else {
//         setAvailableSerials([]);
//       }
//       setSelectedSerials([]);
//       setSerialSearch('');
//       setBarcodeInput('');
//     };

//     fetchAvailableSerials();
//   }, [selectedItemData]);

//   // Handle barcode scanner input
//   useEffect(() => {
//     if (barcodeInput && selectedItemData?.hasSerialization) {
//       handleBarcodeScan(barcodeInput);
//     }
//   }, [barcodeInput]);

//   const handleBarcodeScan = (barcode) => {
//     if (!selectedItemData?.hasSerialization) return;

//     const serial = availableSerials.find(s => 
//       s.serialNumber === barcode.trim()
//     );

//     if (serial) {
//       if (!selectedSerials.includes(serial.serialNumber)) {
//         if (selectedSerials.length < parseInt(quantity) || !quantity) {
//           setSelectedSerials(prev => [...prev, serial.serialNumber]);
//         }
//       }
//     }
//     setTimeout(() => setBarcodeInput(''), 100);
//   };

//   const handleSerialSelection = (serialNumber, isSelected) => {
//     if (isSelected) {
//       setSelectedSerials(prev => [...prev, serialNumber]);
//     } else {
//       setSelectedSerials(prev => prev.filter(s => s !== serialNumber));
//     }
//   };

//   const handleAdd = () => {
//     if (!selectedItem || !quantity) {
//       alert('Please select item and quantity');
//       return;
//     }

//     if (selectedItemData?.hasSerialization) {
//       if (selectedSerials.length === 0) {
//         alert('Please select at least one serial number for this item');
//         return;
//       }
//       if (selectedSerials.length !== parseInt(quantity)) {
//         alert(`Number of selected serials (${selectedSerials.length}) must match quantity (${quantity})`);
//         return;
//       }
//     }

//     onAdd(selectedItem, quantity, selectedSerials);
//     setSelectedItem('');
//     setQuantity('');
//     setSelectedSerials([]);
//     setAvailableSerials([]);
//     setSerialSearch('');
//     setBarcodeInput('');
//   };

//   const toggleSelectAll = () => {
//     if (selectedSerials.length === filteredSerials.length) {
//       setSelectedSerials([]);
//     } else {
//       const maxSelectable = parseInt(quantity) || filteredSerials.length;
//       const serialsToSelect = filteredSerials.slice(0, maxSelectable).map(s => s.serialNumber);
//       setSelectedSerials(serialsToSelect);
//     }
//   };

//   return (
//     <div className="bg-gray-50 p-4 rounded-lg space-y-4">
//       {/* Add new item */}
//       <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
//         <h4 className="text-sm font-medium text-gray-700 mb-3">Add Used Item</h4>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
//             <select
//               value={selectedItem}
//               onChange={(e) => setSelectedItem(e.target.value)}
//               className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Item</option>
//               {items.map(item => (
//                 <option key={item.id} value={item.id}>
//                   {item.name} {item.hasSerialization && '🔢'} (Qty: {item.quantity})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               min="1"
//               max={selectedItemData?.hasSerialization ? availableSerials.length : selectedItemData?.quantity || 1}
//               className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="0"
//             />
//           </div>

//           <div className="flex items-end">
//             <button
//               type="button"
//               onClick={handleAdd}
//               className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
//             >
//               Add Item
//             </button>
//           </div>
//         </div>

//         {selectedItemData && (
//           <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
//             <div className="flex justify-between">
//               <span>Price: Rs.{selectedItemData.sellingPrice?.toFixed(2) || '0.00'}</span>
//               <span>Available: {selectedItemData.quantity}</span>
//             </div>
//             {selectedItemData.hasSerialization && (
//               <div className="mt-1">
//                 <span className="font-medium">🔢 Serial Tracking Enabled</span>
//                 {availableSerials.length > 0 && (
//                   <span> - {availableSerials.length} serial(s) available</span>
//                 )}
//               </div>
//             )}
//             {selectedItemData.quantity <= selectedItemData.minThreshold && (
//               <span className="text-red-600 font-medium">⚠️ Low Stock!</span>
//             )}
//           </div>
//         )}

//         {/* Serial Number Selection */}
//         {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
//           <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//               <div>
//                 <label className="block text-xs font-medium text-yellow-700 mb-1">
//                   Search Serial Numbers
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={serialSearch}
//                     onChange={(e) => setSerialSearch(e.target.value)}
//                     placeholder="Search serial numbers..."
//                     className="w-full px-3 py-2 pr-8 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                   />
//                   {serialSearch && (
//                     <button
//                       onClick={() => setSerialSearch('')}
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-700"
//                     >
//                       ✕
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-yellow-700 mb-1">
//                   Barcode Scanner
//                 </label>
//                 <input
//                   type="text"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onBlur={(e) => setBarcodeInput('')}
//                   placeholder="Scan barcode or type serial..."
//                   className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
//                   autoComplete="off"
//                 />
//                 <div className="text-xs text-yellow-600 mt-1">
//                   💡 Scan barcode or type serial number
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-between mb-2">
//               <label className="block text-xs font-medium text-yellow-700">
//                 Available Serial Numbers ({selectedSerials.length} selected of {quantity || 0} required)
//               </label>
//               {filteredSerials.length > 0 && (
//                 <button
//                   type="button"
//                   onClick={toggleSelectAll}
//                   className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
//                 >
//                   {selectedSerials.length === filteredSerials.length ? 'Deselect All' : 'Select All'}
//                 </button>
//               )}
//             </div>

//             <div className="max-h-40 overflow-y-auto space-y-2 border border-yellow-200 rounded bg-white p-2">
//               {loadingSerials ? (
//                 <div className="text-center py-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mx-auto"></div>
//                   <span className="text-xs text-yellow-600">Loading serials...</span>
//                 </div>
//               ) : filteredSerials.length > 0 ? (
//                 filteredSerials.map(serial => (
//                   <label 
//                     key={serial.id} 
//                     className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
//                       selectedSerials.includes(serial.serialNumber) 
//                         ? 'bg-yellow-100 border border-yellow-300' 
//                         : 'hover:bg-yellow-50'
//                     }`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedSerials.includes(serial.serialNumber)}
//                       onChange={(e) => handleSerialSelection(serial.serialNumber, e.target.checked)}
//                       className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
//                       disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(serial.serialNumber)}
//                     />
//                     <span className="text-sm font-mono flex-1">{serial.serialNumber}</span>
//                     <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
//                       {serial.status}
//                     </span>
//                   </label>
//                 ))
//               ) : (
//                 <div className="text-center py-4 text-gray-500 text-sm">
//                   {serialSearch ? 'No serial numbers match your search' : 'No serial numbers available'}
//                 </div>
//               )}
//             </div>

//             {selectedSerials.length > 0 && (
//               <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-green-700 font-medium">
//                     Selected: {selectedSerials.length} serial(s)
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => setSelectedSerials([])}
//                     className="text-xs text-red-600 hover:text-red-800"
//                   >
//                     Clear All
//                   </button>
//                 </div>
//                 <div className="mt-1 flex flex-wrap gap-1">
//                   {selectedSerials.map((serial, index) => (
//                     <span 
//                       key={index} 
//                       className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono"
//                     >
//                       {serial}
//                       <button
//                         type="button"
//                         onClick={() => handleSerialSelection(serial, false)}
//                         className="ml-1 text-red-500 hover:text-red-700"
//                       >
//                         ✕
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {selectedItemData?.hasSerialization && quantity && (
//               <div className="mt-2 text-xs text-yellow-600">
//                 💡 Select exactly {quantity} serial number(s). Use search or barcode scanner for quick selection.
//               </div>
//             )}
//           </div>
//         )}

//         {selectedItemData?.hasSerialization && availableSerials.length === 0 && !loadingSerials && (
//           <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
//             ⚠️ No available serial numbers for this item
//           </div>
//         )}
//       </div>

//       {/* Used Items List */}
//       {usedItems.length > 0 && (
//         <div>
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Items Used in Repair:</h4>
//           <div className="space-y-2">
//             {usedItems.map((item, index) => (
//               <div key={index} className="bg-white p-3 rounded border border-gray-200">
//                 <div className="flex items-center justify-between mb-2">
//                   <div>
//                     <p className="font-medium text-gray-900">
//                       {item.inventoryItem.name} 
//                       {item.inventoryItem.hasSerialization && ' 🔢'}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Qty: {item.quantityUsed} × Rs.{item.unitPrice?.toFixed(2) || '0.00'} = 
//                       Rs.{((item.quantityUsed || 0) * (item.unitPrice || 0)).toFixed(2)}
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => onRemove(index)}
//                     className="text-red-600 hover:text-red-800 flex-shrink-0"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                   </button>
//                 </div>
                
//                 {item.usedSerialNumbers && item.usedSerialNumbers.length > 0 && (
//                   <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
//                     <p className="text-xs text-blue-700 font-medium mb-1">Serial Numbers Used:</p>
//                     <div className="flex flex-wrap gap-1">
//                       {item.usedSerialNumbers.map((serial, serialIndex) => (
//                         <span key={serialIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
//                           {serial}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//             <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
//               <span className="font-medium text-blue-900">
//                 Total Parts Cost: Rs.{usedItems.reduce((sum, item) => sum + ((item.quantityUsed || 0) * (item.unitPrice || 0)), 0).toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobCardEdit;




import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import CancelOrderModal from './CancelOrderModal';

const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [faults, setFaults] = useState([]);
  const [services, setServices] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'LAPTOP',
    brandId: '',
    modelId: '',
    processorId: '',
    deviceConditionIds: [],
    faultDescription: '',
    notes: '',
    advancePayment: 0,
    estimatedCost: 0,
    status: 'PENDING',
    usedItems: [],
    selectedFaults: [],
    selectedServices: [],
    oneDayService: false,
  });

  const [originalData, setOriginalData] = useState(null);

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR'];
  const statusOptions = [
    'PENDING', 
    'IN_PROGRESS', 
    'WAITING_FOR_PARTS',
    'WAITING_FOR_APPROVAL',
    'COMPLETED', 
    'DELIVERED'
  ];

  // Prevent form submission on Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faultsData, servicesData, itemsData, brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
          apiCall('/api/faults'),
          apiCall('/api/service-categories'),
          apiCall('/api/inventory'),
          apiCall('/api/brands'),
          apiCall('/api/models'),
          apiCall('/api/processors'),
          apiCall('/api/device-conditions')
        ]);
        setFaults(faultsData || []);
        setServices(servicesData || []);
        setInventoryItems(itemsData || []);
        setBrands(brandsData || []);
        setModels(modelsData || []);
        setProcessors(processorsData || []);
        setDeviceConditions(conditionsData || []);
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
        
        console.log('Fetched job card data:', data);
        
        const faultIds = data.faults?.map(f => f.id) || [];
        const serviceObjs = data.serviceCategories || [];
        const deviceConditionIds = data.deviceConditions?.map(dc => dc.id) || [];

        setFormData({
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          deviceType: data.deviceType || 'LAPTOP',
          brandId: data.brand?.id || '',
          modelId: data.model?.id || '',
          processorId: data.processor?.id || '',
          deviceConditionIds: deviceConditionIds,
          faultDescription: data.faultDescription || '',
          notes: data.notes || '',
          advancePayment: data.advancePayment || 0,
          estimatedCost: data.estimatedCost || 0,
          status: data.status || 'PENDING',
          usedItems: data.usedItems?.map(item => ({
            ...item,
            usedSerialNumbers: item.usedSerialNumbers || []
          })) || [],
          selectedFaults: faultIds,
          selectedServices: serviceObjs,
          oneDayService: data.oneDayService || false, 
        });
        setOriginalData(data);
      } catch (err) {
        setError('Failed to load job card');
        console.error('Error fetching job card:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (jobCardId) {
      fetchJobCard();
    }
  }, [jobCardId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOneDayServiceToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      oneDayService: checked
    }));
  };

  // FAULT TAGS MANAGEMENT
  const addFault = (faultId) => {
    if (!faultId) {
      setError('Please select a fault');
      return;
    }
    
    if (formData.selectedFaults.includes(parseInt(faultId))) {
      setError('This fault is already selected');
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedFaults: [...prev.selectedFaults, parseInt(faultId)]
    }));
    setError('');
  };

  const removeFault = (faultId) => {
    setFormData(prev => ({
      ...prev,
      selectedFaults: prev.selectedFaults.filter(id => id !== faultId)
    }));
  };

  // SERVICE TAGS MANAGEMENT
  const addService = (serviceId) => {
    if (!serviceId) {
      setError('Please select a service');
      return;
    }

    const selectedService = services.find(s => s.id === parseInt(serviceId));
    
    if (formData.selectedServices.some(s => s.id === parseInt(serviceId))) {
      setError('This service is already selected');
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, selectedService]
    }));
    setError('');
  };

  const removeService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
    }));
  };

  // DEVICE CONDITION MANAGEMENT
  const addDeviceCondition = (conditionId) => {
    if (!conditionId) {
      setError('Please select a device condition');
      return;
    }
    
    if (formData.deviceConditionIds.includes(parseInt(conditionId))) {
      setError('This device condition is already selected');
      return;
    }

    setFormData(prev => ({
      ...prev,
      deviceConditionIds: [...prev.deviceConditionIds, parseInt(conditionId)]
    }));
    setError('');
  };

  const removeDeviceCondition = (conditionId) => {
    setFormData(prev => ({
      ...prev,
      deviceConditionIds: prev.deviceConditionIds.filter(id => id !== conditionId)
    }));
  };

  const calculateTotalServicePrice = () => {
    return formData.selectedServices.reduce((sum, service) => sum + (service.servicePrice || 0), 0);
  };

  // USED ITEMS MANAGEMENT - Fix auto-submission
  const addUsedItem = (itemId, quantity, serialNumbers = []) => {
    if (!itemId || !quantity) {
      setError('Please select item and quantity');
      return;
    }

    const item = inventoryItems.find(i => i.id === parseInt(itemId));
    if (!item) {
      setError('Item not found');
      return;
    }

    if (item.hasSerialization) {
      if (serialNumbers.length === 0) {
        setError('Please select serial numbers for this item');
        return;
      }
      if (serialNumbers.length !== parseInt(quantity)) {
        setError(`Number of selected serials (${serialNumbers.length}) must match quantity (${quantity})`);
        return;
      }
    } else {
      if (parseInt(quantity) > item.quantity) {
        setError(`Only ${item.quantity} available in stock`);
        return;
      }
    }

    const usedItem = {
      inventoryItemId: parseInt(itemId),
      inventoryItem: item,
      quantityUsed: parseInt(quantity),
      unitPrice: item.sellingPrice,
      usedSerialNumbers: serialNumbers
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

    if (!formData.customerPhone.trim()) {
      setError('Customer phone is required');
      setLoading(false);
      return;
    }

    try {
      const usedItems = formData.usedItems.map(item => ({
        id: item.id || null,
        inventoryItemId: item.inventoryItem.id,
        quantityUsed: item.quantityUsed,
        unitPrice: item.unitPrice,
        usedSerialNumbers: item.usedSerialNumbers || []
      }));

      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deviceType: formData.deviceType,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        modelId: formData.modelId ? parseInt(formData.modelId) : null,
        processorId: formData.processorId ? parseInt(formData.processorId) : null,
        deviceConditionIds: formData.deviceConditionIds,
        faultIds: formData.selectedFaults,
        serviceCategoryIds: formData.selectedServices.map(s => s.id),
        faultDescription: formData.faultDescription,
        notes: formData.notes,
        advancePayment: parseFloat(formData.advancePayment) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        status: formData.status,
        usedItems: usedItems,
        oneDayService: formData.oneDayService
      };

      console.log('Sending payload:', payload);

      const response = await apiCall(`/api/jobcards/${jobCardId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = `Job Card updated successfully! ${formData.oneDayService ? '🚨 One Day Service Enabled' : ''}`;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to update job card');
      console.error('Update error:', err);
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

        <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
            e.preventDefault();
          }
        }}>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.brandName}</option>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>{model.modelName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
                <select
                  name="processorId"
                  value={formData.processorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">Select Processor</option>
                  {processors.map(processor => (
                    <option key={processor.id} value={processor.id}>{processor.processorName}</option>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'WAITING_FOR_PARTS' ? '⏳ Waiting for Parts' :
                       status === 'WAITING_FOR_APPROVAL' ? '👥 Waiting for Approval' :
                       status.replace('_', ' ')}
                    </option>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>

          {/* One Day Service Toggle */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Priority</h3>
            <div className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">One Day Service</h4>
                  <p className="text-sm text-gray-600">Enable for urgent priority service (24-hour turnaround)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.oneDayService}
                  onChange={(e) => handleOneDayServiceToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>

          {/* Device Condition */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Condition (Multiple)</h3>
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Device Condition</label>
                <select
                  onChange={(e) => addDeviceCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">-- Select a device condition --</option>
                  {deviceConditions.map(condition => (
                    <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
                  ))}
                </select>
              </div>

              {formData.deviceConditionIds.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Device Conditions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.deviceConditionIds.map(conditionId => {
                      const condition = deviceConditions.find(c => c.id === conditionId);
                      return (
                        <div key={conditionId} className="flex items-center gap-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
                          <span className="font-medium">{condition?.conditionName}</span>
                          <button
                            type="button"
                            onClick={() => removeDeviceCondition(conditionId)}
                            className="text-yellow-600 hover:text-yellow-900 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Faults Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Faults (Optional)</h3>
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Fault Type</label>
                <select
                  onChange={(e) => addFault(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">-- Select a fault (Optional) --</option>
                  {faults.map(fault => (
                    <option key={fault.id} value={fault.id}>
                      {fault.faultName}
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedFaults.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Faults:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedFaults.map(faultId => {
                      const fault = faults.find(f => f.id === faultId);
                      return (
                        <div key={faultId} className="flex items-center gap-2 bg-red-200 text-red-800 px-3 py-1 rounded-full">
                          <span className="font-medium">{fault?.faultName}</span>
                          <button
                            type="button"
                            onClick={() => removeFault(faultId)}
                            className="text-red-600 hover:text-red-900 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Services (Optional)</h3>
            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
                <select
                  onChange={(e) => addService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  <option value="">-- Select a service (Optional) --</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedServices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.selectedServices.map(service => (
                      <div key={service.id} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded-full">
                        <span className="font-medium">
                          {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="text-green-600 hover:text-green-900 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Service Price:</span>
                      <span className="text-2xl font-bold text-green-700">
                        Rs.{calculateTotalServicePrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fault Description (Optional)
                </label>
                <textarea
                  name="faultDescription"
                  value={formData.faultDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Detailed description of the fault (optional)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Used Items */}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
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

      {/* Cancel Modal */}
      {showCancelModal && originalData && (
        <CancelOrderModal
          jobCard={originalData}
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

// COMPLETE UsedItemsSection Component with fixed auto-submission
const UsedItemsSection = ({ items, usedItems, onAdd, onRemove }) => {
  const { apiCall } = useApi();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [serialSearch, setSerialSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanning, setScanning] = useState(false);

  const selectedItemData = items.find(i => i.id === parseInt(selectedItem));

  // Prevent Enter key submission
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit') {
        e.preventDefault();
        e.stopPropagation();
        
        // Handle barcode input
        if (e.target.name === 'barcodeInput' && barcodeInput.trim()) {
          handleBarcodeScan(barcodeInput.trim());
        }
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [barcodeInput]);

  // Filter available serials based on search
  const filteredSerials = availableSerials.filter(serial => 
    serial.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
  );

  // Fetch available serials when item with serialization is selected
  useEffect(() => {
    const fetchAvailableSerials = async () => {
      if (selectedItemData?.hasSerialization) {
        setLoadingSerials(true);
        try {
          const serials = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);
          setAvailableSerials(serials || []);
        } catch (err) {
          console.error('Error fetching serials:', err);
          setAvailableSerials([]);
        } finally {
          setLoadingSerials(false);
        }
      } else {
        setAvailableSerials([]);
      }
      setSelectedSerials([]);
      setSerialSearch('');
      setBarcodeInput('');
    };

    fetchAvailableSerials();
  }, [selectedItemData]);

  const handleBarcodeScan = (barcode) => {
    if (!selectedItemData?.hasSerialization) return;

    setScanning(true);
    
    const serial = availableSerials.find(s => 
      s.serialNumber === barcode.trim()
    );

    if (serial) {
      if (!selectedSerials.includes(serial.serialNumber)) {
        if (selectedSerials.length < parseInt(quantity) || !quantity) {
          setSelectedSerials(prev => [...prev, serial.serialNumber]);
          
          // Show scanning notification
          const msg = document.createElement('div');
          msg.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
          msg.textContent = `📷 Scanned: ${serial.serialNumber}`;
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 2000);
        }
      }
    }
    
    setTimeout(() => {
      setBarcodeInput('');
      setScanning(false);
    }, 100);
  };

  const handleSerialSelection = (serialNumber, isSelected) => {
    if (isSelected) {
      setSelectedSerials(prev => [...prev, serialNumber]);
    } else {
      setSelectedSerials(prev => prev.filter(s => s !== serialNumber));
    }
  };

  const handleAdd = () => {
    if (!selectedItem || !quantity) {
      alert('Please select item and quantity');
      return;
    }

    if (selectedItemData?.hasSerialization) {
      if (selectedSerials.length === 0) {
        alert('Please select at least one serial number for this item');
        return;
      }
      if (selectedSerials.length !== parseInt(quantity)) {
        alert(`Number of selected serials (${selectedSerials.length}) must match quantity (${quantity})`);
        return;
      }
    }

    onAdd(selectedItem, quantity, selectedSerials);
    setSelectedItem('');
    setQuantity('');
    setSelectedSerials([]);
    setAvailableSerials([]);
    setSerialSearch('');
    setBarcodeInput('');
  };

  const toggleSelectAll = () => {
    if (selectedSerials.length === filteredSerials.length) {
      setSelectedSerials([]);
    } else {
      const maxSelectable = parseInt(quantity) || filteredSerials.length;
      const serialsToSelect = filteredSerials.slice(0, maxSelectable).map(s => s.serialNumber);
      setSelectedSerials(serialsToSelect);
    }
  };

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.hasSerialization && '🔢'} (Qty: {item.quantity})
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
              max={selectedItemData?.hasSerialization ? availableSerials.length : selectedItemData?.quantity || 1}
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              Add Item
            </button>
          </div>
        </div>

        {selectedItemData && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <div className="flex justify-between">
              <span>Price: Rs.{selectedItemData.sellingPrice?.toFixed(2) || '0.00'}</span>
              <span>Available: {selectedItemData.quantity}</span>
            </div>
            {selectedItemData.hasSerialization && (
              <div className="mt-1">
                <span className="font-medium">🔢 Serial Tracking Enabled</span>
                {availableSerials.length > 0 && (
                  <span> - {availableSerials.length} serial(s) available</span>
                )}
              </div>
            )}
            {selectedItemData.quantity <= selectedItemData.minThreshold && (
              <span className="text-red-600 font-medium">⚠️ Low Stock!</span>
            )}
          </div>
        )}

        {/* Serial Number Selection */}
        {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Search Serial Numbers
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    placeholder="Search serial numbers..."
                    className="w-full px-3 py-2 pr-8 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                  {serialSearch && (
                    <button
                      onClick={() => setSerialSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">
                  Barcode Scanner
                </label>
                <input
                  type="text"
                  name="barcodeInput"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or type serial..."
                  className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (barcodeInput.trim()) {
                        handleBarcodeScan(barcodeInput.trim());
                      }
                    }
                  }}
                />
                <div className="text-xs text-yellow-600 mt-1">
                  💡 Scan barcode or type serial number
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-yellow-700">
                Available Serial Numbers ({selectedSerials.length} selected of {quantity || 0} required)
              </label>
              {filteredSerials.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                >
                  {selectedSerials.length === filteredSerials.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2 border border-yellow-200 rounded bg-white p-2">
              {loadingSerials ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mx-auto"></div>
                  <span className="text-xs text-yellow-600">Loading serials...</span>
                </div>
              ) : filteredSerials.length > 0 ? (
                filteredSerials.map(serial => (
                  <label 
                    key={serial.id} 
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedSerials.includes(serial.serialNumber) 
                        ? 'bg-yellow-100 border border-yellow-300' 
                        : 'hover:bg-yellow-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSerials.includes(serial.serialNumber)}
                      onChange={(e) => handleSerialSelection(serial.serialNumber, e.target.checked)}
                      className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                      disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(serial.serialNumber)}
                    />
                    <span className="text-sm font-mono flex-1">{serial.serialNumber}</span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {serial.status}
                    </span>
                  </label>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {serialSearch ? 'No serial numbers match your search' : 'No serial numbers available'}
                </div>
              )}
            </div>

            {selectedSerials.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-700 font-medium">
                    Selected: {selectedSerials.length} serial(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSerials([])}
                    className="text-xs text-red-600 hover:text-red-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedSerials.map((serial, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono"
                    >
                      {serial}
                      <button
                        type="button"
                        onClick={() => handleSerialSelection(serial, false)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedItemData?.hasSerialization && quantity && (
              <div className="mt-2 text-xs text-yellow-600">
                💡 Select exactly {quantity} serial number(s). Use search or barcode scanner for quick selection.
              </div>
            )}
          </div>
        )}

        {selectedItemData?.hasSerialization && availableSerials.length === 0 && !loadingSerials && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            ⚠️ No available serial numbers for this item
          </div>
        )}
      </div>

      {/* Used Items List */}
      {usedItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items Used in Repair:</h4>
          <div className="space-y-2">
            {usedItems.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.inventoryItem.name} 
                      {item.inventoryItem.hasSerialization && ' 🔢'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantityUsed} × Rs.{item.unitPrice?.toFixed(2) || '0.00'} = 
                      Rs.{((item.quantityUsed || 0) * (item.unitPrice || 0)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {item.usedSerialNumbers && item.usedSerialNumbers.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Serial Numbers Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.usedSerialNumbers.map((serial, serialIndex) => (
                        <span key={serialIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                          {serial}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
              <span className="font-medium text-blue-900">
                Total Parts Cost: Rs.{usedItems.reduce((sum, item) => sum + ((item.quantityUsed || 0) * (item.unitPrice || 0)), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Scanning Indicator */}
      {scanning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          📷 Scanning Serial...
        </div>
      )}
    </div>
  );
};

export default JobCardEdit;