import { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const CustomerSummaryReport = () => {
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all regular customers
  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      if (dataLoaded) return;

      try {
        setLoading(true);
        const data = await apiCall('/api/customers/active');
        if (isMounted) {
          setRegularCustomers(data || []);
          setDataLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load customers');
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, [dataLoaded]);

  // Handle customer selection
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setLoading(true);
    setError('');

    try {
      const summary = await apiCall(`/api/jobcards/customers/${customer.id}/summary`);
      setCustomerDetail(summary);
    } catch (err) {
      setError('Failed to load customer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6" />
            </svg>
            Customer Summary Report
          </h1>
          <p className="text-gray-600 mt-2">Track and analyze regular customer interactions and service history</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Regular Customers ({regularCustomers.length})</h2>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
              {regularCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No customers found</p>
              ) : (
                regularCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-blue-100 border-blue-400 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{customer.customerName}</p>
                    <p className="text-xs text-gray-600">{customer.phoneNumber}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {customer.totalServiceCount} visits
                      </span>
                      {customer.creditBalance > 0 && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                          Credit: Rs.{customer.creditBalance.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Customer Detail */}
          <div className="lg:col-span-2">
            {selectedCustomer && customerDetail ? (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{customerDetail.customerName}</h3>
                      <p className="text-gray-600 text-sm mt-1">{customerDetail.phoneNumber}</p>
                      {customerDetail.email && (
                        <p className="text-gray-600 text-sm">{customerDetail.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">MEMBER SINCE</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(customerDetail.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="text-xs text-blue-600 font-semibold mb-1">TOTAL VISITS</p>
                    <p className="text-3xl font-bold text-blue-700">{customerDetail.totalServiceCount}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <p className="text-xs text-green-600 font-semibold mb-1">CREDIT BALANCE</p>
                    <p className="text-3xl font-bold text-green-700">Rs.{customerDetail.creditBalance?.toFixed(2) || '0.00'}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <p className="text-xs text-purple-600 font-semibold mb-1">TOTAL JOB CARDS</p>
                    <p className="text-3xl font-bold text-purple-700">{customerDetail.totalJobCards}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                    <p className="text-xs text-orange-600 font-semibold mb-1">TOTAL SPENT</p>
                    <p className="text-3xl font-bold text-orange-700">Rs.{customerDetail.totalServiceCost?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Jobs by Status */}
                {customerDetail.jobsByStatus && (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Card Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(customerDetail.jobsByStatus).map(([status, count]) => {
                        const statusColors = {
                          'PENDING': 'from-yellow-100 to-yellow-50 border-yellow-300',
                          'IN_PROGRESS': 'from-blue-100 to-blue-50 border-blue-300',
                          'COMPLETED': 'from-green-100 to-green-50 border-green-300',
                          'DELIVERED': 'from-purple-100 to-purple-50 border-purple-300',
                          'WAITING_FOR_PARTS': 'from-orange-100 to-orange-50 border-orange-300',
                          'WAITING_FOR_APPROVAL': 'from-indigo-100 to-indigo-50 border-indigo-300',
                          'CANCELLED': 'from-red-100 to-red-50 border-red-300'
                        };

                        const colorClass = statusColors[status] || 'from-gray-100 to-gray-50 border-gray-300';

                        return (
                          <div key={status} className={`bg-gradient-to-r ${colorClass} p-4 rounded-lg border-2 flex items-center justify-between`}>
                            <span className="font-semibold text-gray-900">
                              {status.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">{count}</span>
                              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border-2 border-gray-300">
                                <span className="text-xs font-bold text-gray-600">
                                  {Math.round((count / customerDetail.totalJobCards) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Last Visit */}
                {customerDetail.lastVisit && (
                  <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
                    <p className="text-xs text-indigo-600 font-semibold mb-1">LAST SERVICE DATE</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {new Date(customerDetail.lastVisit).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-indigo-700 mt-2">
                      ({Math.floor((new Date() - new Date(customerDetail.lastVisit)) / (1000 * 60 * 60 * 24))} days ago)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6" />
                  </svg>
                  <p className="text-gray-600 font-semibold">Select a customer to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSummaryReport;