// import { useState } from 'react';

// const BulkSerialImportModal = ({ item, onImport, onClose }) => {
//   const [serialText, setSerialText] = useState('');
//   const [importMethod, setImportMethod] = useState('paste'); // paste or file

//   const handlePasteImport = () => {
//     const serials = serialText
//       .split('\n')
//       .map(s => s.trim())
//       .filter(s => s.length > 0);

//     if (serials.length === 0) {
//       alert('Please enter at least one serial number');
//       return;
//     }

//     onImport(serials);
//   };

//   const handleFileImport = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const text = event.target.result;
//       const serials = text
//         .split('\n')
//         .map(s => s.trim())
//         .filter(s => s.length > 0);

//       if (serials.length === 0) {
//         alert('No valid serial numbers found in file');
//         return;
//       }

//       onImport(serials);
//     };
//     reader.readAsText(file);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//         <div className="bg-purple-600 text-white p-6 flex justify-between items-center">
//           <h3 className="text-xl font-bold">Bulk Import Serial Numbers</h3>
//           <button onClick={onClose} className="text-white hover:bg-purple-700 p-1 rounded">
//             ✕
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
//             <p className="text-sm font-medium text-gray-700">Item</p>
//             <p className="text-lg font-bold text-purple-900">{item.name}</p>
//             <p className="text-sm text-purple-700 mt-1">SKU: {item.sku}</p>
//           </div>

//           <div className="flex space-x-2 border-b">
//             <button
//               onClick={() => setImportMethod('paste')}
//               className={`px-4 py-2 font-medium ${
//                 importMethod === 'paste'
//                   ? 'border-b-2 border-purple-600 text-purple-600'
//                   : 'text-gray-500'
//               }`}
//             >
//               Paste Text
//             </button>
//             <button
//               onClick={() => setImportMethod('file')}
//               className={`px-4 py-2 font-medium ${
//                 importMethod === 'file'
//                   ? 'border-b-2 border-purple-600 text-purple-600'
//                   : 'text-gray-500'
//               }`}
//             >
//               Upload File
//             </button>
//           </div>

//           {importMethod === 'paste' ? (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Paste Serial Numbers (one per line)
//               </label>
//               <textarea
//                 value={serialText}
//                 onChange={(e) => setSerialText(e.target.value)}
//                 rows="10"
//                 placeholder="SN001&#10;SN002&#10;SN003&#10;..."
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
//               />
//               <p className="text-xs text-gray-600 mt-2">
//                 Lines: {serialText.split('\n').filter(s => s.trim()).length}
//               </p>
//             </div>
//           ) : (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Upload Text File (.txt, .csv)
//               </label>
//               <input
//                 type="file"
//                 accept=".txt,.csv"
//                 onChange={handleFileImport}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//               <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
//                 <p className="text-xs font-medium text-gray-700 mb-2">File Format:</p>
//                 <pre className="text-xs text-gray-600 font-mono">
//                   SN001{'\n'}SN002{'\n'}SN003{'\n'}...
//                 </pre>
//                 <p className="text-xs text-gray-500 mt-2">One serial number per line</p>
//               </div>
//             </div>
//           )}

//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handlePasteImport}
//               disabled={importMethod === 'paste' && serialText.trim().length === 0}
//               className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
//             >
//               Import Serials
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkSerialImportModal;





import { useState } from 'react';

const BulkSerialImportModal = ({ item, onImport, onClose, existingSerials }) => {
  const [serialText, setSerialText] = useState('');
  const [importMethod, setImportMethod] = useState('paste');
  const [errors, setErrors] = useState([]);

  // ✅ Validate serials for duplicates
  const validateSerials = (serials) => {
    const newErrors = [];
    
    // Get all existing serial numbers (case-insensitive)
    const allExistingSerials = (existingSerials || []).map(s => 
      s.serialNumber.toLowerCase().trim()
    );
    
    const duplicatesInDB = [];
    const duplicatesInInput = [];
    const seen = new Set();
    
    serials.forEach((serial, index) => {
      const trimmedSerial = serial.toLowerCase().trim();
      
      // ✅ Check for duplicates in existing database
      if (allExistingSerials.includes(trimmedSerial)) {
        duplicatesInDB.push({ serial, line: index + 1 });
      }
      
      // ✅ Check for duplicates within input
      if (seen.has(trimmedSerial)) {
        duplicatesInInput.push({ serial, line: index + 1 });
      } else {
        seen.add(trimmedSerial);
      }
    });
    
    // Build error messages
    if (duplicatesInDB.length > 0) {
      newErrors.push({
        type: 'database',
        count: duplicatesInDB.length,
        items: duplicatesInDB.slice(0, 10), // Show first 10
        message: `${duplicatesInDB.length} serial(s) already exist in database`
      });
    }
    
    if (duplicatesInInput.length > 0) {
      newErrors.push({
        type: 'input',
        count: duplicatesInInput.length,
        items: duplicatesInInput.slice(0, 10), // Show first 10
        message: `${duplicatesInInput.length} duplicate(s) found in your input`
      });
    }
    
    return newErrors;
  };

  const handlePasteImport = () => {
    const serials = serialText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (serials.length === 0) {
      alert('Please enter at least one serial number');
      return;
    }

    // ✅ Validate for duplicates
    const validationErrors = validateSerials(serials);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ✅ If validation passes, proceed with import
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

      // ✅ Validate for duplicates
      const validationErrors = validateSerials(serials);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setSerialText(text);
        return;
      }

      onImport(serials);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-purple-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
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

          {/* ✅ Error Display Section */}
          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <svg className="w-6 h-6 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-red-800 mb-2">
                    ❌ Duplicate Serial Numbers Detected!
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Please remove or correct the following duplicates before importing:
                  </p>
                </div>
              </div>

              {errors.map((error, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="bg-red-100 rounded-lg p-3 border border-red-200">
                    <p className="font-semibold text-red-900 mb-2 flex items-center">
                      {error.type === 'database' ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                          </svg>
                          Already in Database
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Duplicates in Your Input
                        </>
                      )}
                      <span className="ml-auto bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                        {error.count}
                      </span>
                    </p>
                    
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {error.items.map((item, i) => (
                          <li key={i} className="text-sm text-red-800 font-mono bg-white px-2 py-1 rounded border border-red-200">
                            <span className="text-red-600 font-bold">Line {item.line}:</span> {item.serial}
                          </li>
                        ))}
                      </ul>
                      {error.count > 10 && (
                        <p className="text-xs text-red-700 mt-2 italic">
                          ... and {error.count - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded p-3">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Remove the highlighted duplicates from your list and try again.
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-2 border-b">
            <button
              onClick={() => {
                setImportMethod('paste');
                setErrors([]);
              }}
              className={`px-4 py-2 font-medium ${
                importMethod === 'paste'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => {
                setImportMethod('file');
                setErrors([]);
              }}
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
                onChange={(e) => {
                  setSerialText(e.target.value);
                  setErrors([]);
                }}
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

          {/* ✅ Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Duplicate Check</p>
                <p className="text-xs">
                  The system will automatically check for:
                </p>
                <ul className="text-xs mt-1 ml-4 list-disc">
                  <li>Serial numbers that already exist in the database</li>
                  <li>Duplicate entries within your import list</li>
                </ul>
              </div>
            </div>
          </div>

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