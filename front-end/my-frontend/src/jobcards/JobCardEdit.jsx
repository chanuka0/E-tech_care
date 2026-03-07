// import { useState, useEffect } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';
// import CancelOrderModal from './CancelOrderModal';
// import { useApi } from '../services/apiService';

// const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [faults, setFaults] = useState([]);
//   const [services, setServices] = useState([]);
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [allModels, setAllModels] = useState([]);
//   const [filteredModels, setFilteredModels] = useState([]);
//   const [allModelNumbers, setAllModelNumbers] = useState([]);
//   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
  
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerPhone: '',
//     customerEmail: '',
//     deviceType: 'LAPTOP',
//     brandId: '',
//     modelId: '',
//     modelNumberId: '',
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
//     withCharger: false,
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

//   // Prevent form submission on Enter key
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
//         e.preventDefault();
//         e.stopPropagation();
//         return false;
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown, true);
    
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown, true);
//     };
//   }, []);

//   // Fetch all data with filtering for active items only
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [faultsData, servicesData, itemsData, brandsData, modelsData, modelNumbersData, processorsData, conditionsData] = await Promise.all([
//           apiCall('/api/faults'),
//           apiCall('/api/service-categories'),
//           apiCall('/api/inventory'),
//           apiCall('/api/brands'),
//           apiCall('/api/models'),
//           apiCall('/api/model-numbers'),
//           apiCall('/api/processors'),
//           apiCall('/api/device-conditions')
//         ]);
        
//         // Filter only active items for dropdowns
//         setFaults((faultsData || []).filter(item => item.isActive));
//         setServices((servicesData || []).filter(item => item.isActive));
//         setInventoryItems(itemsData || []);
//         setBrands((brandsData || []).filter(item => item.isActive));
//         setAllModels((modelsData || []).filter(item => item.isActive));
//         setAllModelNumbers((modelNumbersData || []).filter(item => item.isActive));
//         setProcessors((processorsData || []).filter(item => item.isActive));
//         setDeviceConditions((conditionsData || []).filter(item => item.isActive));
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
//           modelNumberId: data.modelNumber?.id || '',
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
//           withCharger: data.withCharger || false, 
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

//   // Effect 1: Filter models when brand changes (only active models)
//   useEffect(() => {
//     if (formData.brandId) {
//       const filtered = allModels.filter(model => 
//         model.brand?.id === parseInt(formData.brandId) && model.isActive
//       );
//       setFilteredModels(filtered);
      
//       // Clear model and model number if brand changes
//       if (originalData?.brand?.id !== parseInt(formData.brandId)) {
//         setFormData(prev => ({
//           ...prev,
//           modelId: '',
//           modelNumberId: ''
//         }));
//         setFilteredModelNumbers([]);
//       }
//     } else {
//       setFilteredModels([]);
//       setFormData(prev => ({
//         ...prev,
//         modelId: '',
//         modelNumberId: ''
//       }));
//       setFilteredModelNumbers([]);
//     }
//   }, [formData.brandId, allModels, originalData]);

//   // Effect 2: Filter model numbers when model changes (only active model numbers)
//   useEffect(() => {
//     if (formData.modelId) {
//       const filtered = allModelNumbers.filter(modelNumber => 
//         modelNumber.model?.id === parseInt(formData.modelId) && modelNumber.isActive
//       );
//       setFilteredModelNumbers(filtered);
      
//       // Clear model number if model changes
//       if (originalData?.model?.id !== parseInt(formData.modelId)) {
//         setFormData(prev => ({
//           ...prev,
//           modelNumberId: ''
//         }));
//       }
//     } else {
//       setFilteredModelNumbers([]);
//       setFormData(prev => ({
//         ...prev,
//         modelNumberId: ''
//       }));
//     }
//   }, [formData.modelId, allModelNumbers, originalData]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     const updatedFormData = {
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     };
    
//     if (name === 'brandId') {
//       updatedFormData.modelId = '';
//       updatedFormData.modelNumberId = '';
//       setFilteredModelNumbers([]);
//     }
    
//     if (name === 'modelId') {
//       updatedFormData.modelNumberId = '';
//     }
    
//     setFormData(updatedFormData);
//     setError('');
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
//         modelNumberId: formData.modelNumberId ? parseInt(formData.modelNumberId) : null,
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
//         oneDayService: formData.oneDayService,
//         withCharger: formData.withCharger
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

//         <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
//           if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
//             e.preventDefault();
//           }
//         }}>
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Device Information with Cascading Dropdowns */}
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

//               {/* Brand Selection - Only Active Brands */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Brand (Optional)
//                 </label>
//                 <select
//                   name="brandId"
//                   value={formData.brandId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
//                 >
//                   <option value="">Select Brand (Optional)</option>
//                   {brands.map(brand => (
//                     <option key={brand.id} value={brand.id}>{brand.brandName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Model Selection (Filtered by Brand) - Only Active Models */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Model (Optional)
//                 </label>
//                 <select
//                   name="modelId"
//                   value={formData.modelId}
//                   onChange={handleChange}
//                   disabled={!formData.brandId}
//                   className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     !formData.brandId ? 'bg-gray-100 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   <option value="">
//                     {formData.brandId 
//                       ? 'Select Model (Optional)' 
//                       : 'Select Brand first'
//                     }
//                   </option>
//                   {filteredModels.map(model => (
//                     <option key={model.id} value={model.id}>{model.modelName}</option>
//                   ))}
//                 </select>
//                 {!formData.brandId && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     ⓘ Please select a brand first
//                   </p>
//                 )}
//               </div>

//               {/* Model Number Selection (Filtered by Model) - Only Active Model Numbers */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Model Number (Optional)
//                 </label>
//                 <select
//                   name="modelNumberId"
//                   value={formData.modelNumberId}
//                   onChange={handleChange}
//                   disabled={!formData.modelId}
//                   className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     !formData.modelId ? 'bg-gray-100 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   <option value="">
//                     {formData.modelId 
//                       ? 'Select Model Number (Optional)' 
//                       : 'Select Model first'
//                     }
//                   </option>
//                   {filteredModelNumbers.map(modelNumber => (
//                     <option key={modelNumber.id} value={modelNumber.id}>
//                       {modelNumber.modelNumber}
//                     </option>
//                   ))}
//                 </select>
//                 {!formData.modelId && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     ⓘ Please select a model first
//                   </p>
//                 )}
//               </div>

//               {/* Processor Selection - Only Active Processors */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Processor (Optional)
//                 </label>
//                 <select
//                   name="processorId"
//                   value={formData.processorId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Processor (Optional)</option>
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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

//         {/* With Charger Checkbox */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Charger Status</h3>
//             <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
//               formData.withCharger 
//                 ? 'bg-green-50 border-green-300' 
//                 : 'bg-gray-50 border-gray-300'
//             }`}>
//               <label className="flex items-center space-x-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={formData.withCharger}
//                   onChange={(e) => setFormData(prev => ({ ...prev, withCharger: e.target.checked }))}
//                   className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
//                 />
//                 <div className="flex-1">
//                   <span className="text-base font-semibold text-gray-900">
//                     Device received with charger
//                   </span>
//                   <p className="text-sm text-gray-600 mt-1">
//                     {formData.withCharger 
//                       ? '✓ Charger will be returned with device'
//                       : 'Device received without charger'
//                     }
//                   </p>
//                 </div>
//                 <div className={`px-3 py-1 rounded-full text-sm font-bold ${
//                   formData.withCharger 
//                     ? 'bg-green-600 text-white' 
//                     : 'bg-gray-300 text-gray-600'
//                 }`}>
//                   {formData.withCharger ? '✓ YES' : '✗ NO'}
//                 </div>
//               </label>
//             </div>
//           </div>

//           {/* Device Condition - Only Active Device Conditions */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Condition (Multiple)</h3>
//             <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Device Condition</label>
//                 <select
//                   onChange={(e) => addDeviceCondition(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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

//           {/* Faults Section - Only Active Faults */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Faults (Optional)</h3>
//             <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Fault Type</label>
//                 <select
//                   onChange={(e) => addFault(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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

//           {/* Services Section - Only Active Services */}
//           <div className="border-b border-gray-200 pb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Services (Optional)</h3>
//             <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
//                 <select
//                   onChange={(e) => addService(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                   onWheel={(e) => e.target.blur()}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                   onWheel={(e) => e.target.blur()}
//                   min="0"
//                   step="0.01"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') e.preventDefault();
//                 }}
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
//   const [scanning, setScanning] = useState(false);

//   const selectedItemData = items.find(i => i.id === parseInt(selectedItem));

//   // Prevent Enter key submission
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Enter' && e.target.type !== 'submit') {
//         e.preventDefault();
//         e.stopPropagation();
        
//         if (e.target.name === 'barcodeInput' && barcodeInput.trim()) {
//           handleBarcodeScan(barcodeInput.trim());
//         }
//         return false;
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown, true);
    
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown, true);
//     };
//   }, [barcodeInput]);

//   const filteredSerials = availableSerials.filter(serial => 
//     serial.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
//   );

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

//   const handleBarcodeScan = (barcode) => {
//     if (!selectedItemData?.hasSerialization) return;

//     setScanning(true);
    
//     const serial = availableSerials.find(s => 
//       s.serialNumber === barcode.trim()
//     );

//     if (serial) {
//       if (!selectedSerials.includes(serial.serialNumber)) {
//         if (selectedSerials.length < parseInt(quantity) || !quantity) {
//           setSelectedSerials(prev => [...prev, serial.serialNumber]);
          
//           const msg = document.createElement('div');
//           msg.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
//           msg.textContent = `📷 Scanned: ${serial.serialNumber}`;
//           document.body.appendChild(msg);
//           setTimeout(() => msg.remove(), 2000);
//         }
//       }
//     }
    
//     setTimeout(() => {
//       setBarcodeInput('');
//       setScanning(false);
//     }, 100);
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
//       <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
//         <h4 className="text-sm font-medium text-gray-700 mb-3">Add Used Item</h4>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
//             <select
//               value={selectedItem}
//               onChange={(e) => setSelectedItem(e.target.value)}
//               className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') e.preventDefault();
//               }}
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
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') e.preventDefault();
//               }}
//             />
//           </div>

//           <div className="flex items-end">
//             <button
//               type="button"
//               onClick={handleAdd}
//               className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') e.preventDefault();
//               }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') e.preventDefault();
//                     }}
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
//                   name="barcodeInput"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   placeholder="Scan barcode or type serial..."
//                   className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
//                   autoComplete="off"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       e.preventDefault();
//                       if (barcodeInput.trim()) {
//                         handleBarcodeScan(barcodeInput.trim());
//                       }
//                     }
//                   }}
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
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') e.preventDefault();
//                   }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') e.preventDefault();
//                     }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') e.preventDefault();
//                     }}
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
      
//       {scanning && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
//           📷 Scanning Serial...
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobCardEdit;

// import { useState, useEffect } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';
// import CancelOrderModal from './CancelOrderModal';
// import { useApi } from '../services/apiService';

// const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [faults, setFaults] = useState([]);
//   const [services, setServices] = useState([]);
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [allModels, setAllModels] = useState([]);
//   const [filteredModels, setFilteredModels] = useState([]);
//   const [allModelNumbers, setAllModelNumbers] = useState([]);
//   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
//   const [originalData, setOriginalData] = useState(null);

//   const [formData, setFormData] = useState({
//     customerName:'',customerPhone:'',customerEmail:'',
//     deviceType:'LAPTOP',brandId:'',modelId:'',modelNumberId:'',processorId:'',
//     deviceConditionIds:[],faultDescription:'',notes:'',
//     advancePayment:0,estimatedCost:0,status:'PENDING',
//     usedItems:[],selectedFaults:[],selectedServices:[],
//     oneDayService:false,withCharger:false,
//   });

//   const noProcessorTypes = ['PRINTER','PROJECTOR'];
//   const hasProcessor = !noProcessorTypes.includes(formData.deviceType);
//   const statusOptions = ['PENDING','IN_PROGRESS','WAITING_FOR_PARTS','WAITING_FOR_APPROVAL','COMPLETED','DELIVERED'];

//   useEffect(() => {
//     const h = (e) => { if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea'){e.preventDefault();e.stopPropagation();return false;} };
//     document.addEventListener('keydown',h,true); return()=>document.removeEventListener('keydown',h,true);
//   },[]);

//   useEffect(()=>{
//     const fetchData=async()=>{
//       try{
//         const [fd,sd,id,bd,md,mnd,pd,cd]=await Promise.all([
//           apiCall('/api/faults'),apiCall('/api/service-categories'),apiCall('/api/inventory'),
//           apiCall('/api/brands'),apiCall('/api/models'),apiCall('/api/model-numbers'),
//           apiCall('/api/processors'),apiCall('/api/device-conditions')
//         ]);
//         setFaults((fd||[]).filter(i=>i.isActive));setServices((sd||[]).filter(i=>i.isActive));
//         setInventoryItems(id||[]);setBrands((bd||[]).filter(i=>i.isActive));
//         setAllModels((md||[]).filter(i=>i.isActive));setAllModelNumbers((mnd||[]).filter(i=>i.isActive));
//         setProcessors((pd||[]).filter(i=>i.isActive));setDeviceConditions((cd||[]).filter(i=>i.isActive));
//       }catch(e){console.error(e);}
//     };
//     fetchData();
//   },[]);

//   useEffect(()=>{
//     const fetchJobCard=async()=>{
//       try{
//         setFetchLoading(true);
//         const data=await apiCall(`/api/jobcards/${jobCardId}`);
//         setFormData({
//           customerName:data.customerName||'',customerPhone:data.customerPhone||'',customerEmail:data.customerEmail||'',
//           deviceType:data.deviceType||'LAPTOP',brandId:data.brand?.id||'',modelId:data.model?.id||'',
//           modelNumberId:data.modelNumber?.id||'',processorId:data.processor?.id||'',
//           deviceConditionIds:data.deviceConditions?.map(dc=>dc.id)||[],
//           faultDescription:data.faultDescription||'',notes:data.notes||'',
//           advancePayment:data.advancePayment||0,estimatedCost:data.estimatedCost||0,status:data.status||'PENDING',
//           usedItems:data.usedItems?.map(i=>({...i,usedSerialNumbers:i.usedSerialNumbers||[]}))||[],
//           selectedFaults:data.faults?.map(f=>f.id)||[],selectedServices:data.serviceCategories||[],
//           oneDayService:data.oneDayService||false,withCharger:data.withCharger||false,
//         });
//         setOriginalData(data);
//       }catch(e){setError('Failed to load job card');console.error(e);}
//       finally{setFetchLoading(false);}
//     };
//     if(jobCardId) fetchJobCard();
//   },[jobCardId]);

//   useEffect(()=>{
//     if(formData.brandId){
//       setFilteredModels(allModels.filter(m=>m.brand?.id===parseInt(formData.brandId)&&m.isActive));
//       if(originalData?.brand?.id!==parseInt(formData.brandId)){setFormData(p=>({...p,modelId:'',modelNumberId:''}));setFilteredModelNumbers([]);}
//     }else{setFilteredModels([]);setFormData(p=>({...p,modelId:'',modelNumberId:''}));setFilteredModelNumbers([]);}
//   },[formData.brandId,allModels,originalData]);

//   useEffect(()=>{
//     if(formData.modelId){
//       setFilteredModelNumbers(allModelNumbers.filter(mn=>mn.model?.id===parseInt(formData.modelId)&&mn.isActive));
//       if(originalData?.model?.id!==parseInt(formData.modelId)) setFormData(p=>({...p,modelNumberId:''}));
//     }else{setFilteredModelNumbers([]);setFormData(p=>({...p,modelNumberId:''}));}
//   },[formData.modelId,allModelNumbers,originalData]);

//   const handleChange=(e)=>{
//     const{name,value,type,checked}=e.target;
//     if(name==='deviceType') return; // LOCKED in edit mode
//     const u={...formData,[name]:type==='checkbox'?checked:value};
//     if(name==='brandId'){u.modelId='';u.modelNumberId='';setFilteredModelNumbers([]);}
//     if(name==='modelId') u.modelNumberId='';
//     setFormData(u);setError('');
//   };

//   const addFault=(id)=>{if(!id)return;if(formData.selectedFaults.includes(parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,selectedFaults:[...p.selectedFaults,parseInt(id)]}));setError('');};
//   const removeFault=(id)=>setFormData(p=>({...p,selectedFaults:p.selectedFaults.filter(f=>f!==id)}));
//   const addService=(id)=>{if(!id)return;const s=services.find(x=>x.id===parseInt(id));if(!s||formData.selectedServices.some(x=>x.id===parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,selectedServices:[...p.selectedServices,s]}));setError('');};
//   const removeService=(id)=>setFormData(p=>({...p,selectedServices:p.selectedServices.filter(s=>s.id!==id)}));
//   const calcTotal=()=>formData.selectedServices.reduce((s,x)=>s+(x.servicePrice||0),0);
//   const addCond=(id)=>{if(!id)return;if(formData.deviceConditionIds.includes(parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,deviceConditionIds:[...p.deviceConditionIds,parseInt(id)]}));setError('');};
//   const removeCond=(id)=>setFormData(p=>({...p,deviceConditionIds:p.deviceConditionIds.filter(c=>c!==id)}));
//   const addUsedItem=(itemId,qty,serials=[])=>{if(!itemId||!qty){setError('Select item and quantity');return;}const item=inventoryItems.find(i=>i.id===parseInt(itemId));if(!item)return;if(item.hasSerialization&&serials.length!==parseInt(qty)){setError(`Select exactly ${qty} serial(s)`);return;}if(!item.hasSerialization&&parseInt(qty)>item.quantity){setError(`Only ${item.quantity} available`);return;}setFormData(p=>({...p,usedItems:[...p.usedItems,{inventoryItemId:parseInt(itemId),inventoryItem:item,quantityUsed:parseInt(qty),unitPrice:item.sellingPrice,usedSerialNumbers:serials}]}));setError('');};
//   const removeUsedItem=(i)=>setFormData(p=>({...p,usedItems:p.usedItems.filter((_,idx)=>idx!==i)}));

//   const handleSubmit=async(e)=>{
//     e.preventDefault();setLoading(true);setError('');
//     if(!formData.customerName.trim()){setError('Customer name required');setLoading(false);return;}
//     if(!formData.customerPhone.trim()){setError('Customer phone required');setLoading(false);return;}
//     try{
//       const payload={
//         customerName:formData.customerName,customerPhone:formData.customerPhone,customerEmail:formData.customerEmail,
//         deviceType:formData.deviceType,
//         brandId:formData.brandId?parseInt(formData.brandId):null,modelId:formData.modelId?parseInt(formData.modelId):null,
//         modelNumberId:formData.modelNumberId?parseInt(formData.modelNumberId):null,
//         processorId:hasProcessor&&formData.processorId?parseInt(formData.processorId):null,
//         deviceConditionIds:formData.deviceConditionIds,faultIds:formData.selectedFaults,
//         serviceCategoryIds:formData.selectedServices.map(s=>s.id),
//         faultDescription:formData.faultDescription,notes:formData.notes,
//         advancePayment:parseFloat(formData.advancePayment)||0,estimatedCost:parseFloat(formData.estimatedCost)||0,
//         status:formData.status,oneDayService:formData.oneDayService,withCharger:formData.withCharger,
//         usedItems:formData.usedItems.map(i=>({id:i.id||null,inventoryItemId:i.inventoryItem.id,quantityUsed:i.quantityUsed,unitPrice:i.unitPrice,usedSerialNumbers:i.usedSerialNumbers||[]}))
//       };
//       const response=await apiCall(`/api/jobcards/${jobCardId}`,{method:'PUT',body:JSON.stringify(payload)});
//       const m=document.createElement('div');m.className='fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';m.textContent=`Job Card updated!`;document.body.appendChild(m);setTimeout(()=>m.remove(),3000);
//       if(onSuccess) onSuccess(response);
//     }catch(e){setError(e.message||'Failed to update');console.error(e);}
//     finally{setLoading(false);}
//   };

//   if(fetchLoading) return(<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);

//   const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
//   const lbl="block text-xs font-medium text-gray-600 mb-0.5";
//   const ttl="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";
//   const sc=(s)=>{const m={PENDING:'bg-yellow-100 text-yellow-800',IN_PROGRESS:'bg-blue-100 text-blue-800',WAITING_FOR_PARTS:'bg-orange-100 text-orange-800',WAITING_FOR_APPROVAL:'bg-purple-100 text-purple-800',COMPLETED:'bg-green-100 text-green-800',DELIVERED:'bg-indigo-100 text-indigo-800',CANCELLED:'bg-red-100 text-red-800'};return m[s]||'bg-gray-100 text-gray-800';};

//   return(
//     <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
//       <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
//         <div className="flex items-center gap-3">
//           <h2 className="text-sm font-bold text-gray-900">Edit Job Card</h2>
//           {originalData&&<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">{originalData.jobNumber}</span>}
//           <span className={`text-xs px-2 py-0.5 rounded font-medium ${sc(formData.status)}`}>{formData.status.replace(/_/g,' ')}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           {error&&<span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">{error}</span>}
//           {onCancel&&<button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>}
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea')e.preventDefault();}}>
//         <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

//           {/* COL 1: Customer + Device (locked) + Status/Flags */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Customer Info</div>
//               <div className="space-y-1">
//                 <div><label className={lbl}>Name <span className="text-red-500">*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                 <div><label className={lbl}>Phone <span className="text-red-500">*</span></label><input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                 <div><label className={lbl}>Email</label><input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white flex-1">
//               <div className={ttl}>Device Info</div>
//               <div className="space-y-1">
//                 {/* LOCKED device type */}
//                 <div>
//                   <label className={lbl}>Type <span className="text-xs text-amber-500 font-normal">🔒 locked</span></label>
//                   <div className="w-full px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-semibold flex items-center justify-between">
//                     <span>{formData.deviceType}</span><span className="text-amber-400">🔒</span>
//                   </div>
//                   <p className="text-xs text-amber-500 mt-0.5 italic">Cannot change device type after creation</p>
//                 </div>
//                 <div><label className={lbl}>Brand</label><select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}><option value="">Select Brand</option>{brands.map(b=><option key={b.id} value={b.id}>{b.brandName}</option>)}</select></div>
//                 <div><label className={lbl}>Model</label><select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId?'bg-gray-100 cursor-not-allowed':''}`}><option value="">{formData.brandId?'Select Model':'Select Brand first'}</option>{filteredModels.map(m=><option key={m.id} value={m.id}>{m.modelName}</option>)}</select></div>
//                 <div><label className={lbl}>Model No.</label><select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId?'bg-gray-100 cursor-not-allowed':''}`}><option value="">{formData.modelId?'Select Model No.':'Select Model first'}</option>{filteredModelNumbers.map(mn=><option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}</select></div>
//                 {hasProcessor?(
//                   <div><label className={lbl}>Processor</label><select name="processorId" value={formData.processorId} onChange={handleChange} className={inp}><option value="">Select Processor</option>{processors.map(p=><option key={p.id} value={p.id}>{p.processorName}</option>)}</select></div>
//                 ):(
//                   <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5"><p className="text-xs text-amber-600 italic">⚠️ {formData.deviceType} has no processor</p></div>
//                 )}
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Status & Flags</div>
//               <div className="space-y-1.5">
//                 <div><label className={lbl}>Status <span className="text-red-500">*</span></label>
//                   <select name="status" value={formData.status} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                     {statusOptions.map(s=><option key={s} value={s}>{s==='WAITING_FOR_PARTS'?'⏳ Waiting for Parts':s==='WAITING_FOR_APPROVAL'?'👥 Waiting for Approval':s.replace(/_/g,' ')}</option>)}
//                   </select>
//                 </div>
//                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.oneDayService?'bg-red-50 border-red-300':'border-gray-200 hover:bg-gray-50'}`}>
//                   <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="w-3 h-3 text-red-600"/><span className="text-xs font-medium">🚨 One Day Service</span>
//                 </label>
//                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.withCharger?'bg-green-50 border-green-300':'border-gray-200 hover:bg-gray-50'}`}>
//                   <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="w-3 h-3 text-green-600"/><span className="text-xs font-medium">🔌 With Charger</span>
//                 </label>
//                 <button type="button" onClick={()=>setShowCancelModal(true)} className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors">✕ Cancel Job Card</button>
//               </div>
//             </div>
//           </div>

//           {/* COL 2: Conditions + Faults + Services */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-yellow-200 rounded p-2 bg-yellow-50">
//               <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
//               <select onChange={(e)=>addCond(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select condition --</option>{deviceConditions.map(c=><option key={c.id} value={c.id}>{c.conditionName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.deviceConditionIds.map(id=>{const c=deviceConditions.find(x=>x.id===id);return(<span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">{c?.conditionName}<button type="button" onClick={()=>removeCond(id)} className="text-yellow-600 hover:text-yellow-900 font-bold">✕</button></span>);})}
//                 {formData.deviceConditionIds.length===0&&<p className="text-xs text-yellow-500 italic">None selected</p>}
//               </div>
//             </div>

//             <div className="border border-red-200 rounded p-2 bg-red-50">
//               <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults</div>
//               <select onChange={(e)=>addFault(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select fault --</option>{faults.map(f=><option key={f.id} value={f.id}>{f.faultName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.selectedFaults.map(id=>{const f=faults.find(x=>x.id===id);return(<span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">{f?.faultName}<button type="button" onClick={()=>removeFault(id)} className="text-red-600 hover:text-red-900 font-bold">✕</button></span>);})}
//                 {formData.selectedFaults.length===0&&<p className="text-xs text-red-400 italic">None selected</p>}
//               </div>
//             </div>

//             <div className="border border-green-200 rounded p-2 bg-green-50 flex-1">
//               <div className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Services</div>
//               <select onChange={(e)=>addService(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select service --</option>{services.map(s=><option key={s.id} value={s.id}>{s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.selectedServices.map(s=>(<span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">{s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}<button type="button" onClick={()=>removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold">✕</button></span>))}
//                 {formData.selectedServices.length===0&&<p className="text-xs text-green-500 italic">None selected</p>}
//               </div>
//               {formData.selectedServices.length>0&&(<div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1"><span className="text-xs font-semibold text-gray-700">Service Total:</span><span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span></div>)}
//             </div>
//           </div>

//           {/* COL 3: Used Items + Descriptions */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white flex-1 flex flex-col overflow-hidden">
//               <div className={ttl}>Used Items / Parts</div>
//               <div className="flex-1 overflow-y-auto">
//                 <UsedItemsSection 
//                   items={inventoryItems} 
//                   usedItems={formData.usedItems} 
//                   onAdd={addUsedItem} 
//                   onRemove={removeUsedItem}
//                   isRegularCustomer={originalData?.isRegularCustomer || false}
//                 />
//                 {/* <UsedItemsSection items={inventoryItems} usedItems={formData.usedItems} onAdd={addUsedItem} onRemove={removeUsedItem}/> */}
//               </div>
//             </div>
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
//               <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3" placeholder="Detailed fault description..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
//               <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional notes..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>
//           </div>

//           {/* COL 4: Payment + Summary + Actions */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Payment Info</div>
//               <div className="space-y-1.5">
//                 <div><label className={lbl}>Advance Payment (Rs.)</label><input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                 <div><label className={lbl}>Estimated Cost (Rs.)</label><input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
//               <div className={ttl}>Summary</div>
//               <div className="space-y-1 text-xs">
//                 <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName||'—'}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType} 🔒</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`font-medium px-1.5 py-0.5 rounded text-xs ${sc(formData.status)}`}>{formData.status.replace(/_/g,' ')}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium">{formData.selectedFaults.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium">{formData.selectedServices.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Used Items:</span><span className="font-medium">{formData.usedItems.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium">{formData.deviceConditionIds.length}</span></div>
//                 {formData.oneDayService&&<div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
//                 {formData.withCharger&&<div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
//                 {formData.selectedServices.length>0&&(<div className="border-t border-gray-200 pt-1 flex justify-between"><span className="text-gray-500">Service Total:</span><span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span></div>)}
//                 {formData.usedItems.length>0&&(<div className="flex justify-between"><span className="text-gray-500">Parts Total:</span><span className="font-bold text-blue-700">Rs.{formData.usedItems.reduce((s,i)=>s+(i.quantityUsed*(i.unitPrice||0)),0).toFixed(2)}</span></div>)}
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">{loading?'Updating...':'✓ Update Job Card'}</button>
//               {onCancel&&<button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">Cancel</button>}
//             </div>
//           </div>
//         </div>
//       </form>

//       {showCancelModal&&originalData&&(
//         <CancelOrderModal jobCard={originalData} onSuccess={()=>{setShowCancelModal(false);if(onSuccess)onSuccess();}} onClose={()=>setShowCancelModal(false)}/>
//       )}
//     </div>
//   );
// };

// const UsedItemsSection = ({ items, usedItems, onAdd, onRemove, isRegularCustomer }) => {
//   const { apiCall } = useApi();
//   const [selectedItem, setSelectedItem] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [availableSerials, setAvailableSerials] = useState([]);
//   const [selectedSerials, setSelectedSerials] = useState([]);
//   const [loadingSerials, setLoadingSerials] = useState(false);
//   const [serialSearch, setSerialSearch] = useState('');
//   const [barcodeInput, setBarcodeInput] = useState('');
//   const selectedItemData = items.find(i => i.id === parseInt(selectedItem));
//   const filteredSerials = availableSerials.filter(s => s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase()));

//   // Compute effective price for selected item
//   const effectivePrice = selectedItemData
//     ? (isRegularCustomer && selectedItemData.specialPrice)
//       ? selectedItemData.specialPrice
//       : selectedItemData.sellingPrice
//     : null;
//   const isSpecialPriceActive = isRegularCustomer && selectedItemData?.specialPrice;

//   useEffect(() => {
//     const h = (e) => {
//       if (e.key === 'Enter' && e.target.type !== 'submit') {
//         e.preventDefault(); e.stopPropagation();
//         if (e.target.name === 'barcodeInput' && barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim());
//         return false;
//       }
//     };
//     document.addEventListener('keydown', h, true);
//     return () => document.removeEventListener('keydown', h, true);
//   }, [barcodeInput]);

//   useEffect(() => {
//     const fetchSerials = async () => {
//       if (selectedItemData?.hasSerialization) {
//         setLoadingSerials(true);
//         try { const s = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`); setAvailableSerials(s || []); }
//         catch (e) { console.error(e); setAvailableSerials([]); }
//         finally { setLoadingSerials(false); }
//       } else { setAvailableSerials([]); }
//       setSelectedSerials([]); setSerialSearch(''); setBarcodeInput('');
//     };
//     fetchSerials();
//   }, [selectedItemData]);

//   const handleBarcodeScan = (barcode) => {
//     if (!selectedItemData?.hasSerialization) return;
//     const s = availableSerials.find(x => x.serialNumber === barcode.trim());
//     if (s && !selectedSerials.includes(s.serialNumber) && (selectedSerials.length < parseInt(quantity) || !quantity)) {
//       setSelectedSerials(p => [...p, s.serialNumber]);
//       const m = document.createElement('div');
//       m.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
//       m.textContent = `📷 ${s.serialNumber}`;
//       document.body.appendChild(m); setTimeout(() => m.remove(), 2000);
//     }
//     setTimeout(() => setBarcodeInput(''), 100);
//   };

//   const handleAdd = () => {
//     if (!selectedItem || !quantity) { alert('Select item and quantity'); return; }
//     if (selectedItemData?.hasSerialization && selectedSerials.length !== parseInt(quantity)) { alert(`Select exactly ${quantity} serial(s)`); return; }
//     onAdd(selectedItem, quantity, selectedSerials);
//     setSelectedItem(''); setQuantity(''); setSelectedSerials([]); setAvailableSerials([]); setSerialSearch(''); setBarcodeInput('');
//   };

//   const inp = "w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";

//   return (
//     <div className="space-y-2">
//       <div className="border border-dashed border-gray-300 rounded p-2 bg-gray-50">
//         <div className="text-xs font-medium text-gray-600 mb-1">Add Item</div>
//         <div className="flex gap-1 mb-1">
//           <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="flex-1 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
//             <option value="">Select Item</option>
//             {items.map(i => {
//               const price = (isRegularCustomer && i.specialPrice) ? i.specialPrice : i.sellingPrice;
//               const hasSpecial = isRegularCustomer && i.specialPrice;
//               return (
//                 <option key={i.id} value={i.id}>
//                   {i.name}{i.hasSerialization ? ' 🔢' : ''} (Qty:{i.quantity}) {hasSpecial ? `⭐Rs.${i.specialPrice?.toFixed(2)}` : `Rs.${i.sellingPrice?.toFixed(2)}`}
//                 </option>
//               );
//             })}
//           </select>
//           <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" placeholder="Qty" className="w-14 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
//           <button type="button" onClick={handleAdd} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium">Add</button>
//         </div>

//         {/* Price info box */}
//         {selectedItemData && (
//           <div className={`text-xs rounded px-1.5 py-1 ${isSpecialPriceActive ? 'bg-amber-50 border border-amber-300 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
//             {isSpecialPriceActive ? (
//               <div className="flex items-center gap-2">
//                 <span className="font-bold text-amber-700">⭐ Special: Rs.{selectedItemData.specialPrice?.toFixed(2)}</span>
//                 <span className="text-gray-400 line-through text-xs">Rs.{selectedItemData.sellingPrice?.toFixed(2)}</span>
//                 <span className="ml-auto text-amber-600">Avail:{selectedItemData.quantity}{selectedItemData.hasSerialization && <span className="ml-1 font-medium">🔢</span>}</span>
//               </div>
//             ) : (
//               <span>Rs.{selectedItemData.sellingPrice?.toFixed(2)} | Avail:{selectedItemData.quantity}{selectedItemData.hasSerialization && <span className="ml-1 font-medium">🔢</span>}</span>
//             )}
//           </div>
//         )}

//         {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
//           <div className="mt-1.5 border border-yellow-200 rounded p-1.5 bg-yellow-50">
//             <div className="flex gap-1 mb-1">
//               <input value={serialSearch} onChange={(e) => setSerialSearch(e.target.value)} placeholder="Search serial..." className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
//               <input name="barcodeInput" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Scan..." className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none" autoComplete="off"
//                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim()); } }} />
//             </div>
//             <div className="text-xs text-yellow-700 mb-1">{selectedSerials.length}/{quantity || 0} selected</div>
//             <div className="max-h-20 overflow-y-auto space-y-0.5">
//               {loadingSerials ? <div className="text-xs text-center text-yellow-600">Loading...</div> : filteredSerials.map(s => (
//                 <label key={s.id} className={`flex items-center gap-1.5 p-1 rounded cursor-pointer text-xs ${selectedSerials.includes(s.serialNumber) ? 'bg-yellow-100 border border-yellow-300' : ''}`}>
//                   <input type="checkbox" checked={selectedSerials.includes(s.serialNumber)} onChange={(e) => { if (e.target.checked) setSelectedSerials(p => [...p, s.serialNumber]); else setSelectedSerials(p => p.filter(x => x !== s.serialNumber)); }} className="w-3 h-3" disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(s.serialNumber)} />
//                   <span className="font-mono">{s.serialNumber}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Used items list */}
//       {usedItems.length > 0 && (
//         <div className="space-y-1">
//           {usedItems.map((item, i) => (
//             <div key={i} className={`border rounded p-1.5 ${item.isSpecialPrice ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-gray-900">
//                     {item.isSpecialPrice && <span className="text-amber-500 mr-1">⭐</span>}
//                     {item.inventoryItem.name}{item.inventoryItem.hasSerialization ? ' 🔢' : ''}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Qty:{item.quantityUsed}×Rs.{item.unitPrice?.toFixed(2)}=Rs.{(item.quantityUsed * (item.unitPrice || 0)).toFixed(2)}
//                     {item.isSpecialPrice && <span className="ml-1 text-amber-600 font-medium">(Special)</span>}
//                   </p>
//                 </div>
//                 <button type="button" onClick={() => onRemove(i)} className="text-red-500 hover:text-red-700">
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               {item.usedSerialNumbers?.length > 0 && (
//                 <div className="flex flex-wrap gap-0.5 mt-1">
//                   {item.usedSerialNumbers.map((sn, si) => <span key={si} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">{sn}</span>)}
//                 </div>
//               )}
//             </div>
//           ))}
//           <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs font-medium text-blue-900">
//             Parts Total: Rs.{usedItems.reduce((s, i) => s + (i.quantityUsed * (i.unitPrice || 0)), 0).toFixed(2)}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// // const UsedItemsSection = ({ items, usedItems, onAdd, onRemove }) => {
// //   const { apiCall } = useApi();
// //   const [selectedItem, setSelectedItem] = useState('');
// //   const [quantity, setQuantity] = useState('');
// //   const [availableSerials, setAvailableSerials] = useState([]);
// //   const [selectedSerials, setSelectedSerials] = useState([]);
// //   const [loadingSerials, setLoadingSerials] = useState(false);
// //   const [serialSearch, setSerialSearch] = useState('');
// //   const [barcodeInput, setBarcodeInput] = useState('');
// //   const selectedItemData = items.find(i=>i.id===parseInt(selectedItem));
// //   const filteredSerials = availableSerials.filter(s=>s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase()));

// //   useEffect(()=>{
// //     const h=(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'){e.preventDefault();e.stopPropagation();if(e.target.name==='barcodeInput'&&barcodeInput.trim())handleBarcodeScan(barcodeInput.trim());return false;}};
// //     document.addEventListener('keydown',h,true);return()=>document.removeEventListener('keydown',h,true);
// //   },[barcodeInput]);

// //   useEffect(()=>{
// //     const fetchSerials=async()=>{
// //       if(selectedItemData?.hasSerialization){
// //         setLoadingSerials(true);
// //         try{const s=await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);setAvailableSerials(s||[]);}
// //         catch(e){console.error(e);setAvailableSerials([]);}
// //         finally{setLoadingSerials(false);}
// //       }else{setAvailableSerials([]);}
// //       setSelectedSerials([]);setSerialSearch('');setBarcodeInput('');
// //     };
// //     fetchSerials();
// //   },[selectedItemData]);

// //   const handleBarcodeScan=(barcode)=>{
// //     if(!selectedItemData?.hasSerialization)return;
// //     const s=availableSerials.find(x=>x.serialNumber===barcode.trim());
// //     if(s&&!selectedSerials.includes(s.serialNumber)&&(selectedSerials.length<parseInt(quantity)||!quantity)){
// //       setSelectedSerials(p=>[...p,s.serialNumber]);
// //       const m=document.createElement('div');m.className='fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';m.textContent=`📷 ${s.serialNumber}`;document.body.appendChild(m);setTimeout(()=>m.remove(),2000);
// //     }
// //     setTimeout(()=>setBarcodeInput(''),100);
// //   };

// //   const handleAdd=()=>{
// //     if(!selectedItem||!quantity){alert('Select item and quantity');return;}
// //     if(selectedItemData?.hasSerialization&&selectedSerials.length!==parseInt(quantity)){alert(`Select exactly ${quantity} serial(s)`);return;}
// //     onAdd(selectedItem,quantity,selectedSerials);
// //     setSelectedItem('');setQuantity('');setSelectedSerials([]);setAvailableSerials([]);setSerialSearch('');setBarcodeInput('');
// //   };

// //   const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";

// //   const addUsedItem = (itemId, qty, serials = []) => {
// //   if (!itemId || !qty) { setError('Select item and quantity'); return; }
// //   const item = inventoryItems.find(i => i.id === parseInt(itemId));
// //   if (!item) return;
// //   if (item.hasSerialization && serials.length !== parseInt(qty)) { setError(`Select exactly ${qty} serial(s)`); return; }
// //   if (!item.hasSerialization && parseInt(qty) > item.quantity) { setError(`Only ${item.quantity} available`); return; }
// //   const isRegularCustomer = originalData?.isRegularCustomer || false;
// //   const unitPrice = (isRegularCustomer && item.specialPrice) ? item.specialPrice : item.sellingPrice;
// //   setFormData(p => ({
// //     ...p,
// //     usedItems: [...p.usedItems, {
// //       inventoryItemId: parseInt(itemId),
// //       inventoryItem: item,
// //       quantityUsed: parseInt(qty),
// //       unitPrice: unitPrice,
// //       usedSerialNumbers: serials,
// //       isSpecialPrice: isRegularCustomer && !!item.specialPrice
// //     }]
// //   }));
// //   setError('');
// // };

// //   return(
// //     <div className="space-y-2">
// //       <div className="border border-dashed border-gray-300 rounded p-2 bg-gray-50">
// //         <div className="text-xs font-medium text-gray-600 mb-1">Add Item</div>
// //         <div className="flex gap-1 mb-1">
// //           <select value={selectedItem} onChange={(e)=>setSelectedItem(e.target.value)} className="flex-1 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none" onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
// //             <option value="">Select Item</option>
// //             {items.map(i=><option key={i.id} value={i.id}>{i.name}{i.hasSerialization?' 🔢':''} (Qty:{i.quantity})</option>)}
// //           </select>
// //           <input type="number" value={quantity} onChange={(e)=>setQuantity(e.target.value)} min="1" placeholder="Qty" className="w-14 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none" onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
// //           <button type="button" onClick={handleAdd} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium">Add</button>
// //         </div>
// //         {selectedItemData&&(<div className="text-xs text-blue-700 bg-blue-50 rounded px-1.5 py-1">Rs.{selectedItemData.sellingPrice?.toFixed(2)||'0.00'} | Avail:{selectedItemData.quantity}{selectedItemData.hasSerialization&&<span className="ml-1 font-medium">🔢</span>}</div>)}
// //         {selectedItemData?.hasSerialization&&availableSerials.length>0&&(
// //           <div className="mt-1.5 border border-yellow-200 rounded p-1.5 bg-yellow-50">
// //             <div className="flex gap-1 mb-1">
// //               <input value={serialSearch} onChange={(e)=>setSerialSearch(e.target.value)} placeholder="Search serial..." className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none" onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
// //               <input name="barcodeInput" value={barcodeInput} onChange={(e)=>setBarcodeInput(e.target.value)} placeholder="Scan..." className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none" autoComplete="off"
// //                 onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(barcodeInput.trim())handleBarcodeScan(barcodeInput.trim());}}}/>
// //             </div>
// //             <div className="text-xs text-yellow-700 mb-1">{selectedSerials.length}/{quantity||0} selected</div>
// //             <div className="max-h-20 overflow-y-auto space-y-0.5">
// //               {loadingSerials?<div className="text-xs text-center text-yellow-600">Loading...</div>:filteredSerials.map(s=>(
// //                 <label key={s.id} className={`flex items-center gap-1.5 p-1 rounded cursor-pointer text-xs ${selectedSerials.includes(s.serialNumber)?'bg-yellow-100 border border-yellow-300':''}`}>
// //                   <input type="checkbox" checked={selectedSerials.includes(s.serialNumber)} onChange={(e)=>{ if(e.target.checked)setSelectedSerials(p=>[...p,s.serialNumber]);else setSelectedSerials(p=>p.filter(x=>x!==s.serialNumber)); }} className="w-3 h-3" disabled={selectedSerials.length>=parseInt(quantity)&&!selectedSerials.includes(s.serialNumber)}/>
// //                   <span className="font-mono">{s.serialNumber}</span>
// //                 </label>
// //               ))}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //       {usedItems.length>0&&(
// //         <div className="space-y-1">
// //           {usedItems.map((item,i)=>(
// //             <div key={i} className="bg-white border border-gray-200 rounded p-1.5">
// //               <div className="flex items-center justify-between">
// //                 <div><p className="text-xs font-medium text-gray-900">{item.inventoryItem.name}{item.inventoryItem.hasSerialization?' 🔢':''}</p><p className="text-xs text-gray-500">Qty:{item.quantityUsed}×Rs.{item.unitPrice?.toFixed(2)}=Rs.{(item.quantityUsed*(item.unitPrice||0)).toFixed(2)}</p></div>
// //                 <button type="button" onClick={()=>onRemove(i)} className="text-red-500 hover:text-red-700"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
// //               </div>
// //               {item.usedSerialNumbers?.length>0&&(<div className="flex flex-wrap gap-0.5 mt-1">{item.usedSerialNumbers.map((sn,si)=><span key={si} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">{sn}</span>)}</div>)}
// //             </div>
// //           ))}
// //           <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs font-medium text-blue-900">Parts Total: Rs.{usedItems.reduce((s,i)=>s+(i.quantityUsed*(i.unitPrice||0)),0).toFixed(2)}</div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// export default JobCardEdit;




// import { useState, useEffect } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';
// import CancelOrderModal from './CancelOrderModal';
// import { useApi } from '../services/apiService';

// const JobCardEdit = ({ jobCardId, onSuccess, onCancel }) => {
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [faults, setFaults] = useState([]);
//   const [services, setServices] = useState([]);
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [allModels, setAllModels] = useState([]);
//   const [filteredModels, setFilteredModels] = useState([]);
//   const [allModelNumbers, setAllModelNumbers] = useState([]);
//   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
//   const [originalData, setOriginalData] = useState(null);

//   const [formData, setFormData] = useState({
//     customerName:'',customerPhone:'',customerEmail:'',
//     deviceType:'LAPTOP',brandId:'',modelId:'',modelNumberId:'',processorId:'',
//     deviceConditionIds:[],faultDescription:'',notes:'',
//     advancePayment:0,estimatedCost:0,status:'PENDING',
//     usedItems:[],selectedFaults:[],selectedServices:[],
//     oneDayService:false,withCharger:false,
//   });

//   const noProcessorTypes = ['PRINTER','PROJECTOR'];
//   const hasProcessor = !noProcessorTypes.includes(formData.deviceType);
//   const statusOptions = ['PENDING','IN_PROGRESS','WAITING_FOR_PARTS','WAITING_FOR_APPROVAL','COMPLETED','DELIVERED'];

//   useEffect(() => {
//     const h = (e) => { if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea'){e.preventDefault();e.stopPropagation();return false;} };
//     document.addEventListener('keydown',h,true); return()=>document.removeEventListener('keydown',h,true);
//   },[]);

//   useEffect(()=>{
//     const fetchData=async()=>{
//       try{
//         const [fd,sd,id,bd,md,mnd,pd,cd]=await Promise.all([
//           apiCall('/api/faults'),apiCall('/api/service-categories'),apiCall('/api/inventory'),
//           apiCall('/api/brands'),apiCall('/api/models'),apiCall('/api/model-numbers'),
//           apiCall('/api/processors'),apiCall('/api/device-conditions')
//         ]);
//         setFaults((fd||[]).filter(i=>i.isActive));setServices((sd||[]).filter(i=>i.isActive));
//         setInventoryItems(id||[]);setBrands((bd||[]).filter(i=>i.isActive));
//         setAllModels((md||[]).filter(i=>i.isActive));setAllModelNumbers((mnd||[]).filter(i=>i.isActive));
//         setProcessors((pd||[]).filter(i=>i.isActive));setDeviceConditions((cd||[]).filter(i=>i.isActive));
//       }catch(e){console.error(e);}
//     };
//     fetchData();
//   },[]);

//   useEffect(()=>{
//     const fetchJobCard=async()=>{
//       try{
//         setFetchLoading(true);
//         const data=await apiCall(`/api/jobcards/${jobCardId}`);
//         setFormData({
//           customerName:data.customerName||'',customerPhone:data.customerPhone||'',customerEmail:data.customerEmail||'',
//           deviceType:data.deviceType||'LAPTOP',brandId:data.brand?.id||'',modelId:data.model?.id||'',
//           modelNumberId:data.modelNumber?.id||'',processorId:data.processor?.id||'',
//           deviceConditionIds:data.deviceConditions?.map(dc=>dc.id)||[],
//           faultDescription:data.faultDescription||'',notes:data.notes||'',
//           advancePayment:data.advancePayment||0,estimatedCost:data.estimatedCost||0,status:data.status||'PENDING',
//           usedItems:data.usedItems?.map(i=>({...i,usedSerialNumbers:i.usedSerialNumbers||[]}))||[],
//           selectedFaults:data.faults?.map(f=>f.id)||[],selectedServices:data.serviceCategories||[],
//           oneDayService:data.oneDayService||false,withCharger:data.withCharger||false,
//         });
//         setOriginalData(data);
//       }catch(e){setError('Failed to load job card');console.error(e);}
//       finally{setFetchLoading(false);}
//     };
//     if(jobCardId) fetchJobCard();
//   },[jobCardId]);

//   useEffect(()=>{
//     if(formData.brandId){
//       setFilteredModels(allModels.filter(m=>m.brand?.id===parseInt(formData.brandId)&&m.isActive));
//       if(originalData?.brand?.id!==parseInt(formData.brandId)){setFormData(p=>({...p,modelId:'',modelNumberId:''}));setFilteredModelNumbers([]);}
//     }else{setFilteredModels([]);setFormData(p=>({...p,modelId:'',modelNumberId:''}));setFilteredModelNumbers([]);}
//   },[formData.brandId,allModels,originalData]);

//   useEffect(()=>{
//     if(formData.modelId){
//       setFilteredModelNumbers(allModelNumbers.filter(mn=>mn.model?.id===parseInt(formData.modelId)&&mn.isActive));
//       if(originalData?.model?.id!==parseInt(formData.modelId)) setFormData(p=>({...p,modelNumberId:''}));
//     }else{setFilteredModelNumbers([]);setFormData(p=>({...p,modelNumberId:''}));}
//   },[formData.modelId,allModelNumbers,originalData]);

//   const handleChange=(e)=>{
//     const{name,value,type,checked}=e.target;
//     if(name==='deviceType') return;
//     const u={...formData,[name]:type==='checkbox'?checked:value};
//     if(name==='brandId'){u.modelId='';u.modelNumberId='';setFilteredModelNumbers([]);}
//     if(name==='modelId') u.modelNumberId='';
//     setFormData(u);setError('');
//   };

//   const addFault=(id)=>{if(!id)return;if(formData.selectedFaults.includes(parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,selectedFaults:[...p.selectedFaults,parseInt(id)]}));setError('');};
//   const removeFault=(id)=>setFormData(p=>({...p,selectedFaults:p.selectedFaults.filter(f=>f!==id)}));
//   const addService=(id)=>{if(!id)return;const s=services.find(x=>x.id===parseInt(id));if(!s||formData.selectedServices.some(x=>x.id===parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,selectedServices:[...p.selectedServices,s]}));setError('');};
//   const removeService=(id)=>setFormData(p=>({...p,selectedServices:p.selectedServices.filter(s=>s.id!==id)}));
//   const calcTotal=()=>formData.selectedServices.reduce((s,x)=>s+(x.servicePrice||0),0);
//   const addCond=(id)=>{if(!id)return;if(formData.deviceConditionIds.includes(parseInt(id))){setError('Already selected');return;}setFormData(p=>({...p,deviceConditionIds:[...p.deviceConditionIds,parseInt(id)]}));setError('');};
//   const removeCond=(id)=>setFormData(p=>({...p,deviceConditionIds:p.deviceConditionIds.filter(c=>c!==id)}));
//   const addUsedItem=(itemId,qty,serials=[])=>{if(!itemId||!qty){setError('Select item and quantity');return;}const item=inventoryItems.find(i=>i.id===parseInt(itemId));if(!item)return;if(item.hasSerialization&&serials.length!==parseInt(qty)){setError(`Select exactly ${qty} serial(s)`);return;}if(!item.hasSerialization&&parseInt(qty)>item.quantity){setError(`Only ${item.quantity} available`);return;}setFormData(p=>({...p,usedItems:[...p.usedItems,{inventoryItemId:parseInt(itemId),inventoryItem:item,quantityUsed:parseInt(qty),unitPrice:item.sellingPrice,usedSerialNumbers:serials}]}));setError('');};
//   const removeUsedItem=(i)=>setFormData(p=>({...p,usedItems:p.usedItems.filter((_,idx)=>idx!==i)}));

//   const handleSubmit=async(e)=>{
//     e.preventDefault();setLoading(true);setError('');
//     if(!formData.customerName.trim()){setError('Customer name required');setLoading(false);return;}
//     if(!formData.customerPhone.trim()){setError('Customer phone required');setLoading(false);return;}
//     try{
//       const payload={
//         customerName:formData.customerName,customerPhone:formData.customerPhone,customerEmail:formData.customerEmail,
//         deviceType:formData.deviceType,
//         brandId:formData.brandId?parseInt(formData.brandId):null,modelId:formData.modelId?parseInt(formData.modelId):null,
//         modelNumberId:formData.modelNumberId?parseInt(formData.modelNumberId):null,
//         processorId:hasProcessor&&formData.processorId?parseInt(formData.processorId):null,
//         deviceConditionIds:formData.deviceConditionIds,faultIds:formData.selectedFaults,
//         serviceCategoryIds:formData.selectedServices.map(s=>s.id),
//         faultDescription:formData.faultDescription,notes:formData.notes,
//         advancePayment:parseFloat(formData.advancePayment)||0,estimatedCost:parseFloat(formData.estimatedCost)||0,
//         status:formData.status,oneDayService:formData.oneDayService,withCharger:formData.withCharger,
//         usedItems:formData.usedItems.map(i=>({id:i.id||null,inventoryItemId:i.inventoryItem.id,quantityUsed:i.quantityUsed,unitPrice:i.unitPrice,usedSerialNumbers:i.usedSerialNumbers||[]}))
//       };
//       const response=await apiCall(`/api/jobcards/${jobCardId}`,{method:'PUT',body:JSON.stringify(payload)});
//       const m=document.createElement('div');m.className='fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';m.textContent='Job Card updated!';document.body.appendChild(m);setTimeout(()=>m.remove(),3000);
//       if(onSuccess) onSuccess(response);
//     }catch(e){setError(e.message||'Failed to update');console.error(e);}
//     finally{setLoading(false);}
//   };

//   if(fetchLoading) return(<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);

//   const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
//   const lbl="block text-xs font-medium text-gray-600 mb-0.5";
//   const ttl="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";
//   const sc=(s)=>{const m={PENDING:'bg-yellow-100 text-yellow-800',IN_PROGRESS:'bg-blue-100 text-blue-800',WAITING_FOR_PARTS:'bg-orange-100 text-orange-800',WAITING_FOR_APPROVAL:'bg-purple-100 text-purple-800',COMPLETED:'bg-green-100 text-green-800',DELIVERED:'bg-indigo-100 text-indigo-800',CANCELLED:'bg-red-100 text-red-800'};return m[s]||'bg-gray-100 text-gray-800';};

//   return(
//     <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

//       {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           ALWAYS-VISIBLE HEADER — Status & Flags live here
//       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
//       <div className="flex-none bg-white border-b-2 border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap shadow-sm">

//         {/* Title + Job Number */}
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <h2 className="text-sm font-bold text-gray-900">Edit Job Card</h2>
//           {originalData && (
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono border border-gray-200">
//               {originalData.jobNumber}
//             </span>
//           )}
//         </div>

//         <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

//         {/* ── STATUS DROPDOWN ── */}
//         <div className="flex items-center gap-1.5 flex-shrink-0">
//           <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</span>
//           <select
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             required
//             onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}
//             className={`px-2.5 py-1 rounded text-xs font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-colors ${sc(formData.status)}`}
//             style={{borderColor:'currentColor'}}
//           >
//             {statusOptions.map(s=>(
//               <option key={s} value={s}>
//                 {s==='WAITING_FOR_PARTS' ? '⏳ Waiting for Parts'
//                   : s==='WAITING_FOR_APPROVAL' ? '👥 Waiting for Approval'
//                   : s==='IN_PROGRESS' ? '🔧 In Progress'
//                   : s==='PENDING' ? '🕐 Pending'
//                   : s==='COMPLETED' ? '✅ Completed'
//                   : s==='DELIVERED' ? '📦 Delivered'
//                   : s.replace(/_/g,' ')}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

//         {/* ── ONE DAY SERVICE TOGGLE ── */}
//         <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded border-2 cursor-pointer text-xs font-semibold transition-all select-none flex-shrink-0
//           ${formData.oneDayService
//             ? 'bg-red-500 border-red-500 text-white shadow-sm'
//             : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'
//           }`}>
//           <input
//             type="checkbox"
//             name="oneDayService"
//             checked={formData.oneDayService}
//             onChange={handleChange}
//             className="sr-only"
//           />
//           🚨 1-Day Service
//         </label>

//         {/* ── WITH CHARGER TOGGLE ── */}
//         <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded border-2 cursor-pointer text-xs font-semibold transition-all select-none flex-shrink-0
//           ${formData.withCharger
//             ? 'bg-green-500 border-green-500 text-white shadow-sm'
//             : 'bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-500'
//           }`}>
//           <input
//             type="checkbox"
//             name="withCharger"
//             checked={formData.withCharger}
//             onChange={handleChange}
//             className="sr-only"
//           />
//           🔌 With Charger
//         </label>

//         <div className="w-px h-5 bg-gray-300 flex-shrink-0 mx-1" />

//         {/* ── CANCEL JOB CARD ── */}
//         <button
//           type="button"
//           onClick={()=>setShowCancelModal(true)}
//           className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded border-2 border-red-600 hover:border-red-700 transition-colors flex-shrink-0"
//         >
//           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
//           </svg>
//           Cancel Job
//         </button>

//         {/* Spacer */}
//         <div className="flex-1 min-w-0" />

//         {/* Error + Close */}
//         <div className="flex items-center gap-2 flex-shrink-0">
//           {error && (
//             <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">
//               {error}
//             </span>
//           )}
//           {onCancel && (
//             <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           FORM BODY — 4-column grid
//       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
//       <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea')e.preventDefault();}}>
//         <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

//           {/* ── COL 1: Customer Info + Device Info ── */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Customer Info</div>
//               <div className="space-y-1">
//                 <div>
//                   <label className={lbl}>Name <span className="text-red-500">*</span></label>
//                   <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//                 <div>
//                   <label className={lbl}>Phone <span className="text-red-500">*</span></label>
//                   <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//                 <div>
//                   <label className={lbl}>Email</label>
//                   <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white flex-1 overflow-y-auto">
//               <div className={ttl}>Device Info</div>
//               <div className="space-y-1">
//                 {/* Locked device type */}
//                 <div>
//                   <label className={lbl}>Type <span className="text-xs text-amber-500 font-normal">🔒 locked</span></label>
//                   <div className="w-full px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-semibold flex items-center justify-between">
//                     <span>{formData.deviceType}</span><span className="text-amber-400">🔒</span>
//                   </div>
//                   <p className="text-xs text-amber-500 mt-0.5 italic">Cannot change device type after creation</p>
//                 </div>
//                 <div>
//                   <label className={lbl}>Brand</label>
//                   <select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}>
//                     <option value="">Select Brand</option>
//                     {brands.map(b=><option key={b.id} value={b.id}>{b.brandName}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className={lbl}>Model</label>
//                   <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId?'bg-gray-100 cursor-not-allowed':''}`}>
//                     <option value="">{formData.brandId?'Select Model':'Select Brand first'}</option>
//                     {filteredModels.map(m=><option key={m.id} value={m.id}>{m.modelName}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className={lbl}>Model No.</label>
//                   <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId?'bg-gray-100 cursor-not-allowed':''}`}>
//                     <option value="">{formData.modelId?'Select Model No.':'Select Model first'}</option>
//                     {filteredModelNumbers.map(mn=><option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
//                   </select>
//                 </div>
//                 {hasProcessor ? (
//                   <div>
//                     <label className={lbl}>Processor</label>
//                     <select name="processorId" value={formData.processorId} onChange={handleChange} className={inp}>
//                       <option value="">Select Processor</option>
//                       {processors.map(p=><option key={p.id} value={p.id}>{p.processorName}</option>)}
//                     </select>
//                   </div>
//                 ) : (
//                   <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
//                     <p className="text-xs text-amber-600 italic">⚠️ {formData.deviceType} has no processor</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ── COL 2: Conditions + Faults + Services ── */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-yellow-200 rounded p-2 bg-yellow-50">
//               <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
//               <select onChange={(e)=>addCond(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select condition --</option>
//                 {deviceConditions.map(c=><option key={c.id} value={c.id}>{c.conditionName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.deviceConditionIds.map(id=>{const c=deviceConditions.find(x=>x.id===id);return(<span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">{c?.conditionName}<button type="button" onClick={()=>removeCond(id)} className="text-yellow-600 hover:text-yellow-900 font-bold ml-0.5">✕</button></span>);})}
//                 {formData.deviceConditionIds.length===0&&<p className="text-xs text-yellow-500 italic">None selected</p>}
//               </div>
//             </div>

//             <div className="border border-red-200 rounded p-2 bg-red-50">
//               <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults</div>
//               <select onChange={(e)=>addFault(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select fault --</option>
//                 {faults.map(f=><option key={f.id} value={f.id}>{f.faultName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.selectedFaults.map(id=>{const f=faults.find(x=>x.id===id);return(<span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">{f?.faultName}<button type="button" onClick={()=>removeFault(id)} className="text-red-600 hover:text-red-900 font-bold ml-0.5">✕</button></span>);})}
//                 {formData.selectedFaults.length===0&&<p className="text-xs text-red-400 italic">None selected</p>}
//               </div>
//             </div>

//             <div className="border border-green-200 rounded p-2 bg-green-50 flex-1">
//               <div className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Services</div>
//               <select onChange={(e)=>addService(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select service --</option>
//                 {services.map(s=><option key={s.id} value={s.id}>{s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
//                 {formData.selectedServices.map(s=>(<span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">{s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}<button type="button" onClick={()=>removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold ml-0.5">✕</button></span>))}
//                 {formData.selectedServices.length===0&&<p className="text-xs text-green-500 italic">None selected</p>}
//               </div>
//               {formData.selectedServices.length>0&&(
//                 <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
//                   <span className="text-xs font-semibold text-gray-700">Service Total:</span>
//                   <span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ── COL 3: Used Items + Descriptions ── */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white flex-1 flex flex-col overflow-hidden">
//               <div className={ttl}>Used Items / Parts</div>
//               <div className="flex-1 overflow-y-auto">
//                 <UsedItemsSection
//                   items={inventoryItems}
//                   usedItems={formData.usedItems}
//                   onAdd={addUsedItem}
//                   onRemove={removeUsedItem}
//                   isRegularCustomer={originalData?.isRegularCustomer || false}
//                 />
//               </div>
//             </div>
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
//               <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3" placeholder="Detailed fault description..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
//               <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional notes..." className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>
//           </div>

//           {/* ── COL 4: Payment + Summary + Actions ── */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Payment Info</div>
//               <div className="space-y-1.5">
//                 <div>
//                   <label className={lbl}>Advance Payment (Rs.)</label>
//                   <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//                 <div>
//                   <label className={lbl}>Estimated Cost (Rs.)</label>
//                   <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
//               <div className={ttl}>Summary</div>
//               <div className="space-y-1 text-xs">
//                 <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName||'—'}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType} 🔒</span></div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-500">Status:</span>
//                   <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${sc(formData.status)}`}>{formData.status.replace(/_/g,' ')}</span>
//                 </div>
//                 <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium">{formData.selectedFaults.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium">{formData.selectedServices.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Used Items:</span><span className="font-medium">{formData.usedItems.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium">{formData.deviceConditionIds.length}</span></div>
//                 {formData.oneDayService&&<div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
//                 {formData.withCharger&&<div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
//                 {formData.selectedServices.length>0&&(
//                   <div className="border-t border-gray-200 pt-1 flex justify-between">
//                     <span className="text-gray-500">Service Total:</span>
//                     <span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
//                   </div>
//                 )}
//                 {formData.usedItems.length>0&&(
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Parts Total:</span>
//                     <span className="font-bold text-blue-700">Rs.{formData.usedItems.reduce((s,i)=>s+(i.quantityUsed*(i.unitPrice||0)),0).toFixed(2)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">
//                 {loading?'Updating...':'✓ Update Job Card'}
//               </button>
//               {onCancel&&(
//                 <button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </div>

//         </div>
//       </form>

//       {showCancelModal&&originalData&&(
//         <CancelOrderModal
//           jobCard={originalData}
//           onSuccess={()=>{setShowCancelModal(false);if(onSuccess)onSuccess();}}
//           onClose={()=>setShowCancelModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// //  UsedItemsSection
// // ─────────────────────────────────────────────
// const UsedItemsSection = ({ items, usedItems, onAdd, onRemove, isRegularCustomer }) => {
//   const { apiCall } = useApi();
//   const [selectedItem, setSelectedItem] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [availableSerials, setAvailableSerials] = useState([]);
//   const [selectedSerials, setSelectedSerials] = useState([]);
//   const [loadingSerials, setLoadingSerials] = useState(false);
//   const [serialSearch, setSerialSearch] = useState('');
//   const [barcodeInput, setBarcodeInput] = useState('');

//   const selectedItemData = items.find(i => i.id === parseInt(selectedItem));
//   const filteredSerials = availableSerials.filter(s =>
//     s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
//   );
//   const isSpecialPriceActive = isRegularCustomer && selectedItemData?.specialPrice;

//   useEffect(() => {
//     const h = (e) => {
//       if (e.key === 'Enter' && e.target.type !== 'submit') {
//         e.preventDefault(); e.stopPropagation();
//         if (e.target.name === 'barcodeInput' && barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim(), true);
//         return false;
//       }
//     };
//     document.addEventListener('keydown', h, true);
//     return () => document.removeEventListener('keydown', h, true);
//   }, [barcodeInput]);

//   useEffect(() => {
//     const fetchSerials = async () => {
//       if (selectedItemData?.hasSerialization) {
//         setLoadingSerials(true);
//         try {
//           const s = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);
//           setAvailableSerials(s || []);
//         } catch (e) {
//           console.error(e); setAvailableSerials([]);
//         } finally {
//           setLoadingSerials(false);
//         }
//       } else {
//         setAvailableSerials([]);
//       }
//       setSelectedSerials([]); setSerialSearch(''); setBarcodeInput('');
//     };
//     fetchSerials();
//   }, [selectedItemData]);

//   const handleBarcodeScan = (barcode, triggerAddIfComplete = false) => {
//     if (!selectedItemData?.hasSerialization) return;
//     const s = availableSerials.find(x => x.serialNumber === barcode.trim());
//     if (s && !selectedSerials.includes(s.serialNumber) && (selectedSerials.length < parseInt(quantity) || !quantity)) {
//       const newSerials = [...selectedSerials, s.serialNumber];
//       setSelectedSerials(newSerials);
//       const m = document.createElement('div');
//       m.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
//       m.textContent = `📷 ${s.serialNumber}`;
//       document.body.appendChild(m); setTimeout(() => m.remove(), 2000);
//       if (triggerAddIfComplete && selectedItem && quantity && newSerials.length === parseInt(quantity)) {
//         setTimeout(() => {
//           onAdd(selectedItem, quantity, newSerials);
//           setSelectedItem(''); setQuantity(''); setSelectedSerials([]);
//           setAvailableSerials([]); setSerialSearch(''); setBarcodeInput('');
//         }, 150);
//         return;
//       }
//     }
//     setTimeout(() => setBarcodeInput(''), 100);
//   };

//   const handleAdd = () => {
//     if (!selectedItem || !quantity) { alert('Select item and quantity'); return; }
//     if (selectedItemData?.hasSerialization && selectedSerials.length !== parseInt(quantity)) {
//       alert(`Select exactly ${quantity} serial(s)`); return;
//     }
//     onAdd(selectedItem, quantity, selectedSerials);
//     setSelectedItem(''); setQuantity(''); setSelectedSerials([]);
//     setAvailableSerials([]); setSerialSearch(''); setBarcodeInput('');
//   };

//   const canAdd = selectedItem && quantity && parseInt(quantity) > 0 &&
//     (!selectedItemData?.hasSerialization || selectedSerials.length === parseInt(quantity));

//   return (
//     <div className="space-y-2">
//       {/* Add Item Card */}
//       <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
//         <div className="bg-blue-600 px-2.5 py-1.5 flex items-center gap-1.5">
//           <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
//           </svg>
//           <span className="text-xs font-semibold text-white tracking-wide">ADD ITEM / PART</span>
//         </div>

//         <div className="p-2 space-y-2">
//           <div>
//             <label className="block text-xs text-gray-500 mb-0.5 font-medium">Select Item</label>
//             <select
//               value={selectedItem}
//               onChange={(e) => setSelectedItem(e.target.value)}
//               className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//               onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
//             >
//               <option value="">— Choose an item —</option>
//               {items.map(i => {
//                 const hasSpecial = isRegularCustomer && i.specialPrice;
//                 return (
//                   <option key={i.id} value={i.id}>
//                     {i.name}{i.hasSerialization ? ' 🔢' : ''} (Qty:{i.quantity}) {hasSpecial ? `⭐Rs.${i.specialPrice?.toFixed(2)}` : `Rs.${i.sellingPrice?.toFixed(2)}`}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>

//           <div className="flex gap-2 items-end">
//             <div className="flex-1">
//               <label className="block text-xs text-gray-500 mb-0.5 font-medium">Quantity</label>
//               <input
//                 type="number"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 min="1"
//                 placeholder="e.g. 1"
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) handleAdd(); } }}
//               />
//             </div>
//             <button
//               type="button"
//               onClick={handleAdd}
//               disabled={!canAdd}
//               className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap
//                 ${canAdd
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-95'
//                   : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
//                 }`}
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
//               </svg>
//               Add
//             </button>
//           </div>

//           {selectedItemData && (
//             <div className={`rounded px-2 py-1.5 text-xs flex items-center justify-between
//               ${isSpecialPriceActive
//                 ? 'bg-amber-50 border border-amber-300 text-amber-800'
//                 : 'bg-blue-50 border border-blue-200 text-blue-700'
//               }`}>
//               {isSpecialPriceActive ? (
//                 <>
//                   <div className="flex items-center gap-1.5">
//                     <span className="font-bold text-amber-700">⭐ Special: Rs.{selectedItemData.specialPrice?.toFixed(2)}</span>
//                     <span className="text-gray-400 line-through">Rs.{selectedItemData.sellingPrice?.toFixed(2)}</span>
//                   </div>
//                   <span className="text-amber-600 font-medium">
//                     Stock: {selectedItemData.quantity}
//                     {selectedItemData.hasSerialization && <span className="ml-1">🔢</span>}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span>Unit: <strong>Rs.{selectedItemData.sellingPrice?.toFixed(2)}</strong></span>
//                   <span className="text-gray-500">
//                     Stock: {selectedItemData.quantity}
//                     {selectedItemData.hasSerialization && <span className="ml-1">🔢</span>}
//                   </span>
//                 </>
//               )}
//             </div>
//           )}

//           {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
//             <div className="border border-yellow-300 rounded-lg overflow-hidden bg-yellow-50">
//               <div className="bg-yellow-400 px-2 py-1 flex items-center justify-between">
//                 <span className="text-xs font-semibold text-yellow-900">🔢 Serial Numbers</span>
//                 <span className="text-xs font-bold text-yellow-900 bg-yellow-300 px-1.5 py-0.5 rounded-full">
//                   {selectedSerials.length} / {quantity || 0} selected
//                 </span>
//               </div>
//               <div className="p-1.5 space-y-1.5">
//                 <div className="flex gap-1">
//                   <input
//                     name="barcodeInput"
//                     value={barcodeInput}
//                     onChange={(e) => setBarcodeInput(e.target.value)}
//                     placeholder="📷 Scan..."
//                     className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none bg-white"
//                     autoComplete="off"
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') { e.preventDefault(); if (barcodeInput.trim()) handleBarcodeScan(barcodeInput.trim(), true); }
//                     }}
//                   />
//                   <input
//                     value={serialSearch}
//                     onChange={(e) => setSerialSearch(e.target.value)}
//                     placeholder="🔍 Search serial..."
//                     className="flex-1 px-1.5 py-1 border border-yellow-300 rounded text-xs focus:outline-none bg-white"
//                     onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) handleAdd(); } }}
//                   />
//                 </div>
//                 <div className="max-h-20 overflow-y-auto space-y-0.5">
//                   {loadingSerials ? (
//                     <div className="text-xs text-center text-yellow-600 py-2">Loading serials...</div>
//                   ) : filteredSerials.map(s => (
//                     <label
//                       key={s.id}
//                       className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer text-xs transition-colors
//                         ${selectedSerials.includes(s.serialNumber)
//                           ? 'bg-yellow-200 border border-yellow-400'
//                           : 'hover:bg-yellow-100'
//                         }`}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedSerials.includes(s.serialNumber)}
//                         onChange={(e) => {
//                           if (e.target.checked) setSelectedSerials(p => [...p, s.serialNumber]);
//                           else setSelectedSerials(p => p.filter(x => x !== s.serialNumber));
//                         }}
//                         className="w-3 h-3"
//                         disabled={selectedSerials.length >= parseInt(quantity) && !selectedSerials.includes(s.serialNumber)}
//                       />
//                       <span className="font-mono text-yellow-900">{s.serialNumber}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Used Items List */}
//       {usedItems.length > 0 && (
//         <div className="space-y-1">
//           {usedItems.map((item, i) => (
//             <div
//               key={i}
//               className={`rounded-lg border overflow-hidden
//                 ${item.isSpecialPrice ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
//             >
//               <div className="flex items-center justify-between px-2 py-1.5">
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs font-semibold text-gray-900 truncate">
//                     {item.isSpecialPrice && <span className="text-amber-500 mr-1">⭐</span>}
//                     {item.inventoryItem.name}
//                     {item.inventoryItem.hasSerialization && <span className="ml-1 text-blue-500">🔢</span>}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     {item.quantityUsed} × Rs.{item.unitPrice?.toFixed(2)}
//                     <span className="mx-1 text-gray-300">|</span>
//                     <span className="font-semibold text-gray-700">Rs.{(item.quantityUsed * (item.unitPrice || 0)).toFixed(2)}</span>
//                     {item.isSpecialPrice && <span className="ml-1 text-amber-600 text-xs">(Special)</span>}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => onRemove(i)}
//                   className="ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 transition-colors"
//                 >
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
//                   </svg>
//                 </button>
//               </div>
//               {item.usedSerialNumbers?.length > 0 && (
//                 <div className="flex flex-wrap gap-0.5 px-2 pb-1.5">
//                   {item.usedSerialNumbers.map((sn, si) => (
//                     <span key={si} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono border border-blue-200">
//                       {sn}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//           <div className="flex items-center justify-between bg-blue-600 text-white rounded-lg px-3 py-1.5">
//             <span className="text-xs font-semibold">Parts Total</span>
//             <span className="text-sm font-bold">
//               Rs.{usedItems.reduce((s, i) => s + (i.quantityUsed * (i.unitPrice || 0)), 0).toFixed(2)}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobCardEdit;

import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import CancelOrderModal from './CancelOrderModal';
import { useApi } from '../services/apiService';

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

  // ✅ Get effective service price based on customer type
  const getServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice || 0;
  };

  // ✅ Calculate total using effective prices
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

        // ✅ Load services with effective prices
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

  // ✅ Add service with effective price based on customer type
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

    // ✅ Use special price for regular customers
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
          {/* ✅ Regular customer badge */}
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

            {/* ✅ Services section with special pricing */}
            <div className="border border-green-200 rounded p-2 bg-green-50 flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Services</div>
                {isRegularCustomer && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special Price</span>
                )}
              </div>
              {/* ✅ Show effective price in dropdown */}
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
//  UsedItemsSection — with special pricing support
// ─────────────────────────────────────────────
const UsedItemsSection = ({ items, usedItems, onAdd, onRemove, isRegularCustomer }) => {
  const { apiCall } = useApi();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [serialSearch, setSerialSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const selectedItemData = items.find(i => i.id === parseInt(selectedItem));
  const filteredSerials = availableSerials.filter(s =>
    s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
  );

  // ✅ Get effective price based on customer type
  const getEffectivePrice = (item) => {
    if (isRegularCustomer && item?.specialPrice != null) return item.specialPrice;
    return item?.sellingPrice || 0;
  };

  const isSpecialPriceActive = isRegularCustomer && selectedItemData?.specialPrice != null;

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
      if (selectedItemData?.hasSerialization) {
        setLoadingSerials(true);
        try {
          const s = await apiCall(`/api/inventory/${selectedItemData.id}/serials/available`);
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
  }, [selectedItemData]);

  const handleBarcodeScan = (barcode, triggerAddIfComplete = false) => {
    if (!selectedItemData?.hasSerialization) return;
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
          onAdd(selectedItem, quantity, newSerials);
          setSelectedItem(''); setQuantity(''); setSelectedSerials([]);
          setAvailableSerials([]); setSerialSearch(''); setBarcodeInput('');
        }, 150);
        return;
      }
    }
    setTimeout(() => setBarcodeInput(''), 100);
  };

  const handleAdd = () => {
    if (!selectedItem || !quantity) { alert('Select item and quantity'); return; }
    if (selectedItemData?.hasSerialization && selectedSerials.length !== parseInt(quantity)) {
      alert(`Select exactly ${quantity} serial(s)`); return;
    }
    onAdd(selectedItem, quantity, selectedSerials);
    setSelectedItem(''); setQuantity(''); setSelectedSerials([]);
    setAvailableSerials([]); setSerialSearch(''); setBarcodeInput('');
  };

  const canAdd = selectedItem && quantity && parseInt(quantity) > 0 &&
    (!selectedItemData?.hasSerialization || selectedSerials.length === parseInt(quantity));

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
            {/* ✅ Show effective price in item dropdown */}
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            >
              <option value="">— Choose an item —</option>
              {items.map(i => {
                const price = getEffectivePrice(i);
                const hasSpecial = isRegularCustomer && i.specialPrice != null;
                return (
                  <option key={i.id} value={i.id}>
                    {i.name}{i.hasSerialization ? ' 🔢' : ''} (Qty:{i.quantity}) {hasSpecial ? `⭐Rs.${i.specialPrice?.toFixed(2)}` : `Rs.${i.sellingPrice?.toFixed(2)}`}
                  </option>
                );
              })}
            </select>
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

          {/* ✅ Show price info with special price badge */}
          {selectedItemData && (
            <div className={`rounded px-2 py-1.5 text-xs flex items-center justify-between
              ${isSpecialPriceActive
                ? 'bg-amber-50 border border-amber-300 text-amber-800'
                : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
              {isSpecialPriceActive ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-700">⭐ Special: Rs.{selectedItemData.specialPrice?.toFixed(2)}</span>
                    <span className="text-gray-400 line-through">Rs.{selectedItemData.sellingPrice?.toFixed(2)}</span>
                  </div>
                  <span className="text-amber-600 font-medium">
                    Stock: {selectedItemData.quantity}
                    {selectedItemData.hasSerialization && <span className="ml-1">🔢</span>}
                  </span>
                </>
              ) : (
                <>
                  <span>Unit: <strong>Rs.{selectedItemData.sellingPrice?.toFixed(2)}</strong></span>
                  <span className="text-gray-500">
                    Stock: {selectedItemData.quantity}
                    {selectedItemData.hasSerialization && <span className="ml-1">🔢</span>}
                  </span>
                </>
              )}
            </div>
          )}

          {selectedItemData?.hasSerialization && availableSerials.length > 0 && (
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