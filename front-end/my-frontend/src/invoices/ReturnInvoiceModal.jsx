import { useState } from 'react';
import { apiCall } from '../services/api';

const ReturnInvoiceModal = ({ invoice, onSuccess, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Return reason is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiCall(`/api/invoices/${invoice.id}/return`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() })
      });

      // Show success message - Responsive version
      const msg = document.createElement('div');
      msg.className = 'fixed z-50 p-4 w-full max-w-md sm:max-w-lg';
      msg.style.top = '1rem';
      msg.style.left = '50%';
      msg.style.transform = 'translateX(-50%)';
      msg.innerHTML = `
        <div class="bg-green-500 text-white rounded-lg shadow-xl p-4 sm:p-5 border-2 border-green-600">
          <div class="flex items-start gap-3">
            <div class="bg-green-600 p-2 rounded-full flex-shrink-0">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-bold text-lg sm:text-xl mb-1">✅ Invoice Returned Successfully!</p>
              <div class="space-y-1 text-sm sm:text-base">
                <p class="flex justify-between">
                  <span class="text-green-100">Invoice:</span>
                  <span class="font-semibold">${invoice.invoiceNumber}</span>
                </p>
                <p class="flex justify-between">
                  <span class="text-green-100">Refund Amount:</span>
                  <span class="font-bold">Rs.${invoice.paidAmount.toFixed(2)}</span>
                </p>
                <div class="pt-2 mt-2 border-t border-green-400">
                  <p class="font-semibold text-green-100 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Stock has been restored
                  </p>
                  <p class="font-semibold text-green-100 flex items-center gap-2 mt-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Expense record created
                  </p>
                </div>
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
              class="text-green-200 hover:text-white ml-2 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(msg);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (msg.parentElement) {
          msg.remove();
        }
      }, 5000);

      onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to return invoice');
      console.error('Return invoice error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold">Return Invoice</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-red-700 p-1 rounded transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-yellow-900 mb-1">⚠️ Important - This action cannot be undone!</p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc pl-5">
                  <li>Invoice will be marked as RETURNED</li>
                  <li>All items will be returned to inventory</li>
                  <li>Serialized items will be marked as AVAILABLE</li>
                  <li>An expense record of Rs.{invoice.paidAmount.toFixed(2)} will be created</li>
                  <li>This action is permanent and cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Invoice Summary */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Invoice Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              {invoice.jobCard && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Card:</span>
                  <span className="font-semibold text-blue-700">{invoice.jobCard.jobNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold text-gray-900">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">Rs.{invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-green-600">Rs.{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="font-bold text-gray-900">Amount to Refund:</span>
                <span className="font-bold text-red-600 text-lg">Rs.{invoice.paidAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Items Being Returned */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">Items Being Returned to Inventory:</h3>
              <div className="space-y-2">
                {invoice.items.filter(item => item.itemType !== 'SERVICE').map((item, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-xs text-gray-600">Code: {item.itemCode || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-700">Qty: {item.quantity}</p>
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <p className="text-xs text-gray-600">{item.serialNumbers.length} serials</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Return Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Return Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Please provide a detailed reason for returning this invoice (e.g., customer dissatisfaction, incorrect items, defective products, etc.)"
                required
                maxLength={500}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-red-900">
                  <strong>I understand that this action is permanent and cannot be undone.</strong> The invoice will be marked as returned, stock will be restored, and an expense record will be created.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-md transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Return...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Return Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnInvoiceModal;