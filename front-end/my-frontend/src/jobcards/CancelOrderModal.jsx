

import { useState } from 'react';
import { useApi } from '../services/apiService';

const CancelOrderModal = ({ jobCard, onSuccess, onClose }) => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cancelData, setCancelData] = useState({
    cancelledBy: 'TECHNICIAN',
    reason: '',
    fee: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCancelData(prev => ({
      ...prev,
      [name]: name === 'cancelledBy' ? value : 
              name === 'fee' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!cancelData.reason.trim()) {
      setError('Cancellation reason is required');
      setLoading(false);
      return;
    }

    if (cancelData.cancelledBy === 'CUSTOMER' && cancelData.fee <= 0) {
      setError('Cancellation fee is required for customer cancellation');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        cancelledBy: cancelData.cancelledBy,
        cancelledByUserId: getUserIdFromToken(),
        reason: cancelData.reason,
        fee: cancelData.cancelledBy === 'CUSTOMER' ? cancelData.fee : 0
      };

      // Cancel the job card
      const response = await apiCall(`/api/jobcards/${jobCard.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // If CUSTOMER cancelled with fee, create invoice
      if (cancelData.cancelledBy === 'CUSTOMER' && cancelData.fee > 0) {
        try {
          const invoicePayload = {
            jobCardId: jobCard.id,
            totalAmount: cancelData.fee,
            description: `Cancellation Fee - ${cancelData.reason}`,
            paymentMethod: 'PENDING',
            items: [
              {
                description: 'Cancellation Fee',
                quantity: 1,
                unitPrice: cancelData.fee,
                total: cancelData.fee
              }
            ]
          };

          await apiCall('/api/invoices', {
            method: 'POST',
            body: JSON.stringify(invoicePayload)
          });
        } catch (invoiceErr) {
          console.warn('Invoice creation failed:', invoiceErr);
          // Don't fail the entire cancellation if invoice creation fails
        }
      }

      showSuccessMessage('Job card cancelled successfully!');
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to cancel job card');
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
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Job Card</h3>
        <p className="text-sm text-gray-600 mb-4">{jobCard.jobNumber}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Payment:</span>
                <span className="font-semibold text-gray-900">${jobCard.advancePayment?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                <span className="font-semibold text-gray-900">${jobCard.estimatedCost?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

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
                />
                <label htmlFor="technician" className="ml-3 text-sm text-gray-700">
                  Technician (No Fee)
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
                />
                <label htmlFor="customer" className="ml-3 text-sm text-gray-700">
                  Customer (With Fee - will create invoice)
                </label>
              </div>
            </div>
          </div>

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
            />
          </div>

          {/* Cancellation Fee - Only for Customer */}
          {cancelData.cancelledBy === 'CUSTOMER' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Fee <span className="text-red-500">*</span>
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
                required
              />
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ This will create an invoice for the customer
              </p>
            </div>
          )}

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors text-sm font-medium"
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;