import { useState } from 'react';

const BulkSerialImportModal = ({ item, onImport, onClose }) => {
  const [serialText, setSerialText] = useState('');
  const [importMethod, setImportMethod] = useState('paste'); // paste or file

  const handlePasteImport = () => {
    const serials = serialText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (serials.length === 0) {
      alert('Please enter at least one serial number');
      return;
    }

    onImport(serials);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const serials = text
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (serials.length === 0) {
        alert('No valid serial numbers found in file');
        return;
      }

      onImport(serials);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-purple-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Bulk Import Serial Numbers</h3>
          <button onClick={onClose} className="text-white hover:bg-purple-700 p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-gray-700">Item</p>
            <p className="text-lg font-bold text-purple-900">{item.name}</p>
            <p className="text-sm text-purple-700 mt-1">SKU: {item.sku}</p>
          </div>

          <div className="flex space-x-2 border-b">
            <button
              onClick={() => setImportMethod('paste')}
              className={`px-4 py-2 font-medium ${
                importMethod === 'paste'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setImportMethod('file')}
              className={`px-4 py-2 font-medium ${
                importMethod === 'file'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              Upload File
            </button>
          </div>

          {importMethod === 'paste' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Serial Numbers (one per line)
              </label>
              <textarea
                value={serialText}
                onChange={(e) => setSerialText(e.target.value)}
                rows="10"
                placeholder="SN001&#10;SN002&#10;SN003&#10;..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                Lines: {serialText.split('\n').filter(s => s.trim()).length}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Text File (.txt, .csv)
              </label>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileImport}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">File Format:</p>
                <pre className="text-xs text-gray-600 font-mono">
                  SN001{'\n'}SN002{'\n'}SN003{'\n'}...
                </pre>
                <p className="text-xs text-gray-500 mt-2">One serial number per line</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteImport}
              disabled={importMethod === 'paste' && serialText.trim().length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Import Serials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSerialImportModal;