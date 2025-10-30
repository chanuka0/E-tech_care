import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const SerialInputModal = ({ itemName, onAddSerial, onClose }) => {
  const [serialInput, setSerialInput] = useState('');
  const [serials, setSerials] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [inputMode, setInputMode] = useState(null); // 'scan' or 'type'
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Barcode Scanner
  useEffect(() => {
    if (showScanner && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const scannedSerial = result.getText();
          addSerial(scannedSerial);
          setSerialInput('');
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

  const addSerial = (serial) => {
    if (!serial.trim()) return;
    if (serials.includes(serial)) {
      alert('Serial already added');
      return;
    }
    setSerials([...serials, serial]);
  };

  const removeSerial = (index) => {
    setSerials(serials.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onAddSerial(serials);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-lg font-bold">Add Serial Numbers</h3>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Item: <span className="font-semibold">{itemName}</span></p>

          {/* Mode Selection */}
          {!inputMode && (
            <div className="space-y-2">
              <button
                onClick={() => setInputMode('scan')}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium flex items-center justify-center gap-2"
              >
                <span>📱</span> Scan Serial (Barcode)
              </button>
              <button
                onClick={() => setInputMode('type')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center gap-2"
              >
                <span>⌨️</span> Type Serial Manually
              </button>
            </div>
          )}

          {/* Scanner Mode */}
          {inputMode === 'scan' && (
            <div className="space-y-3">
              <div className="p-3 border-2 border-purple-300 rounded-lg bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm">Barcode Scanner</h4>
                  <button
                    onClick={() => setShowScanner(!showScanner)}
                    className="text-sm text-purple-600 hover:text-purple-900"
                  >
                    {showScanner ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showScanner && (
                  <video 
                    ref={videoRef} 
                    style={{ width: '100%', height: '200px' }}
                    className="rounded border border-gray-300"
                  />
                )}
              </div>
              <p className="text-xs text-gray-600">Scanned serials will appear below automatically</p>
            </div>
          )}

          {/* Type Mode */}
          {inputMode === 'type' && (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Enter serial number"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (addSerial(serialInput), setSerialInput(''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  addSerial(serialInput);
                  setSerialInput('');
                }}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Add Serial
              </button>
            </div>
          )}

          {/* Serials List */}
          {serials.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Added Serials ({serials.length})</p>
              <div className="space-y-1">
                {serials.map((serial, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-green-200">
                    <span className="text-sm text-gray-900">{serial}</span>
                    <button
                      onClick={() => removeSerial(idx)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={serials.length === 0}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium text-sm"
            >
              Add {serials.length} Serial(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerialInputModal;