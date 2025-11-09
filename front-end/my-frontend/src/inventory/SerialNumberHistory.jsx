import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const SerialNumberHistory = ({ serialNumber, onClose }) => {
  const { apiCall } = useApi();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/inventory/serial-history/${serialNumber}`);
        setHistory(data);
      } catch (err) {
        setError('Failed to load serial number history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (serialNumber) {
      fetchHistory();
    }
  }, [serialNumber]);

  const getMovementTypeColor = (type) => {
    const colors = {
      'IN': 'bg-green-100 text-green-800 border-green-300',
      'OUT': 'bg-red-100 text-red-800 border-red-300',
      'ADJUSTMENT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'RETURN': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getMovementIcon = (type) => {
    const icons = {
      'IN': '📦',
      'OUT': '🚀',
      'ADJUSTMENT': '⚙️',
      'RETURN': '↩️'
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Serial Number History</h2>
              <p className="text-blue-100 mt-1">Serial: {serialNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-500">This serial number has no movement history</p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Movements</p>
                    <p className="text-2xl font-bold text-blue-900">{history.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Status</p>
                    <p className="text-lg font-bold text-blue-900">
                      {history[0]?.status === 'AVAILABLE' ? '✅ Available' : '🔴 Sold/Used'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Item</p>
                    <p className="text-lg font-bold text-blue-900">{history[0]?.inventoryItem?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Movement Timeline
                </h3>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                  {history.map((movement, index) => (
                    <div key={movement.id} className="relative pb-8 last:pb-0">
                      {/* Timeline dot */}
                      <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white z-10"></div>

                      {/* Content */}
                      <div className="ml-16">
                        <div className={`border-2 rounded-lg p-4 ${
                          index === 0 ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                        }`}>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getMovementIcon(movement.movementType)}</span>
                              <div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getMovementTypeColor(movement.movementType)}`}>
                                  {movement.movementType}
                                </span>
                              </div>
                            </div>
                            {index === 0 && (
                              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                LATEST
                              </span>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600 font-medium">Date & Time</p>
                              <p className="text-gray-900 font-semibold">
                                {new Date(movement.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600 font-medium">Quantity</p>
                              <p className="text-gray-900 font-semibold">{movement.quantity}</p>
                            </div>

                            {movement.jobCardNumber && (
                              <div>
                                <p className="text-gray-600 font-medium">Job Card</p>
                                <p className="text-blue-700 font-semibold">{movement.jobCardNumber}</p>
                              </div>
                            )}

                            {movement.invoiceNumber && (
                              <div>
                                <p className="text-gray-600 font-medium">Invoice</p>
                                <p className="text-purple-700 font-semibold">{movement.invoiceNumber}</p>
                              </div>
                            )}

                            {movement.notes && (
                              <div className="md:col-span-2">
                                <p className="text-gray-600 font-medium">Notes</p>
                                <p className="text-gray-900">{movement.notes}</p>
                              </div>
                            )}

                            <div className="md:col-span-2">
                              <p className="text-gray-600 font-medium">Status After Movement</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                movement.status === 'AVAILABLE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {movement.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerialNumberHistory;