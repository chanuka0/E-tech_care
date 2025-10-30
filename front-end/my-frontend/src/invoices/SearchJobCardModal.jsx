import { useState, useRef, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { BrowserMultiFormatReader } from '@zxing/browser';

const SearchJobCardModal = ({ onSelectJobCard, onClose }) => {
  const { apiCall } = useApi();
  const [jobCardNumber, setJobCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [jobCard, setJobCard] = useState(null);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Barcode Scanner
  useEffect(() => {
    if (showScanner && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const scannedNumber = result.getText();
          setJobCardNumber(scannedNumber);
          setShowScanner(false);
          searchJobCard(scannedNumber);
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

  const searchJobCard = async (number) => {
    if (!number.trim()) {
      setError('Please enter job card number');
      return;
    }

    setLoading(true);
    setError('');
    setJobCard(null);

    try {
      const data = await apiCall(`/api/jobcards/by-number/${number}`);
      setJobCard(data);
    } catch (err) {
      setError('Job card not found: ' + number);
      setJobCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (jobCard) {
      onSelectJobCard(jobCard);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Search Job Card</h3>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Card Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter or scan job card number"
                value={jobCardNumber}
                onChange={(e) => setJobCardNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchJobCard(jobCardNumber)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md"
                title="Scan Barcode"
              >
                📱
              </button>
            </div>
          </div>

          {/* Barcode Scanner */}
          {showScanner && (
            <div className="p-3 border-2 border-purple-300 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">Barcode Scanner</h4>
                <button
                  onClick={() => setShowScanner(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <video 
                ref={videoRef} 
                style={{ width: '100%', height: '200px' }}
                className="rounded border border-gray-300"
              />
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={() => searchJobCard(jobCardNumber)}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {/* Job Card Display */}
          {jobCard && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 space-y-2">
              <div className="text-sm">
                <p><span className="font-medium text-gray-600">Job Number:</span> {jobCard.jobNumber}</p>
                <p><span className="font-medium text-gray-600">Customer:</span> {jobCard.customerName}</p>
                <p><span className="font-medium text-gray-600">Device:</span> {jobCard.deviceType}</p>
                <p><span className="font-medium text-gray-600">Status:</span> {jobCard.status}</p>
              </div>
              
              <button
                onClick={handleSelect}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium mt-3"
              >
                Select This Job Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchJobCardModal;