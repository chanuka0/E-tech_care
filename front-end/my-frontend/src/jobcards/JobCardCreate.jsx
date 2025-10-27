import { useState, useEffect, useRef } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import { BrowserMultiFormatReader } from '@zxing/browser';

const JobCardCreate = ({ onSuccess, onCancel }) => {
  const { apiCall } = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
  const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
  const [faults, setFaults] = useState([]);
  
  const deviceBarcodeVideoRef = useRef(null);
  const otherSerialVideoRef = useRef(null);
  const deviceBarcodeReaderRef = useRef(null);
  const otherSerialReaderRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'LAPTOP',
    brandId: '',
    modelId: '',
    faultId: '',  // Store fault ID from dropdown
    faultDescription: '',
    notes: '',
    advancePayment: 0,
    estimatedCost: 0,
    deviceBarcode: '',
    deviceBarcodes: [],
    otherSerials: []
  });

  const [currentOtherSerial, setCurrentOtherSerial] = useState({
    serialType: 'IMEI',
    serialValue: ''
  });

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR','OTHER'];
  const serialTypes = ['RAM_01_SERIAL', 'RAM_02_SERIAL','RAM 03_SERIAL','RAM_04_SERIAL','CPU_SERIAL','HDD_01_SERIAL','HDD_02_SERIAL','SSD_01_SERIAL','SSD_02_SERIAL','ADAPTOR_SERIAL','BATTERY_SERIAL'];
  const brands = ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Samsung', 'Canon', 'Epson', 'Brother'];
  const models = ['Model A', 'Model B', 'Model C', 'Model D', 'Model E'];

  // Fetch faults on component mount
  useEffect(() => {
    const fetchFaults = async () => {
      try {
        const faultsData = await apiCall('/api/faults');
        setFaults(faultsData);
      } catch (err) {
        console.error('Error fetching faults:', err);
        setError('Failed to load faults');
      }
    };
    fetchFaults();
  }, [apiCall]);
  
  // Device Barcode Scanner
  useEffect(() => {
    if (showDeviceBarcodeScanner && deviceBarcodeVideoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      deviceBarcodeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, deviceBarcodeVideoRef.current, (result, error) => {
        if (result) {
          handleDeviceBarcodeScan(result.getText());
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('Device barcode scan error:', error);
        }
      });

      return () => {
        if (deviceBarcodeReaderRef.current) {
          deviceBarcodeReaderRef.current.reset();
        }
      };
    }
  }, [showDeviceBarcodeScanner]);

  // Other Serial Scanner
  useEffect(() => {
    if (showOtherSerialScanner && otherSerialVideoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      otherSerialReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, otherSerialVideoRef.current, (result, error) => {
        if (result) {
          handleOtherSerialScan(result.getText());
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('Other serial scan error:', error);
        }
      });

      return () => {
        if (otherSerialReaderRef.current) {
          otherSerialReaderRef.current.reset();
        }
      };
    }
  }, [showOtherSerialScanner, currentOtherSerial.serialType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleOtherSerialChange = (e) => {
    const { name, value } = e.target;
    setCurrentOtherSerial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeviceBarcodeScan = (scannedValue) => {
    setFormData(prev => ({
      ...prev,
      deviceBarcode: scannedValue
    }));
    setShowDeviceBarcodeScanner(false);
    showSuccessMessage(`Device Barcode Scanned: ${scannedValue}`);
  };

  const handleOtherSerialScan = (scannedValue) => {
    setCurrentOtherSerial(prev => ({
      ...prev,
      serialValue: scannedValue
    }));
    setShowOtherSerialScanner(false);
    showSuccessMessage(`${currentOtherSerial.serialType} Scanned: ${scannedValue}`);
  };

  const addDeviceBarcode = () => {
    if (formData.deviceBarcode.trim()) {
      setFormData(prev => ({
        ...prev,
        deviceBarcodes: [...prev.deviceBarcodes, formData.deviceBarcode.trim()],
        deviceBarcode: ''
      }));
      setError('');
      showSuccessMessage('Device barcode added successfully!');
    } else {
      setError('Please enter or scan a device barcode');
    }
  };

  const removeDeviceBarcode = (index) => {
    setFormData(prev => ({
      ...prev,
      deviceBarcodes: prev.deviceBarcodes.filter((_, i) => i !== index)
    }));
  };

  const addOtherSerial = () => {
    if (currentOtherSerial.serialValue.trim()) {
      setFormData(prev => ({
        ...prev,
        otherSerials: [...prev.otherSerials, { ...currentOtherSerial }]
      }));
      setCurrentOtherSerial({
        serialType: 'IMEI',
        serialValue: ''
      });
      setError('');
      showSuccessMessage('Serial added successfully!');
    } else {
      setError('Please enter or scan a serial value');
    }
  };

  const removeOtherSerial = (index) => {
    setFormData(prev => ({
      ...prev,
      otherSerials: prev.otherSerials.filter((_, i) => i !== index)
    }));
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let userId = payload.userId || payload.id || payload.sub;
        if (typeof userId === 'string') {
          const parsed = parseInt(userId, 10);
          return !isNaN(parsed) ? parsed : 1;
        }
        return userId || 1;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
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

    if (!formData.faultId) {
      setError('Please select a fault type');
      setLoading(false);
      return;
    }

    if (!formData.faultDescription.trim()) {
      setError('Fault description is required');
      setLoading(false);
      return;
    }

    if (formData.deviceBarcodes.length === 0) {
      setError('At least one device barcode is required');
      setLoading(false);
      return;
    }

    try {
      // FIXED: Send fault as object with id, not faultId
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deviceType: formData.deviceType,
        brandId: formData.brandId,
        modelId: formData.modelId,
        fault: {
          id: parseInt(formData.faultId)  // ✅ CORRECT: fault object
        },
        faultDescription: formData.faultDescription,
        notes: formData.notes,
        advancePayment: parseFloat(formData.advancePayment) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        createdBy: getUserIdFromToken(),
        serials: [
          // Add device barcodes as DEVICE_SERIAL type
          ...formData.deviceBarcodes.map(barcode => ({
            serialType: 'DEVICE_SERIAL',
            serialValue: barcode
          })),
          // Add other serials
          ...formData.otherSerials
        ]
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await apiCall('/api/jobcards', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showSuccessMessage(`Job Card ${response.jobNumber} created successfully!`);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      console.error('Error creating job card:', err);
      setError(err.message || 'Failed to create job card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Job Card</h2>
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
                  placeholder="example@email.com"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
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

          {/* Device Barcode - PRIMARY */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-2">1</span>
              Device Barcode (PRIMARY)
            </h3>
            
            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Barcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deviceBarcode"
                    value={formData.deviceBarcode}
                    onChange={handleChange}
                    placeholder="Enter or scan device barcode"
                    className="w-full px-3 py-2 border-2 border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <p className="text-xs text-blue-600 mt-1">🔹 This is the primary device identifier</p>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={addDeviceBarcode}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    title="Add Device Barcode"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="ml-1">Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeviceBarcodeScanner(!showDeviceBarcodeScanner)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    title="Scan Device Barcode"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Device Barcode Scanner */}
              {showDeviceBarcodeScanner && (
                <div className="mt-4 p-4 border-2 border-purple-400 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">📷 Device Barcode Scanner</h4>
                    <button
                      type="button"
                      onClick={() => setShowDeviceBarcodeScanner(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <video
                    ref={deviceBarcodeVideoRef}
                    style={{ width: '100%', maxHeight: '400px' }}
                    className="rounded border border-gray-300"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Point camera at <strong>Device Barcode</strong>
                  </p>
                </div>
              )}

              {/* Added Device Barcodes List */}
              {formData.deviceBarcodes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Device Barcodes:</h4>
                  <div className="space-y-2">
                    {formData.deviceBarcodes.map((barcode, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
                        <div className="flex items-center">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-2">DEVICE_SERIAL</span>
                          <span className="ml-2 text-gray-700 font-semibold">{barcode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDeviceBarcode(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other Serials - SECONDARY */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mr-2">2</span>
              Other Serials (IMEI, etc.)
            </h3>
            
            <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Type
                  </label>
                  <select
                    name="serialType"
                    value={currentOtherSerial.serialType}
                    onChange={handleOtherSerialChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {serialTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Value
                  </label>
                  <input
                    type="text"
                    name="serialValue"
                    value={currentOtherSerial.serialValue}
                    onChange={handleOtherSerialChange}
                    placeholder="Enter or scan serial"
                    className="w-full px-3 py-2 border-2 border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={addOtherSerial}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="ml-1">Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtherSerialScanner(!showOtherSerialScanner)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    title="Scan Serial"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Other Serial Scanner */}
              {showOtherSerialScanner && (
                <div className="mt-4 p-4 border-2 border-purple-400 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">📷 {currentOtherSerial.serialType} Scanner</h4>
                    <button
                      type="button"
                      onClick={() => setShowOtherSerialScanner(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <video
                    ref={otherSerialVideoRef}
                    style={{ width: '100%', maxHeight: '400px' }}
                    className="rounded border border-gray-300"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Point camera at <strong>{currentOtherSerial.serialType}</strong>
                  </p>
                </div>
              )}

              {/* Added Other Serials List */}
              {formData.otherSerials.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Serials:</h4>
                  <div className="space-y-2">
                    {formData.otherSerials.map((serial, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-purple-300">
                        <div className="flex items-center">
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded mr-2">{serial.serialType}</span>
                          <span className="ml-2 text-gray-700 font-semibold">{serial.serialValue}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOtherSerial(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fault & Notes - DROPDOWN ADDED */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fault Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="faultId"
                  value={formData.faultId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Fault Type --</option>
                  {faults.map(fault => (
                    <option key={fault.id} value={fault.id}>
                      {fault.faultName}
                    </option>
                  ))}
                </select>
                {formData.faultId && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✓ Selected: {faults.find(f => f.id === parseInt(formData.faultId))?.faultName}
                  </p>
                )}
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
                  placeholder="Detailed description of the fault..."
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
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {loading ? 'Creating...' : 'Create Job Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCardCreate;