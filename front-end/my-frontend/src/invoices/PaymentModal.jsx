import { useState } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';

const PaymentModal = ({ invoice, onSuccess, onClose }) => {
  const [amount, setAmount] = useState(invoice.balance.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PAYMENT_METHODS = ['CASH', 'CARD', 'CHEQUE', 'UPI'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    // ✅ ONLY ALLOW FULL PAYMENT
    if (paymentAmount !== invoice.balance) {
      setError(`You must pay the full balance of Rs.${invoice.balance.toFixed(2)}. Partial payments are not allowed.`);
      setLoading(false);
      return;
    }

    try {
      const response = await apiCall(`/api/invoices/${invoice.id}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          amount: paymentAmount,
          method: paymentMethod
        })
      });

      const isFullyPaid = response.paymentStatus === 'PAID';
      const hasJobCard = invoice.jobCard != null;

      const msg = document.createElement('div');
      msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      msg.innerHTML = `
        <div>
          <p class="font-bold text-lg">✅ Payment Recorded Successfully!</p>
          <p class="text-sm mt-1">Amount: Rs.${paymentAmount.toFixed(2)}</p>
          ${isFullyPaid && hasJobCard ? '<p class="text-sm font-semibold mt-2">🚀 Job Card Status → DELIVERED</p>' : ''}
        </div>
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 4000);

      onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-blue-900 text-sm">Full Payment Required - Partial payments are not allowed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice:</span>
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
                <div className="flex justify-between pt-1.5 border-t border-gray-300">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-gray-900">Rs.{invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">Rs.{invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1.5">
                  <span className="font-semibold text-gray-900">Balance Due:</span>
                  <span className="font-bold text-red-600 text-base">Rs.{invoice.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  readOnly
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-gray-100 text-gray-900 font-bold text-lg text-center cursor-not-allowed"
                  placeholder="0.00"
                  required
                />
                <p className="mt-1 text-xs text-red-600 font-medium">⚠️ Full payment required - Amount cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Payment Summary:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Payment Amount:</span>
                <span className="font-semibold text-blue-900">Rs.{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Current Paid:</span>
                <span className="font-semibold text-blue-900">Rs.{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t-2 border-blue-300">
                <span className="text-blue-700 font-semibold">New Total Paid:</span>
                <span className="font-bold text-blue-900">
                  Rs.{(invoice.paidAmount + parseFloat(amount)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t-2 border-blue-300">
                <span className="text-blue-700 font-semibold">New Balance:</span>
                <span className="font-bold text-blue-900">
                  Rs.{Math.max(0, invoice.balance - parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t-2 border-blue-400">
              <div className="bg-gradient-to-r from-purple-100 to-green-100 border-2 border-purple-400 rounded-lg p-2">
                <p className="text-purple-900 font-bold flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Invoice will be FULLY PAID
                </p>
                {invoice.jobCard && (
                  <p className="text-green-700 font-semibold text-xs mt-1 flex items-center gap-1">
                    <span>🚀</span>
                    <span>Job Card will be marked as DELIVERED</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 mt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Record Full Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;