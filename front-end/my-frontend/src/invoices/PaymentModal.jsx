// import { useState } from 'react';
// import { useApi } from '../services/apiService';

// const PaymentModal = ({ invoice, onSuccess, onClose }) => {
//   const { apiCall } = useApi();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [paymentData, setPaymentData] = useState({
//     amount: invoice.balance,
//     method: 'CASH'
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (paymentData.amount <= 0) {
//       setError('Payment amount must be greater than 0');
//       setLoading(false);
//       return;
//     }

//     if (paymentData.amount > invoice.balance) {
//       setError(`Payment cannot exceed balance of ${invoice.balance.toFixed(2)}`);
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await apiCall(`/api/invoices/${invoice.id}/payment`, {
//         method: 'POST',
//         body: JSON.stringify(paymentData)
//       });

//       showSuccessMessage(`Payment of ${paymentData.amount.toFixed(2)} recorded successfully!`);
//       if (onSuccess) onSuccess(response);
//     } catch (err) {
//       setError(err.message || 'Failed to add payment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
//         <h3 className="text-xl font-bold text-gray-900 mb-4">Add Payment</h3>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Invoice Info */}
//           <div className="bg-gray-50 p-4 rounded-lg space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">Invoice:</span>
//               <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">Total Due:</span>
//               <span className="font-semibold text-gray-900">${invoice.total.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-sm border-t pt-2">
//               <span className="text-gray-600">Balance:</span>
//               <span className="font-semibold text-red-600">${invoice.balance.toFixed(2)}</span>
//             </div>
//           </div>

//           {/* Payment Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Amount <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number"
//               value={paymentData.amount}
//               onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
//               min="0"
//               max={invoice.balance}
//               step="0.01"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <p className="text-xs text-gray-600 mt-1">Max: ${invoice.balance.toFixed(2)}</p>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Method <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={paymentData.method}
//               onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="CASH">Cash</option>
//               <option value="CARD">Card</option>
//             </select>
//           </div>

//           {/* New Balance */}
//           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//             <p className="text-sm text-green-600 font-medium mb-1">New Balance After Payment</p>
//             <p className="text-2xl font-bold text-green-700">
//               ${(invoice.balance - paymentData.amount).toFixed(2)}
//             </p>
//           </div>

//           {/* Buttons */}
//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium"
//             >
//               {loading ? 'Processing...' : 'Record Payment'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PaymentModal;

import { useState } from 'react';
import { useApi } from '../services/apiService';

const PaymentModal = ({ invoice, onSuccess, onClose }) => {
  const { apiCall } = useApi();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PAYMENT_METHODS = ['CASH', 'CARD', 'CHEQUE', 'UPI'];

  const handlePayFullBalance = () => {
    setAmount(invoice.balance.toFixed(2));
  };

  const willBePaid = () => {
    const paymentAmount = parseFloat(amount) || 0;
    return (invoice.paidAmount + paymentAmount) >= invoice.total;
  };

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

    if (paymentAmount > invoice.balance) {
      setError(`Amount cannot exceed balance due (Rs.${invoice.balance.toFixed(2)})`);
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

      // Check if invoice is now fully paid
      const isFullyPaid = response.paymentStatus === 'PAID';
      const hasJobCard = invoice.jobCard != null;

      // Show success message
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Invoice Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
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
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">Rs.{invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">Rs.{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="font-semibold text-gray-900">Balance Due:</span>
                <span className="font-bold text-red-600 text-lg">Rs.{invoice.balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
              <button
                type="button"
                onClick={handlePayFullBalance}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                💰 Pay Full Balance (Rs.{invoice.balance.toFixed(2)})
              </button>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">Payment Summary:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payment Amount:</span>
                    <span className="font-semibold text-blue-900">Rs.{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Paid:</span>
                    <span className="font-semibold text-blue-900">Rs.{invoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-blue-300">
                    <span className="text-blue-700 font-semibold">New Total Paid:</span>
                    <span className="font-bold text-blue-900">
                      Rs.{(invoice.paidAmount + parseFloat(amount)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-semibold">New Balance:</span>
                    <span className="font-bold text-blue-900">
                      Rs.{Math.max(0, invoice.balance - parseFloat(amount)).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* CRITICAL: Show status change notification */}
                  {willBePaid() && (
                    <div className="pt-3 border-t-2 border-blue-400">
                      <div className="bg-gradient-to-r from-purple-100 to-green-100 border-2 border-purple-400 rounded-lg p-3">
                        <p className="text-purple-900 font-bold flex items-center gap-2 text-base">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Invoice will be FULLY PAID
                        </p>
                        {invoice.jobCard && (
                          <p className="text-green-700 font-semibold text-sm mt-2 flex items-center gap-1">
                            <span>🚀</span>
                            <span>Job Card will be marked as DELIVERED</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Record Payment</span>
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

export default PaymentModal;