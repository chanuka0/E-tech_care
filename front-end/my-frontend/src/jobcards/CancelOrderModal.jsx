import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const CancelOrderModal = ({ jobCard, onSuccess, onClose }) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cancelData, setCancelData] = useState({
    cancelledBy: 'TECHNICIAN',
    reason: '',
    fee: 0,
    withFee: false
  });

  const [showUsedItemsWarning, setShowUsedItemsWarning] = useState(false);

  // Check if job card can be cancelled
  const canBeCancelled = jobCard.status === 'COMPLETED' || jobCard.status === 'IN_PROGRESS';
  const cannotCancelReason = !canBeCancelled ? 
    `Job card status must be COMPLETED or IN_PROGRESS to cancel. Current status: ${jobCard.status}` : 
    null;

  useEffect(() => {
    if (!canBeCancelled) {
      setError(cannotCancelReason);
    }
  }, [canBeCancelled, cannotCancelReason]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCancelData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'cancelledBy' ? value : 
              name === 'fee' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canBeCancelled) {
      setError(cannotCancelReason);
      return;
    }

    setLoading(true);
    setError('');

    if (!cancelData.reason.trim()) {
      setError('Cancellation reason is required');
      setLoading(false);
      return;
    }

    // For customer cancellation with fee, validate fee amount
    if (cancelData.cancelledBy === 'CUSTOMER' && cancelData.withFee && cancelData.fee <= 0) {
      setError('Please enter a valid fee amount');
      setLoading(false);
      return;
    }

    // NEW: Check if job card has used items and show warning
    if (jobCard.usedItems && jobCard.usedItems.length > 0 && !showUsedItemsWarning) {
      setShowUsedItemsWarning(true);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        cancelledBy: cancelData.cancelledBy,
        cancelledByUserId: getUserIdFromToken(),
        reason: cancelData.reason,
        fee: cancelData.cancelledBy === 'CUSTOMER' && cancelData.withFee ? cancelData.fee : 0
      };

      // Cancel the job card
      const response = await apiCall(`/api/jobcards/${jobCard.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showSuccessMessage(`✅ Job card ${jobCard.jobNumber} cancelled successfully!`);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || `❌ Failed to cancel job card ${jobCard.jobNumber}`);
      console.error('Cancel error:', err);
    } finally {
      setLoading(false);
    }
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
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Job Card</h3>
        <p className="text-sm text-gray-600 mb-4">
          {jobCard.jobNumber} - {jobCard.customerName}
        </p>

        {/* Status Validation Warning */}
        {!canBeCancelled && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Cannot Cancel</span>
            </div>
            <p className="text-sm mt-1">{cannotCancelReason}</p>
          </div>
        )}

        {/* NEW: Used Items Warning */}
        {showUsedItemsWarning && jobCard.usedItems && jobCard.usedItems.length > 0 && (
          <div className="mb-4 p-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-bold text-orange-800 text-lg">⚠️ This job card has used items!</span>
            </div>
            
            <p className="text-sm text-orange-700 mb-3 font-medium">
              The following items are attached to this job card and will be handled during cancellation:
            </p>
            
            <div className="bg-white rounded-lg border border-orange-300 p-3 mb-3 max-h-48 overflow-y-auto">
              {jobCard.usedItems.map((item, index) => (
                <div key={index} className="py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.inventoryItem?.name || 'Unknown Item'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantityUsed}</p>
                      {item.usedSerialNumbers && item.usedSerialNumbers.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Serials: {item.usedSerialNumbers.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">Rs.{(item.unitPrice * item.quantityUsed).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 border border-orange-300 rounded p-3 mb-3">
              <p className="text-sm text-orange-800 font-medium">
                {cancelData.cancelledBy === 'CUSTOMER' 
                  ? '📦 Inventory will be restored and serials will be released back to AVAILABLE status.'
                  : '📦 Serials will be released but inventory quantities remain as-is (technician cancellation).'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowUsedItemsWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium"
              >
                ✓ Proceed with Cancellation
              </button>
            </div>
          </div>
        )}

        {error && canBeCancelled && !showUsedItemsWarning && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Current Details */}
        {!showUsedItemsWarning && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`font-semibold ${
                  jobCard.status === 'COMPLETED' ? 'text-green-600' :
                  jobCard.status === 'IN_PROGRESS' ? 'text-blue-600' :
                  'text-gray-900'
                }`}>
                  {jobCard.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Payment:</span>
                <span className="font-semibold text-gray-900">Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}</span>
              </div>
              {jobCard.estimatedCost && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-semibold text-gray-900">Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hide form when showing used items warning */}
          {!showUsedItemsWarning && (
            <>
              {/* Who is canceling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who is cancelling? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="technician"
                      name="cancelledBy"
                      value="TECHNICIAN"
                      checked={cancelData.cancelledBy === 'TECHNICIAN'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                      disabled={!canBeCancelled}
                    />
                    <label htmlFor="technician" className="ml-3 text-sm text-gray-700">
                      Technician (No Fee, No Invoice)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="customer"
                      name="cancelledBy"
                      value="CUSTOMER"
                      checked={cancelData.cancelledBy === 'CUSTOMER'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                      disabled={!canBeCancelled}
                    />
                    <label htmlFor="customer" className="ml-3 text-sm text-gray-700">
                      Customer (With or Without Fee)
                    </label>
                  </div>
                </div>
              </div>

              {/* Customer Cancellation Options */}
              {cancelData.cancelledBy === 'CUSTOMER' && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="withFee"
                      name="withFee"
                      checked={cancelData.withFee}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                      disabled={!canBeCancelled}
                    />
                    <label htmlFor="withFee" className="ml-3 text-sm text-gray-700">
                      Charge Cancellation Fee (Creates UNPAID Invoice)
                    </label>
                  </div>

                  {cancelData.withFee && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Fee (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="fee"
                        value={cancelData.fee}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                        placeholder="Enter fee amount..."
                        required={cancelData.withFee}
                        disabled={!canBeCancelled}
                      />
                      <p className="text-xs text-yellow-700 mt-2">
                        ⚠️ This will create an UNPAID invoice for the customer.
                        <br />
                        📦 Inventory/serials will be restored automatically.
                      </p>
                    </div>
                  )}

                  {!cancelData.withFee && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-green-700">
                          No fee will be charged. Inventory/serials will be restored.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Technician Cancellation Info */}
              {cancelData.cancelledBy === 'TECHNICIAN' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      No invoice will be created. Inventory/serials will be restored.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={cancelData.reason}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter cancellation reason..."
                  required
                  disabled={!canBeCancelled}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading || !canBeCancelled}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    !canBeCancelled 
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                      : cancelData.cancelledBy === 'CUSTOMER' && cancelData.withFee
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {loading ? 'Cancelling...' : 'Cancel Job Card'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;