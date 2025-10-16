import { useState, useEffect, useRef } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import { BrowserMultiFormatReader } from '@zxing/browser';
//import { useAuth } from '../auth/AuthProvider';


const JobCardCreate = ({ onSuccess, onCancel }) => {
  const { apiCall } = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'LAPTOP',
    brandId: '',
    modelId: '',
    faultDescription: '',
    notes: '',
    advancePayment: 0,
    estimatedCost: 0,
    serials: []
  });

  const [currentSerial, setCurrentSerial] = useState({
    serialType: 'SERIAL_NUMBER',
    serialValue: ''
  });

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR'];
  const serialTypes = ['SERIAL_NUMBER', 'IMEI', 'MODEL_NUMBER'];
  const brands = ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Samsung', 'Canon', 'Epson', 'Brother'];
  const models = ['Model A', 'Model B', 'Model C', 'Model D', 'Model E'];


  
  // Barcode scanner initialization
  useEffect(() => {
    if (showScanner && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          handleScan({ text: result.getText() });
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('Barcode scan error:', error);
        }
      });

      return () => {
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
      };
    }
  }, [showScanner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSerialChange = (e) => {
    const { name, value } = e.target;
    setCurrentSerial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSerial = () => {
    if (currentSerial.serialValue.trim()) {
      setFormData(prev => ({
        ...prev,
        serials: [...prev.serials, { ...currentSerial }]
      }));
      setCurrentSerial({
        serialType: 'SERIAL_NUMBER',
        serialValue: ''
      });
      setError('');
    }
  };

  const removeSerial = (index) => {
    setFormData(prev => ({
      ...prev,
      serials: prev.serials.filter((_, i) => i !== index)
    }));
  };

  const handleScan = (result) => {
    if (result && result.text) {
      const scannedValue = result.text;
      setCurrentSerial(prev => ({
        ...prev,
        serialValue: scannedValue
      }));
      setShowScanner(false);
      setError('');
      
      // Success notification
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = `Scanned: ${scannedValue}`;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || 1;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

      // DEBUG: Check token before submitting
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  console.log('Token value:', token?.substring(0, 20) + '...');
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

    if (!formData.faultDescription.trim()) {
      setError('Fault description is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        createdBy: getUserIdFromToken(),
        advancePayment: parseFloat(formData.advancePayment) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0
      };

      const response = await apiCall('/api/jobcards', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Success notification
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = `Job Card ${response.jobNumber} created successfully!`;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

      if (onSuccess) onSuccess(response);
    } catch (err) {
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
                  autoComplete="off"
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

          {/* Serial Numbers */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Serial Numbers</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Type
                  </label>
                  <select
                    name="serialType"
                    value={currentSerial.serialType}
                    onChange={handleSerialChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={currentSerial.serialValue}
                    onChange={handleSerialChange}
                    placeholder="Enter or scan serial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={addSerial}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    title="Scan Barcode"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Barcode Scanner */}
              {showScanner && (
                <div className="mt-4 p-4 border-2 border-purple-300 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">Barcode Scanner</h4>
                    <button
                      type="button"
                      onClick={() => setShowScanner(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <video 
                    ref={videoRef} 
                    style={{ width: '100%', maxHeight: '400px' }}
                    className="rounded border border-gray-300"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Point camera at barcode
                  </p>
                </div>
              )}

              {/* Serial List */}
              {formData.serials.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Serials:</h4>
                  <div className="space-y-2">
                    {formData.serials.map((serial, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                        <div>
                          <span className="font-medium text-gray-900">{serial.serialType}:</span>
                          <span className="ml-2 text-gray-700">{serial.serialValue}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSerial(index)}
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

          {/* Fault & Notes */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="space-y-4">
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
              {loading ? 'Creating...' : 'Create Job Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCardCreate;