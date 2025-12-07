import { useState, useEffect, useRef } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider'; // ✅ IMPORT useAuth
import InvoiceView from './InvoiceView';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceEdit from './InvoiceEdit';
import { BrowserMultiFormatReader } from '@zxing/browser';

const InvoiceList = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth(); // ✅ USE useAuth from AuthProvider
  
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [displayedInvoices, setDisplayedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchJobCard, setSearchJobCard] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // ✅ DEBUG: Log admin status
  useEffect(() => {
    console.log('🔐 Admin Status:', isAdmin());
  }, [isAdmin]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/invoices');
      const sortedInvoices = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllInvoices(sortedInvoices);
      setInvoices(sortedInvoices);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error(err);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    setDisplayedInvoices(invoices.slice(0, displayCount));
  }, [invoices, displayCount]);

  useEffect(() => {
    if (!searchJobCard.trim()) {
      filterInvoices('', searchCustomer, filterStatus);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = allInvoices.filter(inv => 
        inv.jobCard?.jobNumber?.toLowerCase().includes(searchJobCard.toLowerCase())
      );
      setInvoices(filtered);
      setDisplayCount(10);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchJobCard, allInvoices]);

  useEffect(() => {
    if (!searchCustomer.trim()) {
      filterInvoices(searchJobCard, '', filterStatus);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = allInvoices.filter(inv => 
        inv.customerName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchCustomer.toLowerCase())
      );
      setInvoices(filtered);
      setDisplayCount(10);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCustomer, allInvoices]);

  const filterInvoices = (jobCard, customer, status) => {
    let filtered = allInvoices;

    if (jobCard.trim()) {
      filtered = filtered.filter(inv => 
        inv.jobCard?.jobNumber?.toLowerCase().includes(jobCard.toLowerCase())
      );
    }

    if (customer.trim()) {
      filtered = filtered.filter(inv => 
        inv.customerName?.toLowerCase().includes(customer.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(customer.toLowerCase())
      );
    }

    if (status !== 'ALL') {
      filtered = filtered.filter(inv => inv.paymentStatus === status);
    }

    setInvoices(filtered);
    setDisplayCount(10);
  };

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  useEffect(() => {
    if (showScanner && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const scannedValue = result.getText();
          setSearchJobCard(scannedValue);
          setShowScanner(false);
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('Barcode scan error:', error);
        }
      });

      return () => {
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
      };
    }
  }, [showScanner]);

  const handleDeleteInvoice = async (invoiceId) => {
    // ✅ Check if user is admin before allowing delete
    if (!isAdmin()) {
      alert('Only admins can delete invoices');
      return;
    }

    const reason = prompt('Please enter reason for deletion (Admin only):');
    if (reason && reason.trim()) {
      try {
        await apiCall(`/api/invoices/${invoiceId}`, {
          method: 'DELETE',
          body: JSON.stringify({ reason })
        });
        
        showSuccessMessage('Invoice deleted successfully!');
        fetchInvoices();
      } catch (err) {
        setError(err.message || 'Failed to delete invoice');
      }
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      UNPAID: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredByStatus = filterStatus === 'ALL' 
    ? displayedInvoices 
    : displayedInvoices.filter(inv => inv.paymentStatus === filterStatus);

  const hasMoreInvoices = invoices.length > displayCount;

  if (viewingInvoice) {
    return (
      <InvoiceView
        invoiceId={viewingInvoice}
        onClose={() => {
          setViewingInvoice(null);
          fetchInvoices();
        }}
        onRefresh={fetchInvoices}
      />
    );
  }

  if (showCreateModal) {
    return (
      <CreateInvoiceModal
        jobCard={null}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchInvoices();
        }}
        onClose={() => setShowCreateModal(false)}
      />
    );
  }

  if (editingInvoice) {
    return (
      <InvoiceEdit
        invoiceId={editingInvoice}
        onSuccess={() => {
          setEditingInvoice(null);
          fetchInvoices();
        }}
        onClose={() => setEditingInvoice(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">Manage all invoices and payments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Direct Invoice</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bars */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search 1: Job Card Number with Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Job Card</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter job card number..."
                value={searchJobCard}
                onChange={(e) => setSearchJobCard(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium flex items-center space-x-1"
                title="Scan Barcode"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
            </div>

            {showScanner && (
              <div className="mt-2 p-3 border-2 border-purple-300 rounded-lg bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Barcode Scanner</h4>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <video 
                  ref={videoRef} 
                  style={{ width: '100%', maxHeight: '300px' }}
                  className="rounded border border-gray-300"
                />
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Point camera at barcode
                </p>
              </div>
            )}
          </div>

          {/* Search 2: Customer or Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Customer/Invoice</label>
            <input
              type="text"
              placeholder="Enter customer name or invoice number..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                filterInvoices(searchJobCard, searchCustomer, e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredByStatus.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No invoices found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Create First Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Card</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredByStatus.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        {invoice.jobCard ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-blue-100"
                                onClick={() => setSearchJobCard(invoice.jobCard.jobNumber)}>
                            {invoice.jobCard.jobNumber}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Direct Sale</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{invoice.customerName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">Rs.{(invoice.total ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">Rs.{(invoice.paidAmount ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">Rs.{(invoice.balance ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline"
                          >
                            View
                          </button>
                          
                          {/* Edit Button - only for unpaid/partial invoices */}
                          {(invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIAL') && (
                            <button
                              onClick={() => setEditingInvoice(invoice.id)}
                              className="text-green-600 hover:text-green-900 font-medium text-sm hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          
                          {/* ✅ DELETE Button - ONLY for ROLE_ADMIN users */}
                          {isAdmin() && (
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-900 font-medium text-sm hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* See More Button */}
            {hasMoreInvoices && (
              <div className="flex justify-center py-4 border-t border-gray-200">
                <button
                  onClick={handleSeeMore}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
                >
                  See More ({invoices.length - displayCount} remaining)
                </button>
              </div>
            )}

            {/* Display Count Info */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredByStatus.length} of {invoices.length} invoices
                {hasMoreInvoices && ` • Load more to see older invoices`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Stats Summary */}
      {filteredByStatus.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{filteredByStatus.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              Rs.{filteredByStatus.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              Rs.{filteredByStatus.reduce((sum, inv) => sum + inv.paidAmount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              Rs.{filteredByStatus.reduce((sum, inv) => sum + inv.balance, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;