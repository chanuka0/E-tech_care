// // // import { useState, useEffect, useRef } from 'react';
// // // import { apiCall, API_ENDPOINTS } from '../services/api';
// // // import { BrowserMultiFormatReader } from '@zxing/browser';

// // // const JobCardCreate = ({ onSuccess, onCancel }) => {
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState('');
// // //   const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
// // //   const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
// // //   const [isScanning, setIsScanning] = useState(false);
  
// // //   const deviceBarcodeVideoRef = useRef(null);
// // //   const otherSerialVideoRef = useRef(null);
// // //   const deviceBarcodeReaderRef = useRef(null);
// // //   const otherSerialReaderRef = useRef(null);
// // //   const scannerInputRef = useRef(null);
  
// // //   const [faults, setFaults] = useState([]);
// // //   const [services, setServices] = useState([]);
// // //   const [brands, setBrands] = useState([]);
// // //   const [allModels, setAllModels] = useState([]);
// // //   const [filteredModels, setFilteredModels] = useState([]);
// // //   const [allModelNumbers, setAllModelNumbers] = useState([]);
// // //   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
// // //   const [processors, setProcessors] = useState([]);
// // //   const [deviceConditions, setDeviceConditions] = useState([]);
// // //   const [dataLoaded, setDataLoaded] = useState(false);
  
// // //   const [regularCustomers, setRegularCustomers] = useState([]);
// // //   const [selectedCustomer, setSelectedCustomer] = useState(null);

// // //   const [formData, setFormData] = useState({
// // //     isRegularCustomer: false,
// // //     customerId: '',
// // //     customerName: '',
// // //     customerPhone: '',
// // //     customerEmail: '',
// // //     deviceType: 'LAPTOP',
// // //     brandId: '',
// // //     modelId: '',
// // //     modelNumberId: '',
// // //     processorId: '',
// // //     deviceConditionIds: [],
// // //     faultDescription: '',
// // //     notes: '',
// // //     advancePayment: 0,
// // //     estimatedCost: 0,
// // //     deviceBarcode: '',
// // //     deviceBarcodes: [],
// // //     otherSerials: [],
// // //     selectedFaults: [],
// // //     selectedServices: [],
// // //     oneDayService: false,
// // //     withCharger: false,
// // //   });

// // //   const [currentOtherSerial, setCurrentOtherSerial] = useState({
// // //     serialType: 'IMEI',
// // //     serialValue: ''
// // //   });

// // //   const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR', 'OTHER'];
// // //   const serialTypes = ['RAM_01', 'RAM_02', 'RAM_03', 'RAM_04', 'HDD_01', 'HDD_02', 'SSD_01', 'SSD_02', 'ADAPTER', 'BATTERY'];

// // //   useEffect(() => {
// // //     const handleKeyDown = (e) => {
// // //       if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
// // //         e.preventDefault();
// // //         e.stopPropagation();
        
// // //         const activeElement = document.activeElement;
// // //         const barcodeFields = ['deviceBarcode', 'serialValue'];
        
// // //         if (activeElement && barcodeFields.includes(activeElement.name)) {
// // //           if (activeElement.name === 'deviceBarcode' && formData.deviceBarcode.trim()) {
// // //             addDeviceBarcode();
// // //           } else if (activeElement.name === 'serialValue' && currentOtherSerial.serialValue.trim()) {
// // //             addOtherSerial();
// // //           }
// // //         }
        
// // //         return false;
// // //       }
// // //     };

// // //     document.addEventListener('keydown', handleKeyDown, true);
    
// // //     return () => {
// // //       document.removeEventListener('keydown', handleKeyDown, true);
// // //     };
// // //   }, [formData.deviceBarcode, currentOtherSerial.serialValue]);

// // //   useEffect(() => {
// // //     let barcodeBuffer = '';
// // //     let lastKeyTime = 0;
// // //     let timer = null;

// // //     const handleBarcodeKeyDown = (e) => {
// // //       if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') {
// // //         return;
// // //       }

// // //       const currentTime = Date.now();
      
// // //       if (currentTime - lastKeyTime > 100) {
// // //         barcodeBuffer = '';
// // //       }
      
// // //       lastKeyTime = currentTime;
      
// // //       if (e.key.length === 1) {
// // //         barcodeBuffer += e.key;
// // //       }

// // //       if (timer) {
// // //         clearTimeout(timer);
// // //       }

// // //       timer = setTimeout(() => {
// // //         if (barcodeBuffer.length >= 3) {
// // //           handleScannedBarcode(barcodeBuffer);
// // //         }
// // //         barcodeBuffer = '';
// // //       }, 50);
// // //     };

// // //     document.addEventListener('keydown', handleBarcodeKeyDown, true);
    
// // //     return () => {
// // //       document.removeEventListener('keydown', handleBarcodeKeyDown, true);
// // //       if (timer) clearTimeout(timer);
// // //     };
// // //   }, []);

// // //   const handleScannedBarcode = (barcode) => {
// // //     setIsScanning(true);
    
// // //     if (barcode.length >= 8 && barcode.length <= 20) {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         deviceBarcode: barcode
// // //       }));
      
// // //       setTimeout(() => {
// // //         addDeviceBarcode();
// // //         setIsScanning(false);
// // //       }, 100);
// // //     }
    
// // //     showScanningMessage(`Scanned: ${barcode}`);
// // //   };

// // //   useEffect(() => {
// // //     let isMounted = true;
    
// // //     const fetchData = async () => {
// // //       if (dataLoaded) return;
      
// // //       try {
// // //         const [
// // //           faultsData, 
// // //           servicesData, 
// // //           brandsData, 
// // //           modelsData, 
// // //           modelNumbersData,
// // //           processorsData, 
// // //           conditionsData,
// // //           customersData
// // //         ] = await Promise.all([
// // //           apiCall('/api/faults'),
// // //           apiCall('/api/service-categories'),
// // //           apiCall('/api/brands'),
// // //           apiCall('/api/models'),
// // //           apiCall('/api/model-numbers'),
// // //           apiCall('/api/processors'),
// // //           apiCall('/api/device-conditions'),
// // //           apiCall('/api/customers/active')
// // //         ]);
        
// // //         if (isMounted) {
// // //           setFaults((faultsData || []).filter(item => item.isActive));
// // //           setServices((servicesData || []).filter(item => item.isActive));
// // //           setBrands((brandsData || []).filter(item => item.isActive));
// // //           setAllModels((modelsData || []).filter(item => item.isActive));
// // //           setAllModelNumbers((modelNumbersData || []).filter(item => item.isActive));
// // //           setProcessors((processorsData || []).filter(item => item.isActive));
// // //           setDeviceConditions((conditionsData || []).filter(item => item.isActive));
// // //           setRegularCustomers(customersData?.customers || []);
// // //           setDataLoaded(true);
// // //         }
// // //       } catch (err) {
// // //         console.error('Error fetching data:', err);
// // //         if (isMounted) {
// // //           setError('Failed to load form data');
// // //         }
// // //       }
// // //     };

// // //     fetchData();

// // //     return () => {
// // //       isMounted = false;
// // //     };
// // //   }, [dataLoaded]);

// // //   useEffect(() => {
// // //     if (formData.brandId) {
// // //       const filtered = allModels.filter(model => 
// // //         model.brand?.id === parseInt(formData.brandId) && model.isActive
// // //       );
// // //       setFilteredModels(filtered);
      
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         modelId: '',
// // //         modelNumberId: ''
// // //       }));
// // //       setFilteredModelNumbers([]);
// // //     } else {
// // //       setFilteredModels([]);
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         modelId: '',
// // //         modelNumberId: ''
// // //       }));
// // //       setFilteredModelNumbers([]);
// // //     }
// // //   }, [formData.brandId, allModels]);

// // //   useEffect(() => {
// // //     if (formData.modelId) {
// // //       const filtered = allModelNumbers.filter(modelNumber => 
// // //         modelNumber.model?.id === parseInt(formData.modelId) && modelNumber.isActive
// // //       );
// // //       setFilteredModelNumbers(filtered);
      
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         modelNumberId: ''
// // //       }));
// // //     } else {
// // //       setFilteredModelNumbers([]);
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         modelNumberId: ''
// // //       }));
// // //     }
// // //   }, [formData.modelId, allModelNumbers]);

// // //   // ✅ FIXED: NO SUMMARY FETCHING
// // //   const handleCustomerSelect = (e) => {
// // //     const customerId = e.target.value;
    
// // //     if (!customerId || customerId === '') {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         isRegularCustomer: false,
// // //         customerId: '',
// // //         customerName: '',
// // //         customerPhone: '',
// // //         customerEmail: ''
// // //       }));
// // //       setSelectedCustomer(null);
// // //       return;
// // //     }

// // //     const customerIdNum = parseInt(customerId, 10);
// // //     const customer = regularCustomers.find(c => {
// // //       const cId = c.customerId || c.id;
// // //       return parseInt(cId, 10) === customerIdNum;
// // //     });

// // //     if (customer) {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         isRegularCustomer: true,
// // //         customerId: customer.customerId || customer.id,
// // //         customerName: customer.customerName,
// // //         customerPhone: customer.phoneNumber,
// // //         customerEmail: customer.email || ''
// // //       }));
// // //       setSelectedCustomer(customer);
// // //       showSuccessMessage(`✅ Customer selected: ${customer.customerName}`);
// // //     } else {
// // //       setError('Selected customer not found');
// // //     }
    
// // //     setError('');
// // //   };

// // //   const handleRegularCustomerToggle = (e) => {
// // //     if (e.target.checked) {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         isRegularCustomer: true
// // //       }));
// // //     } else {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         isRegularCustomer: false,
// // //         customerId: '',
// // //         customerName: '',
// // //         customerPhone: '',
// // //         customerEmail: ''
// // //       }));
// // //       setSelectedCustomer(null);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!showDeviceBarcodeScanner || !deviceBarcodeVideoRef.current) return;

// // //     const codeReader = new BrowserMultiFormatReader();
// // //     deviceBarcodeReaderRef.current = codeReader;

// // //     codeReader.decodeFromVideoDevice(undefined, deviceBarcodeVideoRef.current, (result, error) => {
// // //       if (result) {
// // //         handleDeviceBarcodeScan(result.getText());
// // //       }
// // //       if (error && error.name !== 'NotFoundException') {
// // //         console.error('Device barcode scan error:', error);
// // //       }
// // //     });

// // //     return () => {
// // //       if (deviceBarcodeReaderRef.current) {
// // //         deviceBarcodeReaderRef.current.reset();
// // //         deviceBarcodeReaderRef.current = null;
// // //       }
// // //     };
// // //   }, [showDeviceBarcodeScanner]);

// // //   useEffect(() => {
// // //     if (!showOtherSerialScanner || !otherSerialVideoRef.current) return;

// // //     const codeReader = new BrowserMultiFormatReader();
// // //     otherSerialReaderRef.current = codeReader;

// // //     codeReader.decodeFromVideoDevice(undefined, otherSerialVideoRef.current, (result, error) => {
// // //       if (result) {
// // //         handleOtherSerialScan(result.getText());
// // //       }
// // //       if (error && error.name !== 'NotFoundException') {
// // //         console.error('Other serial scan error:', error);
// // //       }
// // //     });

// // //     return () => {
// // //       if (otherSerialReaderRef.current) {
// // //         otherSerialReaderRef.current.reset();
// // //         otherSerialReaderRef.current = null;
// // //       }
// // //     };
// // //   }, [showOtherSerialScanner, currentOtherSerial.serialType]);

// // //   const handleChange = (e) => {
// // //     const { name, value, type, checked } = e.target;
    
// // //     const updatedFormData = {
// // //       ...formData,
// // //       [name]: type === 'checkbox' ? checked : value
// // //     };
    
// // //     if (name === 'brandId') {
// // //       updatedFormData.modelId = '';
// // //       updatedFormData.modelNumberId = '';
// // //       setFilteredModelNumbers([]);
// // //     }
    
// // //     if (name === 'modelId') {
// // //       updatedFormData.modelNumberId = '';
// // //     }
    
// // //     setFormData(updatedFormData);
// // //     setError('');
// // //   };

// // //   const handleOtherSerialChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setCurrentOtherSerial(prev => ({
// // //       ...prev,
// // //       [name]: value
// // //     }));
// // //   };

// // //   const handleDeviceBarcodeScan = (scannedValue) => {
// // //     setIsScanning(true);
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       deviceBarcode: scannedValue
// // //     }));
// // //     setShowDeviceBarcodeScanner(false);
// // //     showScanningMessage(`Device Barcode Scanned: ${scannedValue}`);
    
// // //     setTimeout(() => {
// // //       if (scannedValue.trim()) {
// // //         addDeviceBarcode();
// // //       }
// // //       setIsScanning(false);
// // //     }, 100);
// // //   };

// // //   const handleOtherSerialScan = (scannedValue) => {
// // //     setIsScanning(true);
// // //     setCurrentOtherSerial(prev => ({
// // //       ...prev,
// // //       serialValue: scannedValue
// // //     }));
// // //     setShowOtherSerialScanner(false);
// // //     showScanningMessage(`${currentOtherSerial.serialType} Scanned: ${scannedValue}`);
    
// // //     setTimeout(() => {
// // //       if (scannedValue.trim()) {
// // //         addOtherSerial();
// // //       }
// // //       setIsScanning(false);
// // //     }, 100);
// // //   };

// // //   const addFault = (faultId) => {
// // //     if (!faultId) {
// // //       setError('Please select a fault');
// // //       return;
// // //     }
    
// // //     if (formData.selectedFaults.includes(parseInt(faultId))) {
// // //       setError('This fault is already selected');
// // //       return;
// // //     }

// // //     setFormData(prev => ({
// // //       ...prev,
// // //       selectedFaults: [...prev.selectedFaults, parseInt(faultId)]
// // //     }));
// // //     setError('');
// // //     showSuccessMessage('Fault added successfully!');
// // //   };

// // //   const removeFault = (faultId) => {
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       selectedFaults: prev.selectedFaults.filter(id => id !== faultId)
// // //     }));
// // //   };

// // //   const addService = (serviceId) => {
// // //     if (!serviceId) {
// // //       setError('Please select a service');
// // //       return;
// // //     }

// // //     const selectedService = services.find(s => s.id === parseInt(serviceId));
    
// // //     if (!selectedService) {
// // //       setError('Selected service not found');
// // //       return;
// // //     }
    
// // //     if (formData.selectedServices.some(s => s.id === parseInt(serviceId))) {
// // //       setError('This service is already selected');
// // //       return;
// // //     }

// // //     setFormData(prev => ({
// // //       ...prev,
// // //       selectedServices: [...prev.selectedServices, selectedService]
// // //     }));
// // //     setError('');
// // //     showSuccessMessage('Service added successfully!');
// // //   };

// // //   const removeService = (serviceId) => {
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
// // //     }));
// // //   };

// // //   const calculateTotalServicePrice = () => {
// // //     return formData.selectedServices.reduce((sum, service) => sum + (service.servicePrice || 0), 0);
// // //   };

// // //   const addDeviceCondition = (conditionId) => {
// // //     if (!conditionId) {
// // //       setError('Please select a device condition');
// // //       return;
// // //     }
    
// // //     if (formData.deviceConditionIds.includes(parseInt(conditionId))) {
// // //       setError('This device condition is already selected');
// // //       return;
// // //     }

// // //     setFormData(prev => ({
// // //       ...prev,
// // //       deviceConditionIds: [...prev.deviceConditionIds, parseInt(conditionId)]
// // //     }));
// // //     setError('');
// // //     showSuccessMessage('Device condition added successfully!');
// // //   };

// // //   const removeDeviceCondition = (conditionId) => {
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       deviceConditionIds: prev.deviceConditionIds.filter(id => id !== conditionId)
// // //     }));
// // //   };

// // //   const addDeviceBarcode = async () => {
// // //     const barcode = formData.deviceBarcode.trim();
// // //     if (!barcode) {
// // //       setError('Please enter or scan a device serial');
// // //       return;
// // //     }

// // //     try {
// // //       const checkResult = await apiCall(`/api/jobcards/check-barcode/${encodeURIComponent(barcode)}`);
// // //       if (checkResult.exists) {
// // //         setError(`Device barcode already exists: ${barcode}`);
// // //         return;
// // //       }
// // //     } catch (err) {
// // //       console.error('Error checking barcode:', err);
// // //     }

// // //     setFormData(prev => ({
// // //       ...prev,
// // //       deviceBarcodes: [...prev.deviceBarcodes, barcode],
// // //       deviceBarcode: ''
// // //     }));
// // //     setError('');
// // //     showSuccessMessage('Device serial added successfully!');
// // //   };

// // //   const removeDeviceBarcode = (index) => {
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       deviceBarcodes: prev.deviceBarcodes.filter((_, i) => i !== index)
// // //     }));
// // //   };

// // //   const addOtherSerial = () => {
// // //     if (currentOtherSerial.serialValue.trim()) {
// // //       setFormData(prev => ({
// // //         ...prev,
// // //         otherSerials: [...prev.otherSerials, { ...currentOtherSerial }]
// // //       }));
// // //       setCurrentOtherSerial({
// // //         serialType: serialTypes.filter(type => !formData.otherSerials.some(serial => serial.serialType === type))[0] || 'IMEI',
// // //         serialValue: ''
// // //       });
// // //       setError('');
// // //       showSuccessMessage('Serial added successfully!');
// // //     } else {
// // //       setError('Please enter or scan a serial value');
// // //     }
// // //   };

// // //   const removeOtherSerial = (index) => {
// // //     setFormData(prev => ({
// // //       ...prev,
// // //       otherSerials: prev.otherSerials.filter((_, i) => i !== index)
// // //     }));
// // //   };

// // //   const getUserIdFromToken = () => {
// // //     try {
// // //       const token = localStorage.getItem('token');
// // //       if (token) {
// // //         const payload = JSON.parse(atob(token.split('.')[1]));
// // //         let userId = payload.userId || payload.id || payload.sub;
// // //         if (typeof userId === 'string') {
// // //           const parsed = parseInt(userId, 10);
// // //           return !isNaN(parsed) ? parsed : 1;
// // //         }
// // //         return userId || 1;
// // //       }
// // //     } catch (error) {
// // //       console.error('Error decoding token:', error);
// // //     }
// // //     return 1;
// // //   };

// // //   const showSuccessMessage = (message) => {
// // //     const existingMessages = document.querySelectorAll('.success-message, .scanning-message');
// // //     existingMessages.forEach(msg => msg.remove());
    
// // //     const msg = document.createElement('div');
// // //     msg.className = 'success-message fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
// // //     msg.textContent = message;
// // //     document.body.appendChild(msg);
// // //     setTimeout(() => {
// // //       if (msg.parentNode) {
// // //         msg.remove();
// // //       }
// // //     }, 3000);
// // //   };

// // //   const showScanningMessage = (message) => {
// // //     const existingMessages = document.querySelectorAll('.scanning-message, .success-message');
// // //     existingMessages.forEach(msg => msg.remove());
    
// // //     const msg = document.createElement('div');
// // //     msg.className = 'scanning-message fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
// // //     msg.textContent = message;
// // //     document.body.appendChild(msg);
// // //     setTimeout(() => {
// // //       if (msg.parentNode) {
// // //         msg.remove();
// // //       }
// // //     }, 2000);
// // //   };

// // //   const getAvailableSerialTypes = () => {
// // //     return serialTypes.filter(type => !formData.otherSerials.some(serial => serial.serialType === type));
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     setError('');

// // //     if (!formData.customerName.trim()) {
// // //       setError('Customer name is required');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (!formData.customerPhone.trim()) {
// // //       setError('Customer phone is required');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (formData.deviceBarcodes.length === 0) {
// // //       setError('At least one device Serial is required');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     try {
// // //       const payload = {
// // //         isRegularCustomer: formData.isRegularCustomer,
// // //         customer: formData.isRegularCustomer && formData.customerId 
// // //           ? { customerId: parseInt(formData.customerId) }
// // //           : null,
        
// // //         customerName: formData.customerName,
// // //         customerPhone: formData.customerPhone,
// // //         customerEmail: formData.customerEmail,
// // //         deviceType: formData.deviceType,
// // //         brand: formData.brandId ? { id: parseInt(formData.brandId) } : null,
// // //         model: formData.modelId ? { id: parseInt(formData.modelId) } : null,
// // //         modelNumber: formData.modelNumberId ? { id: parseInt(formData.modelNumberId) } : null,
// // //         processor: formData.processorId ? { id: parseInt(formData.processorId) } : null,
// // //         deviceConditions: formData.deviceConditionIds.map(id => ({ id })),
// // //         faults: formData.selectedFaults.map(id => ({ id })),
// // //         serviceCategories: formData.selectedServices.map(s => ({ id: s.id })),
// // //         faultDescription: formData.faultDescription,
// // //         notes: formData.notes,
// // //         advancePayment: parseFloat(formData.advancePayment) || 0,
// // //         estimatedCost: parseFloat(formData.estimatedCost) || 0,
// // //         oneDayService: formData.oneDayService,
// // //         withCharger: formData.withCharger,
// // //         createdBy: getUserIdFromToken(),
// // //         serials: [
// // //           ...formData.deviceBarcodes.map(barcode => ({
// // //             serialType: 'DEVICE_SERIAL',
// // //             serialValue: barcode
// // //           })),
// // //           ...formData.otherSerials
// // //         ]
// // //       };

// // //       const response = await apiCall('/api/jobcards', {
// // //         method: 'POST',
// // //         body: JSON.stringify(payload)
// // //       });

// // //       showSuccessMessage(`Job Card ${response.jobNumber} created successfully!`);
// // //       if (onSuccess) onSuccess(response);
// // //     } catch (err) {
// // //       console.error('Error creating job card:', err);
// // //       setError(err.message || 'Failed to create job card');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="max-w-5xl mx-auto p-6">
// // //       <div className="bg-white rounded-lg shadow-lg p-8">
// // //         <div className="flex justify-between items-center mb-6">
// // //           <h2 className="text-2xl font-bold text-gray-900">Create New Job Card</h2>
// // //           {onCancel && (
// // //             <button
// // //               onClick={onCancel}
// // //               className="text-gray-500 hover:text-gray-700"
// // //             >
// // //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// // //               </svg>
// // //             </button>
// // //           )}
// // //         </div>

// // //         {error && (
// // //           <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
// // //             {error}
// // //           </div>
// // //         )}

// // //         <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <div className="flex items-center">
// // //               <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6" />
// // //               </svg>
// // //               <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
// // //             </div>
// // //             <label className="flex items-center cursor-pointer">
// // //               <input
// // //                 type="checkbox"
// // //                 checked={formData.isRegularCustomer}
// // //                 onChange={handleRegularCustomerToggle}
// // //                 className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
// // //               />
// // //               <span className="ml-2 text-sm font-medium text-gray-700">Regular Customer</span>
// // //             </label>
// // //           </div>

// // //           {formData.isRegularCustomer ? (
// // //             <div className="space-y-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Select Customer <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <select
// // //                   value={String(formData.customerId)}
// // //                   onChange={handleCustomerSelect}
// // //                   className="w-full px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base"
// // //                   required
// // //                 >
// // //                   <option value="">-- Select a Regular Customer --</option>
// // //                   {regularCustomers && Array.isArray(regularCustomers) && regularCustomers.map((customer, index) => {
// // //                     const cId = customer.customerId || customer.id;
// // //                     return (
// // //                       <option 
// // //                         key={`${cId}-${index}`} 
// // //                         value={String(cId)}
// // //                       >
// // //                         {customer.customerName} | {customer.phoneNumber}
// // //                       </option>
// // //                     );
// // //                   })}
// // //                 </select>
// // //               </div>

// // //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200">
// // //                 <div>
// // //                   <label className="block text-xs text-gray-600 font-semibold mb-1">Name</label>
// // //                   <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
// // //                     <p className="font-semibold text-gray-900">{formData.customerName || '—'}</p>
// // //                   </div>
// // //                 </div>
                
// // //                 <div>
// // //                   <label className="block text-xs text-gray-600 font-semibold mb-1">Phone</label>
// // //                   <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
// // //                     <p className="font-semibold text-gray-900">{formData.customerPhone || '—'}</p>
// // //                   </div>
// // //                 </div>
                
// // //                 <div>
// // //                   <label className="block text-xs text-gray-600 font-semibold mb-1">Email</label>
// // //                   <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
// // //                     <p className="text-sm text-gray-700">{formData.customerEmail || 'Not available'}</p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Customer Name <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <input
// // //                   type="text"
// // //                   name="customerName"
// // //                   value={formData.customerName}
// // //                   onChange={handleChange}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   required
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Phone Number <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <input
// // //                   type="tel"
// // //                   name="customerPhone"
// // //                   value={formData.customerPhone}
// // //                   onChange={handleChange}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   required
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Email (Optional)
// // //                 </label>
// // //                 <input
// // //                   type="email"
// // //                   name="customerEmail"
// // //                   value={formData.customerEmail}
// // //                   onChange={handleChange}
// // //                   placeholder="example@email.com"
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 />
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>

// // //         <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
// // //           if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
// // //             e.preventDefault();
// // //           }
// // //         }}>
// // //           {/* Device Information */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Device Type <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <select
// // //                   name="deviceType"
// // //                   value={formData.deviceType}
// // //                   onChange={handleChange}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   required
// // //                 >
// // //                   {deviceTypes.map(type => (
// // //                     <option key={type} value={type}>{type}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Brand (Optional)
// // //                 </label>
// // //                 <select
// // //                   name="brandId"
// // //                   value={formData.brandId}
// // //                   onChange={handleChange}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                 >
// // //                   <option value="">Select Brand (Optional)</option>
// // //                   {brands.map(brand => (
// // //                     <option key={brand.id} value={brand.id}>{brand.brandName}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Model (Optional)
// // //                 </label>
// // //                 <select
// // //                   name="modelId"
// // //                   value={formData.modelId}
// // //                   onChange={handleChange}
// // //                   disabled={!formData.brandId}
// // //                   className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// // //                     !formData.brandId ? 'bg-gray-100 cursor-not-allowed' : ''
// // //                   }`}
// // //                 >
// // //                   <option value="">
// // //                     {formData.brandId 
// // //                       ? 'Select Model (Optional)' 
// // //                       : 'Select Brand first'
// // //                     }
// // //                   </option>
// // //                   {filteredModels.map(model => (
// // //                     <option key={model.id} value={model.id}>{model.modelName}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Model Number (Optional)
// // //                 </label>
// // //                 <select
// // //                   name="modelNumberId"
// // //                   value={formData.modelNumberId}
// // //                   onChange={handleChange}
// // //                   disabled={!formData.modelId}
// // //                   className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// // //                     !formData.modelId ? 'bg-gray-100 cursor-not-allowed' : ''
// // //                   }`}
// // //                 >
// // //                   <option value="">
// // //                     {formData.modelId 
// // //                       ? 'Select Model Number (Optional)' 
// // //                       : 'Select Model first'
// // //                     }
// // //                   </option>
// // //                   {filteredModelNumbers.map(modelNumber => (
// // //                     <option key={modelNumber.id} value={modelNumber.id}>
// // //                       {modelNumber.modelNumber}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Processor (Optional)
// // //                 </label>
// // //                 <select
// // //                   name="processorId"
// // //                   value={formData.processorId}
// // //                   onChange={handleChange}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                 >
// // //                   <option value="">Select Processor (Optional)</option>
// // //                   {processors.map(processor => (
// // //                     <option key={processor.id} value={processor.id}>{processor.processorName}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* One Day Service Toggle */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
// // //               </svg>
// // //               Service Priority
// // //             </h3>
            
// // //             <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
// // //               formData.oneDayService 
// // //                 ? 'bg-red-50 border-red-300' 
// // //                 : 'bg-gray-50 border-gray-300'
// // //             }`}>
// // //               <div className="flex items-center justify-between">
// // //                 <div className="flex items-center space-x-3">
// // //                   <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
// // //                     formData.oneDayService 
// // //                       ? 'bg-red-600 text-white' 
// // //                       : 'bg-gray-300 text-gray-600'
// // //                   }`}>
// // //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
// // //                     </svg>
// // //                   </div>
// // //                   <div>
// // //                     <label className="block text-sm font-medium text-gray-900">
// // //                       One Day Service
// // //                     </label>
// // //                     <p className="text-sm text-gray-600">
// // //                       {formData.oneDayService 
// // //                         ? '🚨 This job will be prioritized for same-day completion'
// // //                         : 'Standard service timeline'
// // //                       }
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <label className="relative inline-flex items-center cursor-pointer">
// // //                   <input
// // //                     type="checkbox"
// // //                     name="oneDayService"
// // //                     checked={formData.oneDayService}
// // //                     onChange={handleChange}
// // //                     className="sr-only peer"
// // //                   />
// // //                   <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
// // //                     formData.oneDayService 
// // //                       ? 'bg-red-600 peer-checked:bg-red-600' 
// // //                       : 'bg-gray-300 peer-checked:bg-red-600'
// // //                   }`}></div>
// // //                   <div className={`absolute left-1 top-1 bg-white border rounded-full w-4 h-4 transition-transform duration-300 ${
// // //                     formData.oneDayService ? 'transform translate-x-6' : ''
// // //                   }`}></div>
// // //                 </label>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* With Charger Checkbox */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
// // //               </svg>
// // //               Charger Status
// // //             </h3>
            
// // //             <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
// // //               formData.withCharger 
// // //                 ? 'bg-green-50 border-green-300' 
// // //                 : 'bg-gray-50 border-gray-300'
// // //             }`}>
// // //               <label className="flex items-center space-x-3 cursor-pointer">
// // //                 <input
// // //                   type="checkbox"
// // //                   name="withCharger"
// // //                   checked={formData.withCharger}
// // //                   onChange={handleChange}
// // //                   className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
// // //                 />
// // //                 <div className="flex-1">
// // //                   <span className="text-base font-semibold text-gray-900">
// // //                     Device received with charger
// // //                   </span>
// // //                   <p className="text-sm text-gray-600 mt-1">
// // //                     {formData.withCharger 
// // //                       ? '✓ Charger will be returned with device'
// // //                       : 'Device received without charger'
// // //                     }
// // //                   </p>
// // //                 </div>
// // //                 <div className={`px-3 py-1 rounded-full text-sm font-bold ${
// // //                   formData.withCharger 
// // //                     ? 'bg-green-600 text-white' 
// // //                     : 'bg-gray-300 text-gray-600'
// // //                 }`}>
// // //                   {formData.withCharger ? '✓ YES' : '✗ NO'}
// // //                 </div>
// // //               </label>
// // //             </div>
// // //           </div>

// // //           {/* Device Barcode - PRIMARY */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-2">1</span>
// // //               Device Serial (PRIMARY)
// // //             </h3>
            
// // //             <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
// // //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
// // //                 <div className="md:col-span-2">
// // //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                     Device Barcode <span className="text-red-500">*</span>
// // //                   </label>
// // //                   <input
// // //                     type="text"
// // //                     name="deviceBarcode"
// // //                     value={formData.deviceBarcode}
// // //                     onChange={handleChange}
// // //                     onKeyDown={(e) => {
// // //                       if (e.key === 'Enter') {
// // //                         e.preventDefault();
// // //                         if (formData.deviceBarcode.trim()) {
// // //                           addDeviceBarcode();
// // //                         }
// // //                       }
// // //                     }}
// // //                     placeholder="Enter or scan device barcode"
// // //                     className="w-full px-3 py-2 border-2 border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
// // //                     autoComplete="off"
// // //                   />
// // //                   <p className="text-xs text-blue-600 mt-1">🔹 This is the primary device identifier</p>
// // //                 </div>

// // //                 <div className="flex items-end space-x-2">
// // //                   <button
// // //                     type="button"
// // //                     onClick={addDeviceBarcode}
// // //                     className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
// // //                   >
// // //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
// // //                     </svg>
// // //                     <span className="ml-1">Add</span>
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {formData.deviceBarcodes.length > 0 && (
// // //                 <div className="mt-4">
// // //                   <h4 className="text-sm font-medium text-gray-700 mb-2">Added Device Barcodes:</h4>
// // //                   <div className="space-y-2">
// // //                     {formData.deviceBarcodes.map((barcode, index) => (
// // //                       <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
// // //                         <div className="flex items-center">
// // //                           <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-2">DEVICE_SERIAL</span>
// // //                           <span className="ml-2 text-gray-700 font-semibold">{barcode}</span>
// // //                         </div>
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => removeDeviceBarcode(index)}
// // //                           className="text-red-600 hover:text-red-800"
// // //                         >
// // //                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
// // //                           </svg>
// // //                         </button>
// // //                       </div>
// // //                     ))}
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Other Serials - SECONDARY */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mr-2">2</span>
// // //               Other Serials (IMEI, etc.)
// // //             </h3>
            
// // //             <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
// // //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                     Serial Type
// // //                   </label>
// // //                   <select
// // //                     name="serialType"
// // //                     value={currentOtherSerial.serialType}
// // //                     onChange={handleOtherSerialChange}
// // //                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
// // //                   >
// // //                     <option value="">Select Serial Type</option>
// // //                     {getAvailableSerialTypes().map(type => (
// // //                       <option key={type} value={type}>{type}</option>
// // //                     ))}
// // //                   </select>
// // //                 </div>

// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                     Serial Value
// // //                   </label>
// // //                   <input
// // //                     type="text"
// // //                     name="serialValue"
// // //                     value={currentOtherSerial.serialValue}
// // //                     onChange={handleOtherSerialChange}
// // //                     onKeyDown={(e) => {
// // //                       if (e.key === 'Enter') {
// // //                         e.preventDefault();
// // //                         if (currentOtherSerial.serialValue.trim()) {
// // //                           addOtherSerial();
// // //                         }
// // //                       }
// // //                     }}
// // //                     placeholder="Enter or scan serial"
// // //                     className="w-full px-3 py-2 border-2 border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
// // //                     autoComplete="off"
// // //                   />
// // //                 </div>

// // //                 <div className="flex items-end space-x-2">
// // //                   <button
// // //                     type="button"
// // //                     onClick={addOtherSerial}
// // //                     className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
// // //                   >
// // //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
// // //                     </svg>
// // //                     <span className="ml-1">Add</span>
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {formData.otherSerials.length > 0 && (
// // //                 <div className="mt-4">
// // //                   <h4 className="text-sm font-medium text-gray-700 mb-2">Added Serials:</h4>
// // //                   <div className="space-y-2">
// // //                     {formData.otherSerials.map((serial, index) => (
// // //                       <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-purple-300">
// // //                         <div className="flex items-center">
// // //                           <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded mr-2">{serial.serialType}</span>
// // //                           <span className="ml-2 text-gray-700 font-semibold">{serial.serialValue}</span>
// // //                         </div>
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => removeOtherSerial(index)}
// // //                           className="text-red-600 hover:text-red-800"
// // //                         >
// // //                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
// // //                           </svg>
// // //                         </button>
// // //                       </div>
// // //                     ))}
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* DEVICE CONDITION */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
// // //               </svg>
// // //               Device Condition Assessment
// // //             </h3>
            
// // //             <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
// // //               <div className="mb-4">
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Device Condition</label>
// // //                 <select
// // //                   onChange={(e) => addDeviceCondition(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 >
// // //                   <option value="">-- Select a device condition --</option>
// // //                   {deviceConditions.map(condition => (
// // //                     <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               {formData.deviceConditionIds.length > 0 && (
// // //                 <div>
// // //                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Device Conditions:</h4>
// // //                   <div className="flex flex-wrap gap-2">
// // //                     {formData.deviceConditionIds.map(conditionId => {
// // //                       const condition = deviceConditions.find(c => c.id === conditionId);
// // //                       return (
// // //                         <div key={conditionId} className="flex items-center gap-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
// // //                           <span className="font-medium">{condition?.conditionName}</span>
// // //                           <button
// // //                             type="button"
// // //                             onClick={() => removeDeviceCondition(conditionId)}
// // //                             className="text-yellow-600 hover:text-yellow-900 font-bold"
// // //                           >
// // //                             ✕
// // //                           </button>
// // //                         </div>
// // //                       );
// // //                     })}
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* FAULTS SECTION */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// // //               </svg>
// // //               Select Faults (Optional)
// // //             </h3>
            
// // //             <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
// // //               <div className="mb-4">
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Fault Type</label>
// // //                 <select
// // //                   onChange={(e) => addFault(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 >
// // //                   <option value="">-- Select a fault (Optional) --</option>
// // //                   {faults.map(fault => (
// // //                     <option key={fault.id} value={fault.id}>
// // //                       {fault.faultName}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               {formData.selectedFaults.length > 0 && (
// // //                 <div>
// // //                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Faults:</h4>
// // //                   <div className="flex flex-wrap gap-2">
// // //                     {formData.selectedFaults.map(faultId => {
// // //                       const fault = faults.find(f => f.id === faultId);
// // //                       return (
// // //                         <div key={faultId} className="flex items-center gap-2 bg-red-200 text-red-800 px-3 py-1 rounded-full">
// // //                           <span className="font-medium">{fault?.faultName}</span>
// // //                           <button
// // //                             type="button"
// // //                             onClick={() => removeFault(faultId)}
// // //                             className="text-red-600 hover:text-red-900 font-bold"
// // //                           >
// // //                             ✕
// // //                           </button>
// // //                         </div>
// // //                       );
// // //                     })}
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* SERVICES SECTION */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
// // //               <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
// // //               </svg>
// // //               Select Services (Optional)
// // //             </h3>
            
// // //             <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
// // //               <div className="mb-4">
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
// // //                 <select
// // //                   onChange={(e) => addService(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 >
// // //                   <option value="">-- Select a service (Optional) --</option>
// // //                   {services.map(service => (
// // //                     <option key={service.id} value={service.id}>
// // //                       {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               {formData.selectedServices.length > 0 && (
// // //                 <div>
// // //                   <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services:</h4>
// // //                   <div className="flex flex-wrap gap-2 mb-4">
// // //                     {formData.selectedServices.map(service => (
// // //                       <div key={service.id} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded-full">
// // //                         <span className="font-medium">
// // //                           {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
// // //                         </span>
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => removeService(service.id)}
// // //                           className="text-green-600 hover:text-green-900 font-bold"
// // //                         >
// // //                           ✕
// // //                         </button>
// // //                       </div>
// // //                     ))}
// // //                   </div>

// // //                   <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
// // //                     <div className="flex justify-between items-center">
// // //                       <span className="font-semibold text-gray-900">Total Service Price:</span>
// // //                       <span className="text-2xl font-bold text-green-700">
// // //                         Rs.{calculateTotalServicePrice().toFixed(2)}
// // //                       </span>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Fault Description & Notes */}
// // //           <div className="border-b border-gray-200 pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
// // //             <div className="space-y-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Fault Description (Optional)
// // //                 </label>
// // //                 <textarea
// // //                   name="faultDescription"
// // //                   value={formData.faultDescription}
// // //                   onChange={handleChange}
// // //                   rows="3"
// // //                   placeholder="Detailed description of the fault (optional)..."
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Additional Notes
// // //                 </label>
// // //                 <textarea
// // //                   name="notes"
// // //                   value={formData.notes}
// // //                   onChange={handleChange}
// // //                   rows="3"
// // //                   placeholder="Any additional notes..."
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                 />
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Payment Information */}
// // //           <div className="pb-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Advance Payment
// // //                 </label>
// // //                 <input
// // //                   type="number"
// // //                   name="advancePayment"
// // //                   value={formData.advancePayment}
// // //                   onChange={handleChange}
// // //                   onWheel={(e) => e.target.blur()}
// // //                   min="0"
// // //                   step="0"
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Estimated Cost
// // //                 </label>
// // //                 <input
// // //                   type="number"
// // //                   name="estimatedCost"
// // //                   value={formData.estimatedCost}
// // //                   onChange={handleChange}
// // //                   onWheel={(e) => e.target.blur()}
// // //                   min="0"
// // //                   step="0.01"
// // //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //                   onKeyDown={(e) => {
// // //                     if (e.key === 'Enter') e.preventDefault();
// // //                   }}
// // //                 />
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Form Actions */}
// // //           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
// // //             {onCancel && (
// // //               <button
// // //                 type="button"
// // //                 onClick={onCancel}
// // //                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
// // //               >
// // //                 Cancel
// // //               </button>
// // //             )}
// // //             <button
// // //               type="submit"
// // //               disabled={loading}
// // //               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
// // //             >
// // //               {loading ? 'Creating...' : 'Create Job Card'}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
      
      
// // //     </div>
// // //   );
// // // };

// // // export default JobCardCreate;

// // import { useState, useEffect, useRef } from 'react';
// // import { apiCall, API_ENDPOINTS } from '../services/api';
// // import { BrowserMultiFormatReader } from '@zxing/browser';

// // const JobCardCreate = ({ onSuccess, onCancel }) => {
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
// //   const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
// //   const [isScanning, setIsScanning] = useState(false);
  
// //   const deviceBarcodeVideoRef = useRef(null);
// //   const otherSerialVideoRef = useRef(null);
// //   const deviceBarcodeReaderRef = useRef(null);
// //   const otherSerialReaderRef = useRef(null);
  
// //   const [faults, setFaults] = useState([]);
// //   const [services, setServices] = useState([]);
// //   const [brands, setBrands] = useState([]);
// //   const [allModels, setAllModels] = useState([]);
// //   const [filteredModels, setFilteredModels] = useState([]);
// //   const [allModelNumbers, setAllModelNumbers] = useState([]);
// //   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
// //   const [processors, setProcessors] = useState([]);
// //   const [deviceConditions, setDeviceConditions] = useState([]);
// //   const [dataLoaded, setDataLoaded] = useState(false);
  
// //   const [regularCustomers, setRegularCustomers] = useState([]);
// //   const [selectedCustomer, setSelectedCustomer] = useState(null);

// //   const [formData, setFormData] = useState({
// //     isRegularCustomer: false,
// //     customerId: '',
// //     customerName: '',
// //     customerPhone: '',
// //     customerEmail: '',
// //     deviceType: 'LAPTOP',
// //     brandId: '',
// //     modelId: '',
// //     modelNumberId: '',
// //     processorId: '',
// //     deviceConditionIds: [],
// //     faultDescription: '',
// //     notes: '',
// //     advancePayment: 0,
// //     estimatedCost: 0,
// //     deviceBarcode: '',
// //     deviceBarcodes: [],
// //     otherSerials: [],
// //     selectedFaults: [],
// //     selectedServices: [],
// //     oneDayService: false,
// //     withCharger: false,
// //   });

// //   const [currentOtherSerial, setCurrentOtherSerial] = useState({
// //     serialType: 'IMEI',
// //     serialValue: ''
// //   });

// //   const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR', 'OTHER'];
// //   const serialTypes = ['RAM_01', 'RAM_02', 'RAM_03', 'RAM_04', 'HDD_01', 'HDD_02', 'SSD_01', 'SSD_02', 'ADAPTER', 'BATTERY'];

// //   useEffect(() => {
// //     const handleKeyDown = (e) => {
// //       if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
// //         e.preventDefault();
// //         e.stopPropagation();
// //         const activeElement = document.activeElement;
// //         const barcodeFields = ['deviceBarcode', 'serialValue'];
// //         if (activeElement && barcodeFields.includes(activeElement.name)) {
// //           if (activeElement.name === 'deviceBarcode' && formData.deviceBarcode.trim()) {
// //             addDeviceBarcode();
// //           } else if (activeElement.name === 'serialValue' && currentOtherSerial.serialValue.trim()) {
// //             addOtherSerial();
// //           }
// //         }
// //         return false;
// //       }
// //     };
// //     document.addEventListener('keydown', handleKeyDown, true);
// //     return () => document.removeEventListener('keydown', handleKeyDown, true);
// //   }, [formData.deviceBarcode, currentOtherSerial.serialValue]);

// //   useEffect(() => {
// //     let barcodeBuffer = '';
// //     let lastKeyTime = 0;
// //     let timer = null;
// //     const handleBarcodeKeyDown = (e) => {
// //       if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') return;
// //       const currentTime = Date.now();
// //       if (currentTime - lastKeyTime > 100) barcodeBuffer = '';
// //       lastKeyTime = currentTime;
// //       if (e.key.length === 1) barcodeBuffer += e.key;
// //       if (timer) clearTimeout(timer);
// //       timer = setTimeout(() => {
// //         if (barcodeBuffer.length >= 3) handleScannedBarcode(barcodeBuffer);
// //         barcodeBuffer = '';
// //       }, 50);
// //     };
// //     document.addEventListener('keydown', handleBarcodeKeyDown, true);
// //     return () => {
// //       document.removeEventListener('keydown', handleBarcodeKeyDown, true);
// //       if (timer) clearTimeout(timer);
// //     };
// //   }, []);

// //   const handleScannedBarcode = (barcode) => {
// //     setIsScanning(true);
// //     if (barcode.length >= 8 && barcode.length <= 20) {
// //       setFormData(prev => ({ ...prev, deviceBarcode: barcode }));
// //       setTimeout(() => { addDeviceBarcode(); setIsScanning(false); }, 100);
// //     }
// //     showScanningMessage(`Scanned: ${barcode}`);
// //   };

// //   useEffect(() => {
// //     let isMounted = true;
// //     const fetchData = async () => {
// //       if (dataLoaded) return;
// //       try {
// //         const [faultsData, servicesData, brandsData, modelsData, modelNumbersData, processorsData, conditionsData, customersData] = await Promise.all([
// //           apiCall('/api/faults'),
// //           apiCall('/api/service-categories'),
// //           apiCall('/api/brands'),
// //           apiCall('/api/models'),
// //           apiCall('/api/model-numbers'),
// //           apiCall('/api/processors'),
// //           apiCall('/api/device-conditions'),
// //           apiCall('/api/customers/active')
// //         ]);
// //         if (isMounted) {
// //           setFaults((faultsData || []).filter(item => item.isActive));
// //           setServices((servicesData || []).filter(item => item.isActive));
// //           setBrands((brandsData || []).filter(item => item.isActive));
// //           setAllModels((modelsData || []).filter(item => item.isActive));
// //           setAllModelNumbers((modelNumbersData || []).filter(item => item.isActive));
// //           setProcessors((processorsData || []).filter(item => item.isActive));
// //           setDeviceConditions((conditionsData || []).filter(item => item.isActive));
// //           setRegularCustomers(customersData?.customers || []);
// //           setDataLoaded(true);
// //         }
// //       } catch (err) {
// //         console.error('Error fetching data:', err);
// //         if (isMounted) setError('Failed to load form data');
// //       }
// //     };
// //     fetchData();
// //     return () => { isMounted = false; };
// //   }, [dataLoaded]);

// //   useEffect(() => {
// //     if (formData.brandId) {
// //       const filtered = allModels.filter(model => model.brand?.id === parseInt(formData.brandId) && model.isActive);
// //       setFilteredModels(filtered);
// //       setFormData(prev => ({ ...prev, modelId: '', modelNumberId: '' }));
// //       setFilteredModelNumbers([]);
// //     } else {
// //       setFilteredModels([]);
// //       setFormData(prev => ({ ...prev, modelId: '', modelNumberId: '' }));
// //       setFilteredModelNumbers([]);
// //     }
// //   }, [formData.brandId, allModels]);

// //   useEffect(() => {
// //     if (formData.modelId) {
// //       const filtered = allModelNumbers.filter(mn => mn.model?.id === parseInt(formData.modelId) && mn.isActive);
// //       setFilteredModelNumbers(filtered);
// //       setFormData(prev => ({ ...prev, modelNumberId: '' }));
// //     } else {
// //       setFilteredModelNumbers([]);
// //       setFormData(prev => ({ ...prev, modelNumberId: '' }));
// //     }
// //   }, [formData.modelId, allModelNumbers]);

// //   const handleCustomerSelect = (e) => {
// //     const customerId = e.target.value;
// //     if (!customerId || customerId === '') {
// //       setFormData(prev => ({ ...prev, isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '' }));
// //       setSelectedCustomer(null);
// //       return;
// //     }
// //     const customerIdNum = parseInt(customerId, 10);
// //     const customer = regularCustomers.find(c => parseInt(c.customerId || c.id, 10) === customerIdNum);
// //     if (customer) {
// //       setFormData(prev => ({ ...prev, isRegularCustomer: true, customerId: customer.customerId || customer.id, customerName: customer.customerName, customerPhone: customer.phoneNumber, customerEmail: customer.email || '' }));
// //       setSelectedCustomer(customer);
// //       showSuccessMessage(`✅ Customer selected: ${customer.customerName}`);
// //     } else {
// //       setError('Selected customer not found');
// //     }
// //     setError('');
// //   };

// //   const handleRegularCustomerToggle = (e) => {
// //     if (e.target.checked) {
// //       setFormData(prev => ({ ...prev, isRegularCustomer: true }));
// //     } else {
// //       setFormData(prev => ({ ...prev, isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '' }));
// //       setSelectedCustomer(null);
// //     }
// //   };

// //   useEffect(() => {
// //     if (!showDeviceBarcodeScanner || !deviceBarcodeVideoRef.current) return;
// //     const codeReader = new BrowserMultiFormatReader();
// //     deviceBarcodeReaderRef.current = codeReader;
// //     codeReader.decodeFromVideoDevice(undefined, deviceBarcodeVideoRef.current, (result, error) => {
// //       if (result) handleDeviceBarcodeScan(result.getText());
// //       if (error && error.name !== 'NotFoundException') console.error('Device barcode scan error:', error);
// //     });
// //     return () => { if (deviceBarcodeReaderRef.current) { deviceBarcodeReaderRef.current.reset(); deviceBarcodeReaderRef.current = null; } };
// //   }, [showDeviceBarcodeScanner]);

// //   useEffect(() => {
// //     if (!showOtherSerialScanner || !otherSerialVideoRef.current) return;
// //     const codeReader = new BrowserMultiFormatReader();
// //     otherSerialReaderRef.current = codeReader;
// //     codeReader.decodeFromVideoDevice(undefined, otherSerialVideoRef.current, (result, error) => {
// //       if (result) handleOtherSerialScan(result.getText());
// //       if (error && error.name !== 'NotFoundException') console.error('Other serial scan error:', error);
// //     });
// //     return () => { if (otherSerialReaderRef.current) { otherSerialReaderRef.current.reset(); otherSerialReaderRef.current = null; } };
// //   }, [showOtherSerialScanner, currentOtherSerial.serialType]);

// //   const handleChange = (e) => {
// //     const { name, value, type, checked } = e.target;
// //     const updatedFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
// //     if (name === 'brandId') { updatedFormData.modelId = ''; updatedFormData.modelNumberId = ''; setFilteredModelNumbers([]); }
// //     if (name === 'modelId') updatedFormData.modelNumberId = '';
// //     setFormData(updatedFormData);
// //     setError('');
// //   };

// //   const handleOtherSerialChange = (e) => {
// //     const { name, value } = e.target;
// //     setCurrentOtherSerial(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleDeviceBarcodeScan = (scannedValue) => {
// //     setIsScanning(true);
// //     setFormData(prev => ({ ...prev, deviceBarcode: scannedValue }));
// //     setShowDeviceBarcodeScanner(false);
// //     showScanningMessage(`Device Barcode Scanned: ${scannedValue}`);
// //     setTimeout(() => { if (scannedValue.trim()) addDeviceBarcode(); setIsScanning(false); }, 100);
// //   };

// //   const handleOtherSerialScan = (scannedValue) => {
// //     setIsScanning(true);
// //     setCurrentOtherSerial(prev => ({ ...prev, serialValue: scannedValue }));
// //     setShowOtherSerialScanner(false);
// //     showScanningMessage(`${currentOtherSerial.serialType} Scanned: ${scannedValue}`);
// //     setTimeout(() => { if (scannedValue.trim()) addOtherSerial(); setIsScanning(false); }, 100);
// //   };

// //   const addFault = (faultId) => {
// //     if (!faultId) { setError('Please select a fault'); return; }
// //     if (formData.selectedFaults.includes(parseInt(faultId))) { setError('This fault is already selected'); return; }
// //     setFormData(prev => ({ ...prev, selectedFaults: [...prev.selectedFaults, parseInt(faultId)] }));
// //     setError('');
// //     showSuccessMessage('Fault added!');
// //   };

// //   const removeFault = (faultId) => {
// //     setFormData(prev => ({ ...prev, selectedFaults: prev.selectedFaults.filter(id => id !== faultId) }));
// //   };

// //   const addService = (serviceId) => {
// //     if (!serviceId) { setError('Please select a service'); return; }
// //     const selectedService = services.find(s => s.id === parseInt(serviceId));
// //     if (!selectedService) { setError('Selected service not found'); return; }
// //     if (formData.selectedServices.some(s => s.id === parseInt(serviceId))) { setError('This service is already selected'); return; }
// //     setFormData(prev => ({ ...prev, selectedServices: [...prev.selectedServices, selectedService] }));
// //     setError('');
// //     showSuccessMessage('Service added!');
// //   };

// //   const removeService = (serviceId) => {
// //     setFormData(prev => ({ ...prev, selectedServices: prev.selectedServices.filter(s => s.id !== serviceId) }));
// //   };

// //   const calculateTotalServicePrice = () => formData.selectedServices.reduce((sum, s) => sum + (s.servicePrice || 0), 0);

// //   const addDeviceCondition = (conditionId) => {
// //     if (!conditionId) { setError('Please select a device condition'); return; }
// //     if (formData.deviceConditionIds.includes(parseInt(conditionId))) { setError('Already selected'); return; }
// //     setFormData(prev => ({ ...prev, deviceConditionIds: [...prev.deviceConditionIds, parseInt(conditionId)] }));
// //     setError('');
// //     showSuccessMessage('Condition added!');
// //   };

// //   const removeDeviceCondition = (conditionId) => {
// //     setFormData(prev => ({ ...prev, deviceConditionIds: prev.deviceConditionIds.filter(id => id !== conditionId) }));
// //   };

// //   const addDeviceBarcode = async () => {
// //     const barcode = formData.deviceBarcode.trim();
// //     if (!barcode) { setError('Please enter or scan a device serial'); return; }
// //     try {
// //       const checkResult = await apiCall(`/api/jobcards/check-barcode/${encodeURIComponent(barcode)}`);
// //       if (checkResult.exists) { setError(`Device barcode already exists: ${barcode}`); return; }
// //     } catch (err) { console.error('Error checking barcode:', err); }
// //     setFormData(prev => ({ ...prev, deviceBarcodes: [...prev.deviceBarcodes, barcode], deviceBarcode: '' }));
// //     setError('');
// //     showSuccessMessage('Device serial added!');
// //   };

// //   const removeDeviceBarcode = (index) => {
// //     setFormData(prev => ({ ...prev, deviceBarcodes: prev.deviceBarcodes.filter((_, i) => i !== index) }));
// //   };

// //   const addOtherSerial = () => {
// //     if (currentOtherSerial.serialValue.trim()) {
// //       setFormData(prev => ({ ...prev, otherSerials: [...prev.otherSerials, { ...currentOtherSerial }] }));
// //       setCurrentOtherSerial({ serialType: serialTypes.filter(type => !formData.otherSerials.some(serial => serial.serialType === type))[0] || 'IMEI', serialValue: '' });
// //       setError('');
// //       showSuccessMessage('Serial added!');
// //     } else {
// //       setError('Please enter or scan a serial value');
// //     }
// //   };

// //   const removeOtherSerial = (index) => {
// //     setFormData(prev => ({ ...prev, otherSerials: prev.otherSerials.filter((_, i) => i !== index) }));
// //   };

// //   const getUserIdFromToken = () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       if (token) {
// //         const payload = JSON.parse(atob(token.split('.')[1]));
// //         let userId = payload.userId || payload.id || payload.sub;
// //         if (typeof userId === 'string') { const parsed = parseInt(userId, 10); return !isNaN(parsed) ? parsed : 1; }
// //         return userId || 1;
// //       }
// //     } catch (error) { console.error('Error decoding token:', error); }
// //     return 1;
// //   };

// //   const showSuccessMessage = (message) => {
// //     document.querySelectorAll('.success-message, .scanning-message').forEach(msg => msg.remove());
// //     const msg = document.createElement('div');
// //     msg.className = 'success-message fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
// //     msg.textContent = message;
// //     document.body.appendChild(msg);
// //     setTimeout(() => { if (msg.parentNode) msg.remove(); }, 2000);
// //   };

// //   const showScanningMessage = (message) => {
// //     document.querySelectorAll('.scanning-message, .success-message').forEach(msg => msg.remove());
// //     const msg = document.createElement('div');
// //     msg.className = 'scanning-message fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
// //     msg.textContent = message;
// //     document.body.appendChild(msg);
// //     setTimeout(() => { if (msg.parentNode) msg.remove(); }, 2000);
// //   };

// //   const getAvailableSerialTypes = () => serialTypes.filter(type => !formData.otherSerials.some(serial => serial.serialType === type));

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');
// //     if (!formData.customerName.trim()) { setError('Customer name is required'); setLoading(false); return; }
// //     if (!formData.customerPhone.trim()) { setError('Customer phone is required'); setLoading(false); return; }
// //     if (formData.deviceBarcodes.length === 0) { setError('At least one device Serial is required'); setLoading(false); return; }
// //     try {
// //       const payload = {
// //         isRegularCustomer: formData.isRegularCustomer,
// //         customer: formData.isRegularCustomer && formData.customerId ? { customerId: parseInt(formData.customerId) } : null,
// //         customerName: formData.customerName,
// //         customerPhone: formData.customerPhone,
// //         customerEmail: formData.customerEmail,
// //         deviceType: formData.deviceType,
// //         brand: formData.brandId ? { id: parseInt(formData.brandId) } : null,
// //         model: formData.modelId ? { id: parseInt(formData.modelId) } : null,
// //         modelNumber: formData.modelNumberId ? { id: parseInt(formData.modelNumberId) } : null,
// //         processor: formData.processorId ? { id: parseInt(formData.processorId) } : null,
// //         deviceConditions: formData.deviceConditionIds.map(id => ({ id })),
// //         faults: formData.selectedFaults.map(id => ({ id })),
// //         serviceCategories: formData.selectedServices.map(s => ({ id: s.id })),
// //         faultDescription: formData.faultDescription,
// //         notes: formData.notes,
// //         advancePayment: parseFloat(formData.advancePayment) || 0,
// //         estimatedCost: parseFloat(formData.estimatedCost) || 0,
// //         oneDayService: formData.oneDayService,
// //         withCharger: formData.withCharger,
// //         createdBy: getUserIdFromToken(),
// //         serials: [
// //           ...formData.deviceBarcodes.map(barcode => ({ serialType: 'DEVICE_SERIAL', serialValue: barcode })),
// //           ...formData.otherSerials
// //         ]
// //       };
// //       const response = await apiCall('/api/jobcards', { method: 'POST', body: JSON.stringify(payload) });
// //       showSuccessMessage(`Job Card ${response.jobNumber} created successfully!`);
// //       if (onSuccess) onSuccess(response);
// //     } catch (err) {
// //       console.error('Error creating job card:', err);
// //       setError(err.message || 'Failed to create job card');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const inputCls = "w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
// //   const labelCls = "block text-xs font-medium text-gray-600 mb-0.5";
// //   const sectionCls = "border border-gray-200 rounded p-2";
// //   const sectionTitleCls = "text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

// //   return (
// //     <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
// //       {/* Top bar */}
// //       <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
// //         <h2 className="text-sm font-bold text-gray-900">Create New Job Card</h2>
// //         <div className="flex items-center gap-2">
// //           {error && <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">{error}</span>}
// //           {onCancel && (
// //             <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
// //               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //               </svg>
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') e.preventDefault(); }}>
// //         <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">
          
// //           {/* COLUMN 1: Customer + Device Info */}
// //           <div className="flex flex-col gap-2 overflow-hidden">
// //             {/* Customer */}
// //             <div className={sectionCls}>
// //               <div className="flex items-center justify-between mb-1.5">
// //                 <span className={sectionTitleCls}>Customer</span>
// //                 <label className="flex items-center gap-1 cursor-pointer">
// //                   <input type="checkbox" checked={formData.isRegularCustomer} onChange={handleRegularCustomerToggle} className="w-3 h-3 text-blue-600" />
// //                   <span className="text-xs text-gray-600">Regular</span>
// //                 </label>
// //               </div>
// //               {formData.isRegularCustomer ? (
// //                 <div className="space-y-1">
// //                   <select value={String(formData.customerId)} onChange={handleCustomerSelect} className={inputCls}>
// //                     <option value="">-- Select Customer --</option>
// //                     {regularCustomers.map((customer, index) => {
// //                       const cId = customer.customerId || customer.id;
// //                       return <option key={`${cId}-${index}`} value={String(cId)}>{customer.customerName} | {customer.phoneNumber}</option>;
// //                     })}
// //                   </select>
// //                   <div className="grid grid-cols-1 gap-0.5 text-xs bg-gray-50 rounded p-1">
// //                     <span className="text-gray-800 font-medium">{formData.customerName || '—'}</span>
// //                     <span className="text-gray-600">{formData.customerPhone || '—'}</span>
// //                     <span className="text-gray-500 truncate">{formData.customerEmail || 'No email'}</span>
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <div className="space-y-1">
// //                   <div>
// //                     <label className={labelCls}>Name <span className="text-red-500">*</span></label>
// //                     <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inputCls} required onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
// //                   </div>
// //                   <div>
// //                     <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
// //                     <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputCls} required onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
// //                   </div>
// //                   <div>
// //                     <label className={labelCls}>Email</label>
// //                     <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Optional" className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             {/* Device Info */}
// //             <div className={sectionCls}>
// //               <div className={sectionTitleCls}>Device Info</div>
// //               <div className="space-y-1">
// //                 <div>
// //                   <label className={labelCls}>Type <span className="text-red-500">*</span></label>
// //                   <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={inputCls} required>
// //                     {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className={labelCls}>Brand</label>
// //                   <select name="brandId" value={formData.brandId} onChange={handleChange} className={inputCls}>
// //                     <option value="">Select Brand</option>
// //                     {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.brandName}</option>)}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className={labelCls}>Model</label>
// //                   <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inputCls} ${!formData.brandId ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
// //                     <option value="">{formData.brandId ? 'Select Model' : 'Select Brand first'}</option>
// //                     {filteredModels.map(model => <option key={model.id} value={model.id}>{model.modelName}</option>)}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className={labelCls}>Model No.</label>
// //                   <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inputCls} ${!formData.modelId ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
// //                     <option value="">{formData.modelId ? 'Select Model No.' : 'Select Model first'}</option>
// //                     {filteredModelNumbers.map(mn => <option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className={labelCls}>Processor</label>
// //                   <select name="processorId" value={formData.processorId} onChange={handleChange} className={inputCls}>
// //                     <option value="">Select Processor</option>
// //                     {processors.map(p => <option key={p.id} value={p.id}>{p.processorName}</option>)}
// //                   </select>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Flags */}
// //             <div className={sectionCls}>
// //               <div className={sectionTitleCls}>Flags</div>
// //               <div className="space-y-1.5">
// //                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.oneDayService ? 'bg-red-50 border-red-300' : 'border-gray-200'}`}>
// //                   <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="w-3 h-3 text-red-600" />
// //                   <span className="text-xs font-medium text-gray-800">🚨 One Day Service</span>
// //                 </label>
// //                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.withCharger ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}>
// //                   <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="w-3 h-3 text-green-600" />
// //                   <span className="text-xs font-medium text-gray-800">🔌 With Charger</span>
// //                 </label>
// //               </div>
// //             </div>
// //           </div>

// //           {/* COLUMN 2: Serials + Conditions */}
// //           <div className="flex flex-col gap-2 overflow-hidden">
// //             {/* Device Serial (PRIMARY) */}
// //             <div className={`${sectionCls} bg-blue-50 border-blue-200`}>
// //               <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Device Serial (PRIMARY) <span className="text-red-500">*</span></div>
// //               <div className="flex gap-1 mb-1">
// //                 <input
// //                   type="text"
// //                   name="deviceBarcode"
// //                   value={formData.deviceBarcode}
// //                   onChange={handleChange}
// //                   onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (formData.deviceBarcode.trim()) addDeviceBarcode(); } }}
// //                   placeholder="Enter or scan serial"
// //                   className="flex-1 px-2 py-1 border-2 border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
// //                   autoComplete="off"
// //                 />
// //                 <button type="button" onClick={addDeviceBarcode} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium">Add</button>
// //               </div>
// //               <div className="space-y-1 max-h-28 overflow-y-auto">
// //                 {formData.deviceBarcodes.map((barcode, index) => (
// //                   <div key={index} className="flex items-center justify-between bg-white p-1.5 rounded border border-blue-300">
// //                     <span className="text-xs font-mono text-gray-700 truncate flex-1">{barcode}</span>
// //                     <button type="button" onClick={() => removeDeviceBarcode(index)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0">
// //                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
// //                     </button>
// //                   </div>
// //                 ))}
// //                 {formData.deviceBarcodes.length === 0 && <p className="text-xs text-blue-400 italic">No serials added yet</p>}
// //               </div>
// //             </div>

// //             {/* Other Serials */}
// //             <div className={`${sectionCls} bg-purple-50 border-purple-200`}>
// //               <div className="text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Other Serials</div>
// //               <div className="flex gap-1 mb-1">
// //                 <select name="serialType" value={currentOtherSerial.serialType} onChange={handleOtherSerialChange} className="w-24 px-1 py-1 border border-purple-300 rounded text-xs focus:outline-none">
// //                   <option value="">Type</option>
// //                   {getAvailableSerialTypes().map(type => <option key={type} value={type}>{type}</option>)}
// //                 </select>
// //                 <input
// //                   type="text"
// //                   name="serialValue"
// //                   value={currentOtherSerial.serialValue}
// //                   onChange={handleOtherSerialChange}
// //                   onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (currentOtherSerial.serialValue.trim()) addOtherSerial(); } }}
// //                   placeholder="Serial value"
// //                   className="flex-1 px-2 py-1 border-2 border-purple-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
// //                   autoComplete="off"
// //                 />
// //                 <button type="button" onClick={addOtherSerial} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium">Add</button>
// //               </div>
// //               <div className="space-y-1 max-h-24 overflow-y-auto">
// //                 {formData.otherSerials.map((serial, index) => (
// //                   <div key={index} className="flex items-center justify-between bg-white p-1.5 rounded border border-purple-300">
// //                     <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded mr-1.5">{serial.serialType}</span>
// //                     <span className="text-xs font-mono text-gray-700 truncate flex-1">{serial.serialValue}</span>
// //                     <button type="button" onClick={() => removeOtherSerial(index)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0">
// //                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
// //                     </button>
// //                   </div>
// //                 ))}
// //                 {formData.otherSerials.length === 0 && <p className="text-xs text-purple-400 italic">No other serials added</p>}
// //               </div>
// //             </div>

// //             {/* Device Conditions */}
// //             <div className={`${sectionCls} bg-yellow-50 border-yellow-200 flex-1`}>
// //               <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
// //               <select onChange={(e) => addDeviceCondition(e.target.value)} className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
// //                 <option value="">-- Select condition --</option>
// //                 {deviceConditions.map(c => <option key={c.id} value={c.id}>{c.conditionName}</option>)}
// //               </select>
// //               <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
// //                 {formData.deviceConditionIds.map(conditionId => {
// //                   const condition = deviceConditions.find(c => c.id === conditionId);
// //                   return (
// //                     <span key={conditionId} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">
// //                       {condition?.conditionName}
// //                       <button type="button" onClick={() => removeDeviceCondition(conditionId)} className="text-yellow-600 hover:text-yellow-900 font-bold">✕</button>
// //                     </span>
// //                   );
// //                 })}
// //                 {formData.deviceConditionIds.length === 0 && <p className="text-xs text-yellow-500 italic">None selected</p>}
// //               </div>
// //             </div>
// //           </div>

// //           {/* COLUMN 3: Faults + Services + Descriptions */}
// //           <div className="flex flex-col gap-2 overflow-hidden">
// //             {/* Faults */}
// //             <div className={`${sectionCls} bg-red-50 border-red-200`}>
// //               <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults (Optional)</div>
// //               <select onChange={(e) => addFault(e.target.value)} className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
// //                 <option value="">-- Select fault --</option>
// //                 {faults.map(fault => <option key={fault.id} value={fault.id}>{fault.faultName}</option>)}
// //               </select>
// //               <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
// //                 {formData.selectedFaults.map(faultId => {
// //                   const fault = faults.find(f => f.id === faultId);
// //                   return (
// //                     <span key={faultId} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
// //                       {fault?.faultName}
// //                       <button type="button" onClick={() => removeFault(faultId)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
// //                     </span>
// //                   );
// //                 })}
// //                 {formData.selectedFaults.length === 0 && <p className="text-xs text-red-400 italic">None selected</p>}
// //               </div>
// //             </div>

// //             {/* Services */}
// //             <div className={`${sectionCls} bg-green-50 border-green-200`}>
// //               <div className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Services (Optional)</div>
// //               <select onChange={(e) => addService(e.target.value)} className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
// //                 <option value="">-- Select service --</option>
// //                 {services.map(service => <option key={service.id} value={service.id}>{service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}</option>)}
// //               </select>
// //               <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
// //                 {formData.selectedServices.map(service => (
// //                   <span key={service.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
// //                     {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
// //                     <button type="button" onClick={() => removeService(service.id)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
// //                   </span>
// //                 ))}
// //                 {formData.selectedServices.length === 0 && <p className="text-xs text-green-500 italic">None selected</p>}
// //               </div>
// //               {formData.selectedServices.length > 0 && (
// //                 <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
// //                   <span className="text-xs font-semibold text-gray-700">Total:</span>
// //                   <span className="text-sm font-bold text-green-700">Rs.{calculateTotalServicePrice().toFixed(2)}</span>
// //                 </div>
// //               )}
// //             </div>

// //             {/* Fault Description */}
// //             <div className={sectionCls}>
// //               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
// //               <textarea
// //                 name="faultDescription"
// //                 value={formData.faultDescription}
// //                 onChange={handleChange}
// //                 rows="3"
// //                 placeholder="Detailed fault description (optional)..."
// //                 className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
// //               />
// //             </div>

// //             {/* Notes */}
// //             <div className={`${sectionCls} flex-1`}>
// //               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
// //               <textarea
// //                 name="notes"
// //                 value={formData.notes}
// //                 onChange={handleChange}
// //                 rows="3"
// //                 placeholder="Any additional notes..."
// //                 className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
// //               />
// //             </div>
// //           </div>

// //           {/* COLUMN 4: Payment + Submit */}
// //           <div className="flex flex-col gap-2 overflow-hidden">
// //             {/* Payment */}
// //             <div className={sectionCls}>
// //               <div className={sectionTitleCls}>Payment Info</div>
// //               <div className="space-y-1.5">
// //                 <div>
// //                   <label className={labelCls}>Advance Payment (Rs.)</label>
// //                   <input
// //                     type="number"
// //                     name="advancePayment"
// //                     value={formData.advancePayment}
// //                     onChange={handleChange}
// //                     onWheel={(e) => e.target.blur()}
// //                     min="0"
// //                     step="0"
// //                     className={inputCls}
// //                     onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className={labelCls}>Estimated Cost (Rs.)</label>
// //                   <input
// //                     type="number"
// //                     name="estimatedCost"
// //                     value={formData.estimatedCost}
// //                     onChange={handleChange}
// //                     onWheel={(e) => e.target.blur()}
// //                     min="0"
// //                     step="0.01"
// //                     className={inputCls}
// //                     onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Summary */}
// //             <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
// //               <div className={sectionTitleCls}>Summary</div>
// //               <div className="space-y-1 text-xs">
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Customer:</span>
// //                   <span className="font-medium text-gray-800 truncate ml-1">{formData.customerName || '—'}</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Phone:</span>
// //                   <span className="font-medium text-gray-800">{formData.customerPhone || '—'}</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Device:</span>
// //                   <span className="font-medium text-gray-800">{formData.deviceType}</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Serials:</span>
// //                   <span className={`font-medium ${formData.deviceBarcodes.length > 0 ? 'text-green-600' : 'text-red-500'}`}>{formData.deviceBarcodes.length} added</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Faults:</span>
// //                   <span className="font-medium text-gray-800">{formData.selectedFaults.length} selected</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Services:</span>
// //                   <span className="font-medium text-gray-800">{formData.selectedServices.length} selected</span>
// //                 </div>
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">Conditions:</span>
// //                   <span className="font-medium text-gray-800">{formData.deviceConditionIds.length} selected</span>
// //                 </div>
// //                 {formData.oneDayService && (
// //                   <div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>
// //                 )}
// //                 {formData.withCharger && (
// //                   <div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>
// //                 )}
// //                 {formData.selectedServices.length > 0 && (
// //                   <div className="border-t border-gray-200 pt-1 flex justify-between">
// //                     <span className="text-gray-500">Service Total:</span>
// //                     <span className="font-bold text-green-700">Rs.{calculateTotalServicePrice().toFixed(2)}</span>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Validation Checklist */}
// //             <div className="border border-gray-200 rounded p-2 bg-white">
// //               <div className={sectionTitleCls}>Checklist</div>
// //               <div className="space-y-0.5 text-xs">
// //                 {[
// //                   { label: 'Customer name', ok: !!formData.customerName.trim() },
// //                   { label: 'Phone number', ok: !!formData.customerPhone.trim() },
// //                   { label: 'Device serial', ok: formData.deviceBarcodes.length > 0 },
// //                 ].map((item, i) => (
// //                   <div key={i} className="flex items-center gap-1.5">
// //                     <span className={item.ok ? 'text-green-500' : 'text-red-400'}>
// //                       {item.ok ? '✓' : '○'}
// //                     </span>
// //                     <span className={item.ok ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Action Buttons */}
// //             <div className="flex flex-col gap-2">
// //               <button
// //                 type="submit"
// //                 disabled={loading}
// //                 className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors"
// //               >
// //                 {loading ? 'Creating...' : '✓ Create Job Card'}
// //               </button>
// //               {onCancel && (
// //                 <button
// //                   type="button"
// //                   onClick={onCancel}
// //                   className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
// //                 >
// //                   Cancel
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default JobCardCreate;


// import { useState, useEffect, useRef } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';
// import { BrowserMultiFormatReader } from '@zxing/browser';

// const JobCardCreate = ({ onSuccess, onCancel }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
//   const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const deviceBarcodeVideoRef = useRef(null);
//   const otherSerialVideoRef = useRef(null);
//   const deviceBarcodeReaderRef = useRef(null);
//   const otherSerialReaderRef = useRef(null);
//   const [faults, setFaults] = useState([]);
//   const [services, setServices] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [allModels, setAllModels] = useState([]);
//   const [filteredModels, setFilteredModels] = useState([]);
//   const [allModelNumbers, setAllModelNumbers] = useState([]);
//   const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
//   const [dataLoaded, setDataLoaded] = useState(false);
//   const [regularCustomers, setRegularCustomers] = useState([]);
//   const [formData, setFormData] = useState({
//     isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
//     deviceType: 'LAPTOP', brandId: '', modelId: '', modelNumberId: '', processorId: '',
//     deviceConditionIds: [], faultDescription: '', notes: '', advancePayment: 0, estimatedCost: 0,
//     deviceBarcode: '', deviceBarcodes: [], otherSerials: [], selectedFaults: [], selectedServices: [],
//     oneDayService: false, withCharger: false,
//   });
//   const [currentOtherSerial, setCurrentOtherSerial] = useState({ serialType: 'IMEI', serialValue: '' });

//   const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR', 'OTHER'];
//   const serialTypes = ['RAM_01','RAM_02','RAM_03','RAM_04','HDD_01','HDD_02','SSD_01','SSD_02','ADAPTER','BATTERY'];
//   const noProcessorTypes = ['PRINTER', 'PROJECTOR'];
//   const hasProcessor = !noProcessorTypes.includes(formData.deviceType);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
//         e.preventDefault(); e.stopPropagation();
//         const el = document.activeElement;
//         if (el?.name === 'deviceBarcode' && formData.deviceBarcode.trim()) addDeviceBarcode();
//         else if (el?.name === 'serialValue' && currentOtherSerial.serialValue.trim()) addOtherSerial();
//         return false;
//       }
//     };
//     document.addEventListener('keydown', handleKeyDown, true);
//     return () => document.removeEventListener('keydown', handleKeyDown, true);
//   }, [formData.deviceBarcode, currentOtherSerial.serialValue]);

//   useEffect(() => {
//     let barcodeBuffer = ''; let lastKeyTime = 0; let timer = null;
//     const handleBarcodeKeyDown = (e) => {
//       if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') return;
//       const now = Date.now();
//       if (now - lastKeyTime > 100) barcodeBuffer = '';
//       lastKeyTime = now;
//       if (e.key.length === 1) barcodeBuffer += e.key;
//       if (timer) clearTimeout(timer);
//       timer = setTimeout(() => { if (barcodeBuffer.length >= 3) handleScannedBarcode(barcodeBuffer); barcodeBuffer = ''; }, 50);
//     };
//     document.addEventListener('keydown', handleBarcodeKeyDown, true);
//     return () => { document.removeEventListener('keydown', handleBarcodeKeyDown, true); if (timer) clearTimeout(timer); };
//   }, []);

//   const handleScannedBarcode = (barcode) => {
//     setIsScanning(true);
//     if (barcode.length >= 8 && barcode.length <= 20) {
//       setFormData(prev => ({ ...prev, deviceBarcode: barcode }));
//       setTimeout(() => { addDeviceBarcode(); setIsScanning(false); }, 100);
//     }
//     showScanningMessage(`Scanned: ${barcode}`);
//   };

//   useEffect(() => {
//     let isMounted = true;
//     const fetchData = async () => {
//       if (dataLoaded) return;
//       try {
//         const [faultsData, servicesData, brandsData, modelsData, modelNumbersData, processorsData, conditionsData, customersData] = await Promise.all([
//           apiCall('/api/faults'), apiCall('/api/service-categories'), apiCall('/api/brands'),
//           apiCall('/api/models'), apiCall('/api/model-numbers'), apiCall('/api/processors'),
//           apiCall('/api/device-conditions'), apiCall('/api/customers/active')
//         ]);
//         if (isMounted) {
//           setFaults((faultsData||[]).filter(i=>i.isActive)); setServices((servicesData||[]).filter(i=>i.isActive));
//           setBrands((brandsData||[]).filter(i=>i.isActive)); setAllModels((modelsData||[]).filter(i=>i.isActive));
//           setAllModelNumbers((modelNumbersData||[]).filter(i=>i.isActive)); setProcessors((processorsData||[]).filter(i=>i.isActive));
//           setDeviceConditions((conditionsData||[]).filter(i=>i.isActive)); setRegularCustomers(customersData?.customers||[]);
//           setDataLoaded(true);
//         }
//       } catch (err) { console.error(err); if (isMounted) setError('Failed to load form data'); }
//     };
//     fetchData();
//     return () => { isMounted = false; };
//   }, [dataLoaded]);

//   useEffect(() => {
//     if (formData.brandId) {
//       setFilteredModels(allModels.filter(m=>m.brand?.id===parseInt(formData.brandId)&&m.isActive));
//       setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]);
//     } else { setFilteredModels([]); setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]); }
//   }, [formData.brandId, allModels]);

//   useEffect(() => {
//     if (formData.modelId) {
//       setFilteredModelNumbers(allModelNumbers.filter(mn=>mn.model?.id===parseInt(formData.modelId)&&mn.isActive));
//       setFormData(prev=>({...prev,modelNumberId:''}));
//     } else { setFilteredModelNumbers([]); setFormData(prev=>({...prev,modelNumberId:''})); }
//   }, [formData.modelId, allModelNumbers]);

//   const handleCustomerSelect = (e) => {
//     const customerId = e.target.value;
//     if (!customerId) { setFormData(prev=>({...prev,isRegularCustomer:false,customerId:'',customerName:'',customerPhone:'',customerEmail:''})); return; }
//     const customer = regularCustomers.find(c=>parseInt(c.customerId||c.id,10)===parseInt(customerId,10));
//     if (customer) {
//       setFormData(prev=>({...prev,isRegularCustomer:true,customerId:customer.customerId||customer.id,customerName:customer.customerName,customerPhone:customer.phoneNumber,customerEmail:customer.email||''}));
//       showSuccessMessage(`✅ ${customer.customerName} selected`);
//     }
//     setError('');
//   };

//   const handleRegularCustomerToggle = (e) => {
//     if (e.target.checked) { setFormData(prev=>({...prev,isRegularCustomer:true})); }
//     else { setFormData(prev=>({...prev,isRegularCustomer:false,customerId:'',customerName:'',customerPhone:'',customerEmail:''})); }
//   };

//   useEffect(() => {
//     if (!showDeviceBarcodeScanner||!deviceBarcodeVideoRef.current) return;
//     const r = new BrowserMultiFormatReader(); deviceBarcodeReaderRef.current = r;
//     r.decodeFromVideoDevice(undefined,deviceBarcodeVideoRef.current,(result)=>{ if(result) handleDeviceBarcodeScan(result.getText()); });
//     return () => { if(deviceBarcodeReaderRef.current){deviceBarcodeReaderRef.current.reset();deviceBarcodeReaderRef.current=null;} };
//   }, [showDeviceBarcodeScanner]);

//   useEffect(() => {
//     if (!showOtherSerialScanner||!otherSerialVideoRef.current) return;
//     const r = new BrowserMultiFormatReader(); otherSerialReaderRef.current = r;
//     r.decodeFromVideoDevice(undefined,otherSerialVideoRef.current,(result)=>{ if(result) handleOtherSerialScan(result.getText()); });
//     return () => { if(otherSerialReaderRef.current){otherSerialReaderRef.current.reset();otherSerialReaderRef.current=null;} };
//   }, [showOtherSerialScanner]);

//   const handleChange = (e) => {
//     const {name,value,type,checked} = e.target;
//     const updated = {...formData,[name]:type==='checkbox'?checked:value};
//     if(name==='brandId'){updated.modelId='';updated.modelNumberId='';setFilteredModelNumbers([]);}
//     if(name==='modelId') updated.modelNumberId='';
//     if(name==='deviceType'&&noProcessorTypes.includes(value)) updated.processorId='';
//     setFormData(updated); setError('');
//   };

//   const handleOtherSerialChange=(e)=>{ const{name,value}=e.target; setCurrentOtherSerial(prev=>({...prev,[name]:value})); };
//   const handleDeviceBarcodeScan=(v)=>{ setIsScanning(true); setFormData(prev=>({...prev,deviceBarcode:v})); setShowDeviceBarcodeScanner(false); showScanningMessage(`Scanned: ${v}`); setTimeout(()=>{if(v.trim())addDeviceBarcode();setIsScanning(false);},100); };
//   const handleOtherSerialScan=(v)=>{ setIsScanning(true); setCurrentOtherSerial(prev=>({...prev,serialValue:v})); setShowOtherSerialScanner(false); showScanningMessage(`${currentOtherSerial.serialType} Scanned: ${v}`); setTimeout(()=>{if(v.trim())addOtherSerial();setIsScanning(false);},100); };

//   const addFault=(id)=>{ if(!id)return; if(formData.selectedFaults.includes(parseInt(id))){setError('Fault already selected');return;} setFormData(prev=>({...prev,selectedFaults:[...prev.selectedFaults,parseInt(id)]})); setError(''); showSuccessMessage('Fault added!'); };
//   const removeFault=(id)=>setFormData(prev=>({...prev,selectedFaults:prev.selectedFaults.filter(f=>f!==id)}));
//   const addService=(id)=>{ if(!id)return; const svc=services.find(s=>s.id===parseInt(id)); if(!svc)return; if(formData.selectedServices.some(s=>s.id===parseInt(id))){setError('Service already selected');return;} setFormData(prev=>({...prev,selectedServices:[...prev.selectedServices,svc]})); setError(''); showSuccessMessage('Service added!'); };
//   const removeService=(id)=>setFormData(prev=>({...prev,selectedServices:prev.selectedServices.filter(s=>s.id!==id)}));
//   const calcTotal=()=>formData.selectedServices.reduce((sum,s)=>sum+(s.servicePrice||0),0);
//   const addDeviceCondition=(id)=>{ if(!id)return; if(formData.deviceConditionIds.includes(parseInt(id))){setError('Condition already selected');return;} setFormData(prev=>({...prev,deviceConditionIds:[...prev.deviceConditionIds,parseInt(id)]})); setError(''); showSuccessMessage('Condition added!'); };
//   const removeDeviceCondition=(id)=>setFormData(prev=>({...prev,deviceConditionIds:prev.deviceConditionIds.filter(c=>c!==id)}));
//   const addDeviceBarcode=async()=>{ const b=formData.deviceBarcode.trim(); if(!b){setError('Please enter or scan a device serial');return;} try{const r=await apiCall(`/api/jobcards/check-barcode/${encodeURIComponent(b)}`);if(r.exists){setError(`Barcode already exists: ${b}`);return;}}catch(e){console.error(e);} setFormData(prev=>({...prev,deviceBarcodes:[...prev.deviceBarcodes,b],deviceBarcode:''})); setError(''); showSuccessMessage('Serial added!'); };
//   const removeDeviceBarcode=(i)=>setFormData(prev=>({...prev,deviceBarcodes:prev.deviceBarcodes.filter((_,idx)=>idx!==i)}));
//   const addOtherSerial=()=>{ if(!currentOtherSerial.serialValue.trim()){setError('Please enter a serial value');return;} setFormData(prev=>({...prev,otherSerials:[...prev.otherSerials,{...currentOtherSerial}]})); setCurrentOtherSerial({serialType:serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t))[0]||'IMEI',serialValue:''}); setError(''); showSuccessMessage('Serial added!'); };
//   const removeOtherSerial=(i)=>setFormData(prev=>({...prev,otherSerials:prev.otherSerials.filter((_,idx)=>idx!==i)}));
//   const getAvailableSerialTypes=()=>serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t));

//   const getUserIdFromToken=()=>{ try{const token=localStorage.getItem('token');if(token){const p=JSON.parse(atob(token.split('.')[1]));let uid=p.userId||p.id||p.sub;if(typeof uid==='string'){const n=parseInt(uid,10);return!isNaN(n)?n:1;}return uid||1;}}catch(e){console.error(e);}return 1; };
//   const showSuccessMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };
//   const showScanningMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };

//   const handleSubmit=async(e)=>{ e.preventDefault(); setLoading(true); setError('');
//     if(!formData.customerName.trim()){setError('Customer name is required');setLoading(false);return;}
//     if(!formData.customerPhone.trim()){setError('Customer phone is required');setLoading(false);return;}
//     if(formData.deviceBarcodes.length===0){setError('At least one device serial is required');setLoading(false);return;}
//     try{
//       const payload={
//         isRegularCustomer:formData.isRegularCustomer,
//         customer:formData.isRegularCustomer&&formData.customerId?{customerId:parseInt(formData.customerId)}:null,
//         customerName:formData.customerName, customerPhone:formData.customerPhone, customerEmail:formData.customerEmail,
//         deviceType:formData.deviceType,
//         brand:formData.brandId?{id:parseInt(formData.brandId)}:null,
//         model:formData.modelId?{id:parseInt(formData.modelId)}:null,
//         modelNumber:formData.modelNumberId?{id:parseInt(formData.modelNumberId)}:null,
//         processor:hasProcessor&&formData.processorId?{id:parseInt(formData.processorId)}:null,
//         deviceConditions:formData.deviceConditionIds.map(id=>({id})),
//         faults:formData.selectedFaults.map(id=>({id})),
//         serviceCategories:formData.selectedServices.map(s=>({id:s.id})),
//         faultDescription:formData.faultDescription, notes:formData.notes,
//         advancePayment:parseFloat(formData.advancePayment)||0, estimatedCost:parseFloat(formData.estimatedCost)||0,
//         oneDayService:formData.oneDayService, withCharger:formData.withCharger,
//         createdBy:getUserIdFromToken(),
//         serials:[...formData.deviceBarcodes.map(b=>({serialType:'DEVICE_SERIAL',serialValue:b})),...formData.otherSerials]
//       };
//       const response=await apiCall('/api/jobcards',{method:'POST',body:JSON.stringify(payload)});
//       showSuccessMessage(`Job Card ${response.jobNumber} created!`);
//       if(onSuccess) onSuccess(response);
//     }catch(err){console.error(err);setError(err.message||'Failed to create job card');}
//     finally{setLoading(false);}
//   };

//   const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
//   const lbl="block text-xs font-medium text-gray-600 mb-0.5";
//   const ttl="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

//   return (
//     <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
//       <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
//         <h2 className="text-sm font-bold text-gray-900">Create New Job Card</h2>
//         <div className="flex items-center gap-2">
//           {error && <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">{error}</span>}
//           {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>}
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea')e.preventDefault();}}>
//         <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

//           {/* COL 1: Customer + Device + Flags */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className={ttl}>Customer</span>
//                 <label className="flex items-center gap-1 cursor-pointer">
//                   <input type="checkbox" checked={formData.isRegularCustomer} onChange={handleRegularCustomerToggle} className="w-3 h-3 text-blue-600"/>
//                   <span className="text-xs text-gray-600">Regular</span>
//                 </label>
//               </div>
//               {formData.isRegularCustomer ? (
//                 <div className="space-y-1">
//                   <select value={String(formData.customerId)} onChange={handleCustomerSelect} className={inp}>
//                     <option value="">-- Select Customer --</option>
//                     {regularCustomers.map((c,i)=>{const cId=c.customerId||c.id;return<option key={`${cId}-${i}`} value={String(cId)}>{c.customerName} | {c.phoneNumber}</option>;})}
//                   </select>
//                   <div className="bg-gray-50 rounded p-1.5 text-xs space-y-0.5">
//                     <div className="font-medium text-gray-800">{formData.customerName||'—'}</div>
//                     <div className="text-gray-600">{formData.customerPhone||'—'}</div>
//                     <div className="text-gray-500 truncate">{formData.customerEmail||'No email'}</div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <div><label className={lbl}>Name <span className="text-red-500">*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                   <div><label className={lbl}>Phone <span className="text-red-500">*</span></label><input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                   <div><label className={lbl}>Email</label><input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Optional" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
//                 </div>
//               )}
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white flex-1">
//               <div className={ttl}>Device Info</div>
//               <div className="space-y-1">
//                 <div><label className={lbl}>Type <span className="text-red-500">*</span></label>
//                   <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={inp} required>
//                     {deviceTypes.map(t=><option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </div>
//                 <div><label className={lbl}>Brand</label>
//                   <select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}>
//                     <option value="">Select Brand</option>
//                     {brands.map(b=><option key={b.id} value={b.id}>{b.brandName}</option>)}
//                   </select>
//                 </div>
//                 <div><label className={lbl}>Model</label>
//                   <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId?'bg-gray-100 cursor-not-allowed':''}`}>
//                     <option value="">{formData.brandId?'Select Model':'Select Brand first'}</option>
//                     {filteredModels.map(m=><option key={m.id} value={m.id}>{m.modelName}</option>)}
//                   </select>
//                 </div>
//                 <div><label className={lbl}>Model No.</label>
//                   <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId?'bg-gray-100 cursor-not-allowed':''}`}>
//                     <option value="">{formData.modelId?'Select Model No.':'Select Model first'}</option>
//                     {filteredModelNumbers.map(mn=><option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
//                   </select>
//                 </div>
//                 {hasProcessor ? (
//                   <div><label className={lbl}>Processor</label>
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

//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Flags</div>
//               <div className="space-y-1.5">
//                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.oneDayService?'bg-red-50 border-red-300':'border-gray-200 hover:bg-gray-50'}`}>
//                   <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="w-3 h-3 text-red-600"/>
//                   <span className="text-xs font-medium text-gray-800">🚨 One Day Service</span>
//                 </label>
//                 <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.withCharger?'bg-green-50 border-green-300':'border-gray-200 hover:bg-gray-50'}`}>
//                   <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="w-3 h-3 text-green-600"/>
//                   <span className="text-xs font-medium text-gray-800">🔌 With Charger</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* COL 2: Serials + Conditions */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-blue-200 rounded p-2 bg-blue-50">
//               <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Device Serial (PRIMARY) <span className="text-red-500">*</span></div>
//               <div className="flex gap-1 mb-1">
//                 <input type="text" name="deviceBarcode" value={formData.deviceBarcode} onChange={handleChange}
//                   onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(formData.deviceBarcode.trim())addDeviceBarcode();}}}
//                   placeholder="Enter or scan serial"
//                   className="flex-1 px-2 py-1 border-2 border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-white" autoComplete="off"/>
//                 <button type="button" onClick={addDeviceBarcode} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium">Add</button>
//               </div>
//               <div className="space-y-1 max-h-32 overflow-y-auto">
//                 {formData.deviceBarcodes.map((b,i)=>(
//                   <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-blue-300">
//                     <span className="text-xs font-mono text-gray-700 truncate flex-1">{b}</span>
//                     <button type="button" onClick={()=>removeDeviceBarcode(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
//                   </div>
//                 ))}
//                 {formData.deviceBarcodes.length===0&&<p className="text-xs text-blue-400 italic">No serials added yet</p>}
//               </div>
//             </div>

//             <div className="border border-purple-200 rounded p-2 bg-purple-50">
//               <div className="text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Other Serials</div>
//               <div className="flex gap-1 mb-1">
//                 <select name="serialType" value={currentOtherSerial.serialType} onChange={handleOtherSerialChange} className="w-24 px-1 py-1 border border-purple-300 rounded text-xs focus:outline-none bg-white">
//                   <option value="">Type</option>
//                   {getAvailableSerialTypes().map(t=><option key={t} value={t}>{t}</option>)}
//                 </select>
//                 <input type="text" name="serialValue" value={currentOtherSerial.serialValue} onChange={handleOtherSerialChange}
//                   onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(currentOtherSerial.serialValue.trim())addOtherSerial();}}}
//                   placeholder="Serial value"
//                   className="flex-1 px-2 py-1 border-2 border-purple-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono bg-white" autoComplete="off"/>
//                 <button type="button" onClick={addOtherSerial} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium">Add</button>
//               </div>
//               <div className="space-y-1 max-h-24 overflow-y-auto">
//                 {formData.otherSerials.map((s,i)=>(
//                   <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-purple-300">
//                     <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded mr-1.5 flex-shrink-0">{s.serialType}</span>
//                     <span className="text-xs font-mono text-gray-700 truncate flex-1">{s.serialValue}</span>
//                     <button type="button" onClick={()=>removeOtherSerial(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
//                   </div>
//                 ))}
//                 {formData.otherSerials.length===0&&<p className="text-xs text-purple-400 italic">None added</p>}
//               </div>
//             </div>

//             <div className="border border-yellow-200 rounded p-2 bg-yellow-50 flex-1">
//               <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
//               <select onChange={(e)=>addDeviceCondition(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select condition --</option>
//                 {deviceConditions.map(c=><option key={c.id} value={c.id}>{c.conditionName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-24 overflow-y-auto">
//                 {formData.deviceConditionIds.map(id=>{const c=deviceConditions.find(x=>x.id===id);return(
//                   <span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">
//                     {c?.conditionName}<button type="button" onClick={()=>removeDeviceCondition(id)} className="text-yellow-600 hover:text-yellow-900 font-bold">✕</button>
//                   </span>
//                 );})}
//                 {formData.deviceConditionIds.length===0&&<p className="text-xs text-yellow-500 italic">None selected</p>}
//               </div>
//             </div>
//           </div>

//           {/* COL 3: Faults + Services + Descriptions */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-red-200 rounded p-2 bg-red-50">
//               <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults (Optional)</div>
//               <select onChange={(e)=>addFault(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select fault --</option>
//                 {faults.map(f=><option key={f.id} value={f.id}>{f.faultName}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
//                 {formData.selectedFaults.map(id=>{const f=faults.find(x=>x.id===id);return(
//                   <span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
//                     {f?.faultName}<button type="button" onClick={()=>removeFault(id)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
//                   </span>
//                 );})}
//                 {formData.selectedFaults.length===0&&<p className="text-xs text-red-400 italic">None selected</p>}
//               </div>
//             </div>

//             <div className="border border-green-200 rounded p-2 bg-green-50">
//               <div className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Services (Optional)</div>
//               <select onChange={(e)=>addService(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
//                 <option value="">-- Select service --</option>
//                 {services.map(s=><option key={s.id} value={s.id}>{s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}</option>)}
//               </select>
//               <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
//                 {formData.selectedServices.map(s=>(
//                   <span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
//                     {s.name} - Rs.{s.servicePrice?.toFixed(2)||'0.00'}<button type="button" onClick={()=>removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
//                   </span>
//                 ))}
//                 {formData.selectedServices.length===0&&<p className="text-xs text-green-500 italic">None selected</p>}
//               </div>
//               {formData.selectedServices.length>0&&(
//                 <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
//                   <span className="text-xs font-semibold text-gray-700">Total:</span>
//                   <span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
//                 </div>
//               )}
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
//               <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3"
//                 placeholder="Detailed fault description (optional)..."
//                 className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white flex-1">
//               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
//               <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"
//                 placeholder="Any additional notes..."
//                 className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
//             </div>
//           </div>

//           {/* COL 4: Payment + Summary + Actions */}
//           <div className="flex flex-col gap-2 overflow-hidden">
//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Payment Info</div>
//               <div className="space-y-1.5">
//                 <div><label className={lbl}>Advance Payment (Rs.)</label>
//                   <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//                 <div><label className={lbl}>Estimated Cost (Rs.)</label>
//                   <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
//                 </div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
//               <div className={ttl}>Summary</div>
//               <div className="space-y-1 text-xs">
//                 <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName||'—'}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium text-gray-800">{formData.customerPhone||'—'}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Serials:</span><span className={`font-medium ${formData.deviceBarcodes.length>0?'text-green-600':'text-red-500'}`}>{formData.deviceBarcodes.length} added</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium text-gray-800">{formData.selectedFaults.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium text-gray-800">{formData.selectedServices.length}</span></div>
//                 <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium text-gray-800">{formData.deviceConditionIds.length}</span></div>
//                 {formData.oneDayService&&<div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
//                 {formData.withCharger&&<div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
//                 {formData.selectedServices.length>0&&(
//                   <div className="border-t border-gray-200 pt-1 flex justify-between">
//                     <span className="text-gray-500">Service Total:</span>
//                     <span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded p-2 bg-white">
//               <div className={ttl}>Checklist</div>
//               <div className="space-y-0.5 text-xs">
//                 {[{label:'Customer name',ok:!!formData.customerName.trim()},{label:'Phone number',ok:!!formData.customerPhone.trim()},{label:'Device serial',ok:formData.deviceBarcodes.length>0}].map((item,i)=>(
//                   <div key={i} className="flex items-center gap-1.5">
//                     <span className={item.ok?'text-green-500':'text-red-400'}>{item.ok?'✓':'○'}</span>
//                     <span className={item.ok?'text-gray-700':'text-gray-400'}>{item.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">
//                 {loading?'Creating...':'✓ Create Job Card'}
//               </button>
//               {onCancel&&<button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">Cancel</button>}
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default JobCardCreate;



import { useState, useEffect, useRef } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { BrowserMultiFormatReader } from '@zxing/browser';

const JobCardCreate = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
  const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const deviceBarcodeVideoRef = useRef(null);
  const otherSerialVideoRef = useRef(null);
  const deviceBarcodeReaderRef = useRef(null);
  const otherSerialReaderRef = useRef(null);
  const [faults, setFaults] = useState([]);
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [allModelNumbers, setAllModelNumbers] = useState([]);
  const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [formData, setFormData] = useState({
    isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
    deviceType: 'LAPTOP', brandId: '', modelId: '', modelNumberId: '', processorId: '',
    deviceConditionIds: [], faultDescription: '', notes: '', advancePayment: 0, estimatedCost: 0,
    deviceBarcode: '', deviceBarcodes: [], otherSerials: [], selectedFaults: [], selectedServices: [],
    oneDayService: false, withCharger: false,
  });
  const [currentOtherSerial, setCurrentOtherSerial] = useState({ serialType: 'IMEI', serialValue: '' });

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR', 'OTHER'];
  const serialTypes = ['RAM_01','RAM_02','RAM_03','RAM_04','HDD_01','HDD_02','SSD_01','SSD_02','ADAPTER','BATTERY'];
  const noProcessorTypes = ['PRINTER', 'PROJECTOR'];
  const hasProcessor = !noProcessorTypes.includes(formData.deviceType);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
        e.preventDefault(); e.stopPropagation();
        const el = document.activeElement;
        if (el?.name === 'deviceBarcode' && formData.deviceBarcode.trim()) addDeviceBarcode();
        else if (el?.name === 'serialValue' && currentOtherSerial.serialValue.trim()) addOtherSerial();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [formData.deviceBarcode, currentOtherSerial.serialValue]);

  useEffect(() => {
    let barcodeBuffer = ''; let lastKeyTime = 0; let timer = null;
    const handleBarcodeKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') return;
      const now = Date.now();
      if (now - lastKeyTime > 100) barcodeBuffer = '';
      lastKeyTime = now;
      if (e.key.length === 1) barcodeBuffer += e.key;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { if (barcodeBuffer.length >= 3) handleScannedBarcode(barcodeBuffer); barcodeBuffer = ''; }, 50);
    };
    document.addEventListener('keydown', handleBarcodeKeyDown, true);
    return () => { document.removeEventListener('keydown', handleBarcodeKeyDown, true); if (timer) clearTimeout(timer); };
  }, []);

  const handleScannedBarcode = (barcode) => {
    setIsScanning(true);
    if (barcode.length >= 8 && barcode.length <= 20) {
      setFormData(prev => ({ ...prev, deviceBarcode: barcode }));
      setTimeout(() => { addDeviceBarcode(); setIsScanning(false); }, 100);
    }
    showScanningMessage(`Scanned: ${barcode}`);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (dataLoaded) return;
      try {
        const [faultsData, servicesData, brandsData, modelsData, modelNumbersData, processorsData, conditionsData, customersData] = await Promise.all([
          apiCall('/api/faults'), apiCall('/api/service-categories'), apiCall('/api/brands'),
          apiCall('/api/models'), apiCall('/api/model-numbers'), apiCall('/api/processors'),
          apiCall('/api/device-conditions'), apiCall('/api/customers/active')
        ]);
        if (isMounted) {
          setFaults((faultsData||[]).filter(i=>i.isActive));
          setServices((servicesData||[]).filter(i=>i.isActive));
          setBrands((brandsData||[]).filter(i=>i.isActive));
          setAllModels((modelsData||[]).filter(i=>i.isActive));
          setAllModelNumbers((modelNumbersData||[]).filter(i=>i.isActive));
          setProcessors((processorsData||[]).filter(i=>i.isActive));
          setDeviceConditions((conditionsData||[]).filter(i=>i.isActive));
          setRegularCustomers(customersData?.customers||[]);
          setDataLoaded(true);
        }
      } catch (err) { console.error(err); if (isMounted) setError('Failed to load form data'); }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [dataLoaded]);

  useEffect(() => {
    if (formData.brandId) {
      setFilteredModels(allModels.filter(m=>m.brand?.id===parseInt(formData.brandId)&&m.isActive));
      setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]);
    } else { setFilteredModels([]); setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]); }
  }, [formData.brandId, allModels]);

  useEffect(() => {
    if (formData.modelId) {
      setFilteredModelNumbers(allModelNumbers.filter(mn=>mn.model?.id===parseInt(formData.modelId)&&mn.isActive));
      setFormData(prev=>({...prev,modelNumberId:''}));
    } else { setFilteredModelNumbers([]); setFormData(prev=>({...prev,modelNumberId:''})); }
  }, [formData.modelId, allModelNumbers]);

  // ✅ Get effective service price based on customer type
  const getServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice;
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (!customerId) {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
        // Reset service prices to normal
        selectedServices: prev.selectedServices.map(s => ({ ...s, effectivePrice: s.servicePrice }))
      }));
      return;
    }
    const customer = regularCustomers.find(c=>parseInt(c.customerId||c.id,10)===parseInt(customerId,10));
    if (customer) {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: true,
        customerId: customer.customerId||customer.id,
        customerName: customer.customerName,
        customerPhone: customer.phoneNumber,
        customerEmail: customer.email||'',
        // Update existing service prices to special prices
        selectedServices: prev.selectedServices.map(s => ({
          ...s,
          effectivePrice: getServicePrice(s, true)
        }))
      }));
      showSuccessMessage(`✅ ${customer.customerName} selected`);
    }
    setError('');
  };

  const handleRegularCustomerToggle = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: true,
        selectedServices: prev.selectedServices.map(s => ({
          ...s,
          effectivePrice: getServicePrice(s, true)
        }))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
        selectedServices: prev.selectedServices.map(s => ({ ...s, effectivePrice: s.servicePrice }))
      }));
    }
  };

  useEffect(() => {
    if (!showDeviceBarcodeScanner||!deviceBarcodeVideoRef.current) return;
    const r = new BrowserMultiFormatReader(); deviceBarcodeReaderRef.current = r;
    r.decodeFromVideoDevice(undefined,deviceBarcodeVideoRef.current,(result)=>{ if(result) handleDeviceBarcodeScan(result.getText()); });
    return () => { if(deviceBarcodeReaderRef.current){deviceBarcodeReaderRef.current.reset();deviceBarcodeReaderRef.current=null;} };
  }, [showDeviceBarcodeScanner]);

  useEffect(() => {
    if (!showOtherSerialScanner||!otherSerialVideoRef.current) return;
    const r = new BrowserMultiFormatReader(); otherSerialReaderRef.current = r;
    r.decodeFromVideoDevice(undefined,otherSerialVideoRef.current,(result)=>{ if(result) handleOtherSerialScan(result.getText()); });
    return () => { if(otherSerialReaderRef.current){otherSerialReaderRef.current.reset();otherSerialReaderRef.current=null;} };
  }, [showOtherSerialScanner]);

  const handleChange = (e) => {
    const {name,value,type,checked} = e.target;
    const updated = {...formData,[name]:type==='checkbox'?checked:value};
    if(name==='brandId'){updated.modelId='';updated.modelNumberId='';setFilteredModelNumbers([]);}
    if(name==='modelId') updated.modelNumberId='';
    if(name==='deviceType'&&noProcessorTypes.includes(value)) updated.processorId='';
    setFormData(updated); setError('');
  };

  const handleOtherSerialChange=(e)=>{ const{name,value}=e.target; setCurrentOtherSerial(prev=>({...prev,[name]:value})); };
  const handleDeviceBarcodeScan=(v)=>{ setIsScanning(true); setFormData(prev=>({...prev,deviceBarcode:v})); setShowDeviceBarcodeScanner(false); showScanningMessage(`Scanned: ${v}`); setTimeout(()=>{if(v.trim())addDeviceBarcode();setIsScanning(false);},100); };
  const handleOtherSerialScan=(v)=>{ setIsScanning(true); setCurrentOtherSerial(prev=>({...prev,serialValue:v})); setShowOtherSerialScanner(false); showScanningMessage(`${currentOtherSerial.serialType} Scanned: ${v}`); setTimeout(()=>{if(v.trim())addOtherSerial();setIsScanning(false);},100); };

  const addFault=(id)=>{ if(!id)return; if(formData.selectedFaults.includes(parseInt(id))){setError('Fault already selected');return;} setFormData(prev=>({...prev,selectedFaults:[...prev.selectedFaults,parseInt(id)]})); setError(''); showSuccessMessage('Fault added!'); };
  const removeFault=(id)=>setFormData(prev=>({...prev,selectedFaults:prev.selectedFaults.filter(f=>f!==id)}));

  // ✅ Add service with effective price based on customer type
  const addService = (id) => {
    if (!id) return;
    const svc = services.find(s => s.id === parseInt(id));
    if (!svc) return;
    if (formData.selectedServices.some(s => s.id === parseInt(id))) { setError('Service already selected'); return; }
    const effectivePrice = getServicePrice(svc, formData.isRegularCustomer);
    setFormData(prev => ({ ...prev, selectedServices: [...prev.selectedServices, { ...svc, effectivePrice }] }));
    setError('');
    showSuccessMessage('Service added!');
  };

  const removeService=(id)=>setFormData(prev=>({...prev,selectedServices:prev.selectedServices.filter(s=>s.id!==id)}));

  // ✅ Calculate total using effective prices
  const calcTotal = () => formData.selectedServices.reduce((sum, s) => sum + (s.effectivePrice ?? s.servicePrice ?? 0), 0);

  const addDeviceCondition=(id)=>{ if(!id)return; if(formData.deviceConditionIds.includes(parseInt(id))){setError('Condition already selected');return;} setFormData(prev=>({...prev,deviceConditionIds:[...prev.deviceConditionIds,parseInt(id)]})); setError(''); showSuccessMessage('Condition added!'); };
  const removeDeviceCondition=(id)=>setFormData(prev=>({...prev,deviceConditionIds:prev.deviceConditionIds.filter(c=>c!==id)}));
  const addDeviceBarcode=async()=>{ const b=formData.deviceBarcode.trim(); if(!b){setError('Please enter or scan a device serial');return;} try{const r=await apiCall(`/api/jobcards/check-barcode/${encodeURIComponent(b)}`);if(r.exists){setError(`Barcode already exists: ${b}`);return;}}catch(e){console.error(e);} setFormData(prev=>({...prev,deviceBarcodes:[...prev.deviceBarcodes,b],deviceBarcode:''})); setError(''); showSuccessMessage('Serial added!'); };
  const removeDeviceBarcode=(i)=>setFormData(prev=>({...prev,deviceBarcodes:prev.deviceBarcodes.filter((_,idx)=>idx!==i)}));
  const addOtherSerial=()=>{ if(!currentOtherSerial.serialValue.trim()){setError('Please enter a serial value');return;} setFormData(prev=>({...prev,otherSerials:[...prev.otherSerials,{...currentOtherSerial}]})); setCurrentOtherSerial({serialType:serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t))[0]||'IMEI',serialValue:''}); setError(''); showSuccessMessage('Serial added!'); };
  const removeOtherSerial=(i)=>setFormData(prev=>({...prev,otherSerials:prev.otherSerials.filter((_,idx)=>idx!==i)}));
  const getAvailableSerialTypes=()=>serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t));

  const getUserIdFromToken=()=>{ try{const token=localStorage.getItem('token');if(token){const p=JSON.parse(atob(token.split('.')[1]));let uid=p.userId||p.id||p.sub;if(typeof uid==='string'){const n=parseInt(uid,10);return!isNaN(n)?n:1;}return uid||1;}}catch(e){console.error(e);}return 1; };
  const showSuccessMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };
  const showScanningMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };

  const handleSubmit=async(e)=>{ e.preventDefault(); setLoading(true); setError('');
    if(!formData.customerName.trim()){setError('Customer name is required');setLoading(false);return;}
    if(!formData.customerPhone.trim()){setError('Customer phone is required');setLoading(false);return;}
    if(formData.deviceBarcodes.length===0){setError('At least one device serial is required');setLoading(false);return;}
    try{
      const payload={
        isRegularCustomer:formData.isRegularCustomer,
        customer:formData.isRegularCustomer&&formData.customerId?{customerId:parseInt(formData.customerId)}:null,
        customerName:formData.customerName, customerPhone:formData.customerPhone, customerEmail:formData.customerEmail,
        deviceType:formData.deviceType,
        brand:formData.brandId?{id:parseInt(formData.brandId)}:null,
        model:formData.modelId?{id:parseInt(formData.modelId)}:null,
        modelNumber:formData.modelNumberId?{id:parseInt(formData.modelNumberId)}:null,
        processor:hasProcessor&&formData.processorId?{id:parseInt(formData.processorId)}:null,
        deviceConditions:formData.deviceConditionIds.map(id=>({id})),
        faults:formData.selectedFaults.map(id=>({id})),
        serviceCategories:formData.selectedServices.map(s=>({id:s.id})),
        faultDescription:formData.faultDescription, notes:formData.notes,
        advancePayment:parseFloat(formData.advancePayment)||0, estimatedCost:parseFloat(formData.estimatedCost)||0,
        oneDayService:formData.oneDayService, withCharger:formData.withCharger,
        createdBy:getUserIdFromToken(),
        serials:[...formData.deviceBarcodes.map(b=>({serialType:'DEVICE_SERIAL',serialValue:b})),...formData.otherSerials]
      };
      const response=await apiCall('/api/jobcards',{method:'POST',body:JSON.stringify(payload)});
      showSuccessMessage(`Job Card ${response.jobNumber} created!`);
      if(onSuccess) onSuccess(response);
    }catch(err){console.error(err);setError(err.message||'Failed to create job card');}
    finally{setLoading(false);}
  };

  const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
  const lbl="block text-xs font-medium text-gray-600 mb-0.5";
  const ttl="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-900">Create New Job Card</h2>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">{error}</span>}
          {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea')e.preventDefault();}}>
        <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

          {/* COL 1: Customer + Device + Flags */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className={ttl}>Customer</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={formData.isRegularCustomer} onChange={handleRegularCustomerToggle} className="w-3 h-3 text-blue-600"/>
                  <span className="text-xs text-gray-600">Regular</span>
                </label>
              </div>
              {formData.isRegularCustomer ? (
                <div className="space-y-1">
                  <select value={String(formData.customerId)} onChange={handleCustomerSelect} className={inp}>
                    <option value="">-- Select Customer --</option>
                    {regularCustomers.map((c,i)=>{const cId=c.customerId||c.id;return<option key={`${cId}-${i}`} value={String(cId)}>{c.customerName} | {c.phoneNumber}</option>;})}
                  </select>
                  <div className="bg-gray-50 rounded p-1.5 text-xs space-y-0.5">
                    <div className="font-medium text-gray-800">{formData.customerName||'—'}</div>
                    <div className="text-gray-600">{formData.customerPhone||'—'}</div>
                    <div className="text-gray-500 truncate">{formData.customerEmail||'No email'}</div>
                  </div>
                  {/* ✅ Special pricing notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    <p className="text-xs text-blue-700 font-medium">⭐ Special pricing applied</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div><label className={lbl}>Name <span className="text-red-500">*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                  <div><label className={lbl}>Phone <span className="text-red-500">*</span></label><input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                  <div><label className={lbl}>Email</label><input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Optional" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white flex-1">
              <div className={ttl}>Device Info</div>
              <div className="space-y-1">
                <div><label className={lbl}>Type <span className="text-red-500">*</span></label>
                  <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={inp} required>
                    {deviceTypes.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Brand</label>
                  <select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}>
                    <option value="">Select Brand</option>
                    {brands.map(b=><option key={b.id} value={b.id}>{b.brandName}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Model</label>
                  <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId?'bg-gray-100 cursor-not-allowed':''}`}>
                    <option value="">{formData.brandId?'Select Model':'Select Brand first'}</option>
                    {filteredModels.map(m=><option key={m.id} value={m.id}>{m.modelName}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Model No.</label>
                  <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId?'bg-gray-100 cursor-not-allowed':''}`}>
                    <option value="">{formData.modelId?'Select Model No.':'Select Model first'}</option>
                    {filteredModelNumbers.map(mn=><option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
                  </select>
                </div>
                {hasProcessor ? (
                  <div><label className={lbl}>Processor</label>
                    <select name="processorId" value={formData.processorId} onChange={handleChange} className={inp}>
                      <option value="">Select Processor</option>
                      {processors.map(p=><option key={p.id} value={p.id}>{p.processorName}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    <p className="text-xs text-amber-600 italic">⚠️ {formData.deviceType} has no processor</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Flags</div>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.oneDayService?'bg-red-50 border-red-300':'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="w-3 h-3 text-red-600"/>
                  <span className="text-xs font-medium text-gray-800">🚨 One Day Service</span>
                </label>
                <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.withCharger?'bg-green-50 border-green-300':'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="w-3 h-3 text-green-600"/>
                  <span className="text-xs font-medium text-gray-800">🔌 With Charger</span>
                </label>
              </div>
            </div>
          </div>

          {/* COL 2: Serials + Conditions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-blue-200 rounded p-2 bg-blue-50">
              <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Device Serial (PRIMARY) <span className="text-red-500">*</span></div>
              <div className="flex gap-1 mb-1">
                <input type="text" name="deviceBarcode" value={formData.deviceBarcode} onChange={handleChange}
                  onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(formData.deviceBarcode.trim())addDeviceBarcode();}}}
                  placeholder="Enter or scan serial"
                  className="flex-1 px-2 py-1 border-2 border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-white" autoComplete="off"/>
                <button type="button" onClick={addDeviceBarcode} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium">Add</button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.deviceBarcodes.map((b,i)=>(
                  <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-blue-300">
                    <span className="text-xs font-mono text-gray-700 truncate flex-1">{b}</span>
                    <button type="button" onClick={()=>removeDeviceBarcode(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
                {formData.deviceBarcodes.length===0&&<p className="text-xs text-blue-400 italic">No serials added yet</p>}
              </div>
            </div>

            <div className="border border-purple-200 rounded p-2 bg-purple-50">
              <div className="text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Other Serials</div>
              <div className="flex gap-1 mb-1">
                <select name="serialType" value={currentOtherSerial.serialType} onChange={handleOtherSerialChange} className="w-24 px-1 py-1 border border-purple-300 rounded text-xs focus:outline-none bg-white">
                  <option value="">Type</option>
                  {getAvailableSerialTypes().map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input type="text" name="serialValue" value={currentOtherSerial.serialValue} onChange={handleOtherSerialChange}
                  onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(currentOtherSerial.serialValue.trim())addOtherSerial();}}}
                  placeholder="Serial value"
                  className="flex-1 px-2 py-1 border-2 border-purple-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono bg-white" autoComplete="off"/>
                <button type="button" onClick={addOtherSerial} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium">Add</button>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {formData.otherSerials.map((s,i)=>(
                  <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-purple-300">
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded mr-1.5 flex-shrink-0">{s.serialType}</span>
                    <span className="text-xs font-mono text-gray-700 truncate flex-1">{s.serialValue}</span>
                    <button type="button" onClick={()=>removeOtherSerial(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
                {formData.otherSerials.length===0&&<p className="text-xs text-purple-400 italic">None added</p>}
              </div>
            </div>

            <div className="border border-yellow-200 rounded p-2 bg-yellow-50 flex-1">
              <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
              <select onChange={(e)=>addDeviceCondition(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select condition --</option>
                {deviceConditions.map(c=><option key={c.id} value={c.id}>{c.conditionName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-24 overflow-y-auto">
                {formData.deviceConditionIds.map(id=>{const c=deviceConditions.find(x=>x.id===id);return(
                  <span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">
                    {c?.conditionName}<button type="button" onClick={()=>removeDeviceCondition(id)} className="text-yellow-600 hover:text-yellow-900 font-bold">✕</button>
                  </span>
                );})}
                {formData.deviceConditionIds.length===0&&<p className="text-xs text-yellow-500 italic">None selected</p>}
              </div>
            </div>
          </div>

          {/* COL 3: Faults + Services + Descriptions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults (Optional)</div>
              <select onChange={(e)=>addFault(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select fault --</option>
                {faults.map(f=><option key={f.id} value={f.id}>{f.faultName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                {formData.selectedFaults.map(id=>{const f=faults.find(x=>x.id===id);return(
                  <span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
                    {f?.faultName}<button type="button" onClick={()=>removeFault(id)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
                  </span>
                );})}
                {formData.selectedFaults.length===0&&<p className="text-xs text-red-400 italic">None selected</p>}
              </div>
            </div>

            <div className="border border-green-200 rounded p-2 bg-green-50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Services (Optional)</div>
                {formData.isRegularCustomer && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special Price</span>
                )}
              </div>
              {/* ✅ Show effective price in dropdown */}
              <select onChange={(e)=>addService(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select service --</option>
                {services.map(s => {
                  const price = getServicePrice(s, formData.isRegularCustomer);
                  const isSpecial = formData.isRegularCustomer && s.specialServicePrice != null;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} - Rs.{price?.toFixed(2) || '0.00'}{isSpecial ? ' ⭐' : ''}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                {formData.selectedServices.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
                    {s.name} - Rs.{(s.effectivePrice ?? s.servicePrice)?.toFixed(2) || '0.00'}
                    <button type="button" onClick={() => removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
                  </span>
                ))}
                {formData.selectedServices.length===0&&<p className="text-xs text-green-500 italic">None selected</p>}
              </div>
              {formData.selectedServices.length>0&&(
                <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-700">Total:</span>
                  <span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
              <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3"
                placeholder="Detailed fault description (optional)..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"
                placeholder="Any additional notes..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
            </div>
          </div>

          {/* COL 4: Payment + Summary + Actions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Payment Info</div>
              <div className="space-y-1.5">
                <div><label className={lbl}>Advance Payment (Rs.)</label>
                  <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
                </div>
                <div><label className={lbl}>Estimated Cost (Rs.)</label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
              <div className={ttl}>Summary</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName||'—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium text-gray-800">{formData.customerPhone||'—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Serials:</span><span className={`font-medium ${formData.deviceBarcodes.length>0?'text-green-600':'text-red-500'}`}>{formData.deviceBarcodes.length} added</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium text-gray-800">{formData.selectedFaults.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium text-gray-800">{formData.selectedServices.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium text-gray-800">{formData.deviceConditionIds.length}</span></div>
                {formData.oneDayService&&<div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
                {formData.withCharger&&<div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
                {formData.isRegularCustomer&&<div className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-center font-bold">⭐ REGULAR CUSTOMER</div>}
                {formData.selectedServices.length>0&&(
                  <div className="border-t border-gray-200 pt-1 flex justify-between">
                    <span className="text-gray-500">Service Total:</span>
                    <span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Checklist</div>
              <div className="space-y-0.5 text-xs">
                {[{label:'Customer name',ok:!!formData.customerName.trim()},{label:'Phone number',ok:!!formData.customerPhone.trim()},{label:'Device serial',ok:formData.deviceBarcodes.length>0}].map((item,i)=>(
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={item.ok?'text-green-500':'text-red-400'}>{item.ok?'✓':'○'}</span>
                    <span className={item.ok?'text-gray-700':'text-gray-400'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">
                {loading?'Creating...':'✓ Create Job Card'}
              </button>
              {onCancel&&<button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">Cancel</button>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobCardCreate;