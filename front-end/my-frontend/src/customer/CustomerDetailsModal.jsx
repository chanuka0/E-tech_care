import { useState } from 'react';

const CustomerDetailsModal = ({ customer, onClose, onRefresh, apiCall }) => {
  const [creditAmount, setCreditAmount] = useState('');
  const [creditAction, setCreditAction] = useState('add'); // 'add' or 'deduct'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreditSubmit = async (e) => {
    e.preventDefault();

    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = creditAction === 'add'
        ? `/api/customers/${customer.customerId}/add-credit`
        : `/api/customers/${customer.customerId}/deduct-credit`;

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(creditAmount) })
      });

      setSuccess(response.message || `Credit ${creditAction === 'add' ? 'added' : 'deducted'} successfully`);
      setCreditAmount('');
      onRefresh();

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || `Failed to ${creditAction} credit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Customer Details</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{customer.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{customer.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900 text-sm">{customer.email}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-gray-600">Credit Balance:</span>
              <span className={`font-bold text-lg ${
                customer.creditBalance > 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                Rs.{customer.creditBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium text-gray-900">{customer.totalServiceCount}</span>
            </div>
            {customer.lastVisit && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Visit:</span>
                <span className="font-medium text-gray-900 text-sm">
                  {new Date(customer.lastVisit).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {customer.address && (
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-medium text-gray-900 text-sm mt-1">{customer.address}</p>
              </div>
            )}
          </div>

          {/* Credit Management */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-gray-900">Manage Credit</h4>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleCreditSubmit} className="space-y-3">
              {/* Action Selection */}
              <div className="flex space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="action"
                    value="add"
                    checked={creditAction === 'add'}
                    onChange={(e) => setCreditAction(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Add Credit</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="action"
                    value="deduct"
                    checked={creditAction === 'deduct'}
                    onChange={(e) => setCreditAction(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Deduct Credit</span>
                </label>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditAmount}
                  onChange={(e) => {
                    setCreditAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    creditAction === 'add'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                  }`}
                >
                  {loading ? 'Processing...' : (creditAction === 'add' ? 'Add' : 'Deduct')}
                </button>
              </div>
            </form>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;