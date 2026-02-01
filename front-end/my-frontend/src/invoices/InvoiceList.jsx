
// import { useState, useEffect, useRef } from 'react';
// import { apiCall, API_ENDPOINTS } from '../services/api';
// import { useAuth } from '../auth/AuthProvider';
// import InvoiceView from './InvoiceView';
// import CreateInvoiceModal from './CreateInvoiceModal';
// import InvoiceEdit from './InvoiceEdit';
// import { BrowserMultiFormatReader } from '@zxing/browser';

// const InvoiceList = () => {
//   const { isAdmin } = useAuth();
  
//   const [invoices, setInvoices] = useState([]);
//   const [allInvoices, setAllInvoices] = useState([]);
//   const [displayedInvoices, setDisplayedInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [searchJobCard, setSearchJobCard] = useState('');
//   const [searchCustomer, setSearchCustomer] = useState('');
//   const [viewingInvoice, setViewingInvoice] = useState(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showScanner, setShowScanner] = useState(false);
//   const [editingInvoice, setEditingInvoice] = useState(null);
//   const [displayCount, setDisplayCount] = useState(10);
  
//   const videoRef = useRef(null);
//   const codeReaderRef = useRef(null);

//   useEffect(() => {
//     console.log('🔐 Admin Status:', isAdmin());
//   }, [isAdmin]);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/invoices');
//       const sortedInvoices = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setAllInvoices(sortedInvoices);
//       setInvoices(sortedInvoices);
//     } catch (err) {
//       setError('Failed to fetch invoices');
//       console.error(err);
//     }
//     setLoading(false);
//   };
  
//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   useEffect(() => {
//     setDisplayedInvoices(invoices.slice(0, displayCount));
//   }, [invoices, displayCount]);

//   useEffect(() => {
//     if (!searchJobCard.trim()) {
//       filterInvoices('', searchCustomer, filterStatus);
//       return;
//     }

//     const timer = setTimeout(() => {
//       const filtered = allInvoices.filter(inv => 
//         inv.jobCard?.jobNumber?.toLowerCase().includes(searchJobCard.toLowerCase())
//       );
//       setInvoices(filtered);
//       setDisplayCount(10);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchJobCard, allInvoices]);

//   useEffect(() => {
//     if (!searchCustomer.trim()) {
//       filterInvoices(searchJobCard, '', filterStatus);
//       return;
//     }

//     const timer = setTimeout(() => {
//       const filtered = allInvoices.filter(inv => 
//         inv.customerName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
//         inv.invoiceNumber?.toLowerCase().includes(searchCustomer.toLowerCase())
//       );
//       setInvoices(filtered);
//       setDisplayCount(10);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchCustomer, allInvoices]);

//   const filterInvoices = (jobCard, customer, status) => {
//     let filtered = allInvoices;

//     if (jobCard.trim()) {
//       filtered = filtered.filter(inv => 
//         inv.jobCard?.jobNumber?.toLowerCase().includes(jobCard.toLowerCase())
//       );
//     }

//     if (customer.trim()) {
//       filtered = filtered.filter(inv => 
//         inv.customerName?.toLowerCase().includes(customer.toLowerCase()) ||
//         inv.invoiceNumber?.toLowerCase().includes(customer.toLowerCase())
//       );
//     }

//     if (status !== 'ALL') {
//       // Handle RETURNED status filter
//       if (status === 'RETURNED') {
//         filtered = filtered.filter(inv => inv.isReturned === true);
//       } else {
//         filtered = filtered.filter(inv => 
//           !inv.isReturned && inv.paymentStatus === status
//         );
//       }
//     }

//     setInvoices(filtered);
//     setDisplayCount(10);
//   };

//   const handleSeeMore = () => {
//     setDisplayCount(prevCount => prevCount + 10);
//   };

//   useEffect(() => {
//     if (showScanner && videoRef.current) {
//       const codeReader = new BrowserMultiFormatReader();
//       codeReaderRef.current = codeReader;

//       codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
//         if (result) {
//           const scannedValue = result.getText();
//           setSearchJobCard(scannedValue);
//           setShowScanner(false);
//         }
//         if (error && error.name !== 'NotFoundException') {
//           console.error('Barcode scan error:', error);
//         }
//       });

//       return () => {
//         if (codeReaderRef.current) {
//           codeReaderRef.current.reset();
//         }
//       };
//     }
//   }, [showScanner]);

//   const handleDeleteInvoice = async (invoiceId) => {
//     if (!isAdmin()) {
//       alert('Only admins can delete invoices');
//       return;
//     }

//     const reason = prompt('Please enter reason for deletion (Admin only):');
//     if (reason && reason.trim()) {
//       try {
//         await apiCall(`/api/invoices/${invoiceId}`, {
//           method: 'DELETE',
//           body: JSON.stringify({ reason })
//         });
        
//         showSuccessMessage('Invoice deleted successfully!');
//         fetchInvoices();
//       } catch (err) {
//         setError(err.message || 'Failed to delete invoice');
//       }
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const getStatusBadge = (invoice) => {
//     // Check if invoice is returned
//     if (invoice.isReturned) {
//       return (
//         <div className="flex items-center gap-2">
//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
//             RETURNED
//           </span>
//         </div>
//       );
//     }
    
//     // Regular payment status
//     const colors = {
//       PAID: 'bg-green-100 text-green-800',
//       PARTIAL: 'bg-yellow-100 text-yellow-800',
//       UNPAID: 'bg-red-100 text-red-800'
//     };
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[invoice.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
//         {invoice.paymentStatus}
//       </span>
//     );
//   };

//   const filteredByStatus = filterStatus === 'ALL' 
//     ? displayedInvoices 
//     : displayedInvoices.filter(inv => {
//         if (filterStatus === 'RETURNED') {
//           return inv.isReturned === true;
//         } else {
//           return !inv.isReturned && inv.paymentStatus === filterStatus;
//         }
//       });

//   const hasMoreInvoices = invoices.length > displayCount;

//   if (viewingInvoice) {
//     return (
//       <InvoiceView
//         invoiceId={viewingInvoice}
//         onClose={() => {
//           setViewingInvoice(null);
//           fetchInvoices();
//         }}
//         onRefresh={fetchInvoices}
//       />
//     );
//   }

//   if (showCreateModal) {
//     return (
//       <CreateInvoiceModal
//         jobCard={null}
//         onSuccess={() => {
//           setShowCreateModal(false);
//           fetchInvoices();
//         }}
//         onClose={() => setShowCreateModal(false)}
//       />
//     );
//   }

//   if (editingInvoice) {
//     return (
//       <InvoiceEdit
//         invoiceId={editingInvoice}
//         onSuccess={() => {
//           setEditingInvoice(null);
//           fetchInvoices();
//         }}
//         onClose={() => setEditingInvoice(null)}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
//           <p className="text-gray-600 mt-1">Manage all invoices and payments</p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>Create Direct Invoice</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Search Bars */}
//       <div className="bg-white rounded-lg shadow p-4 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Search by Job Card</label>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 placeholder="Enter job card number..."
//                 value={searchJobCard}
//                 onChange={(e) => setSearchJobCard(e.target.value)}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Search by Customer/Invoice</label>
//             <input
//               type="text"
//               placeholder="Enter customer name or invoice number..."
//               value={searchCustomer}
//               onChange={(e) => setSearchCustomer(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
//             <select
//               value={filterStatus}
//               onChange={(e) => {
//                 setFilterStatus(e.target.value);
//                 filterInvoices(searchJobCard, searchCustomer, e.target.value);
//               }}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             >
//               <option value="ALL">All Status</option>
//               <option value="PAID">Paid</option>
//               <option value="PARTIAL">Partial</option>
//               <option value="UNPAID">Unpaid</option>
//               <option value="RETURNED">Returned</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Invoices Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredByStatus.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-600 mb-4">No invoices found</p>
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
//             >
//               Create First Invoice
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Card</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredByStatus.map(invoice => (
//                     <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {invoice.jobCard ? (
//                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-blue-100"
//                                 onClick={() => setSearchJobCard(invoice.jobCard.jobNumber)}>
//                             {invoice.jobCard.jobNumber}
//                           </span>
//                         ) : (
//                           <span className="text-gray-500 text-sm">Direct Sale</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-gray-900">{invoice.customerName}</td>
//                       <td className="px-6 py-4 font-semibold text-gray-900">Rs.{(invoice.total ?? 0).toFixed(2)}</td>
//                       <td className="px-6 py-4 text-green-600 font-semibold">Rs.{(invoice.paidAmount ?? 0).toFixed(2)}</td>
//                       <td className="px-6 py-4 font-semibold text-gray-900">Rs.{(invoice.balance ?? 0).toFixed(2)}</td>
//                       <td className="px-6 py-4">
//                         {getStatusBadge(invoice)}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {new Date(invoice.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => setViewingInvoice(invoice.id)}
//                             className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline"
//                           >
//                             View
//                           </button>
                          
//                           {/* Edit Button - only for unpaid/partial invoices and not returned */}
//                           {!invoice.isReturned && (invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIAL') && (
//                             <button
//                               onClick={() => setEditingInvoice(invoice.id)}
//                               className="text-green-600 hover:text-green-900 font-medium text-sm hover:underline"
//                             >
//                               Edit
//                             </button>
//                           )}
                          
//                           {/* DELETE Button - ONLY for ROLE_ADMIN users and NOT for PAID or RETURNED invoices */}
//                           {isAdmin() && !invoice.isReturned && invoice.paymentStatus !== 'PAID' && (
//                             <button
//                               onClick={() => handleDeleteInvoice(invoice.id)}
//                               className="text-red-600 hover:text-red-900 font-medium text-sm hover:underline"
//                             >
//                               Delete
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {hasMoreInvoices && (
//               <div className="flex justify-center py-4 border-t border-gray-200">
//                 <button
//                   onClick={handleSeeMore}
//                   className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
//                 >
//                   See More ({invoices.length - displayCount} remaining)
//                 </button>
//               </div>
//             )}

//             <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
//               <p className="text-sm text-gray-600">
//                 Showing {filteredByStatus.length} of {invoices.length} invoices
//                 {hasMoreInvoices && ` • Load more to see older invoices`}
//               </p>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Stats Summary */}
//       {filteredByStatus.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white p-4 rounded-lg shadow">
//             <p className="text-xs text-gray-600 font-medium mb-1">Total Invoices</p>
//             <p className="text-2xl font-bold text-gray-900">{filteredByStatus.length}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <p className="text-xs text-gray-600 font-medium mb-1">Total Revenue</p>
//             <p className="text-2xl font-bold text-gray-900">
//               Rs.{filteredByStatus.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <p className="text-xs text-gray-600 font-medium mb-1">Total Collected</p>
//             <p className="text-2xl font-bold text-green-600">
//               Rs.{filteredByStatus.reduce((sum, inv) => sum + inv.paidAmount, 0).toFixed(2)}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <p className="text-xs text-gray-600 font-medium mb-1">Total Outstanding</p>
//             <p className="text-2xl font-bold text-red-600">
//               Rs.{filteredByStatus.filter(inv => !inv.isReturned).reduce((sum, inv) => sum + inv.balance, 0).toFixed(2)}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InvoiceList;








import { useState, useEffect, useRef } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import InvoiceView from './InvoiceView';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceEdit from './InvoiceEdit';
import { BrowserMultiFormatReader } from '@zxing/browser';

const InvoiceList = () => {
  const { isAdmin } = useAuth();
  
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
  
  // ✅ NEW: Year and Month Filter States
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // ✅ Month options
  const MONTHS = [
    { value: 'ALL', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

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
      
      // ✅ Extract available years from invoices
      const years = [...new Set(sortedInvoices.map(inv => new Date(inv.createdAt).getFullYear()))];
      setAvailableYears(years.sort((a, b) => b - a)); // Sort descending (newest first)
      
      // ✅ Apply initial filter (current year)
      filterInvoicesByDate(sortedInvoices, selectedYear, selectedMonth);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error(err);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchInvoices();
  }, []);

  // ✅ NEW: Filter invoices by year and month
  const filterInvoicesByDate = (invoiceList, year, month) => {
    let filtered = invoiceList;

    // Filter by year
    if (year !== 'ALL') {
      filtered = filtered.filter(inv => {
        const invYear = new Date(inv.createdAt).getFullYear();
        return invYear === parseInt(year);
      });
    }

    // Filter by month
    if (month !== 'ALL') {
      filtered = filtered.filter(inv => {
        const invMonth = new Date(inv.createdAt).getMonth();
        return invMonth === parseInt(month);
      });
    }

    setInvoices(filtered);
    setDisplayCount(10);
  };

  // ✅ Effect to apply date filter when year or month changes
  useEffect(() => {
    filterInvoicesByDate(allInvoices, selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, allInvoices]);

  useEffect(() => {
    setDisplayedInvoices(invoices.slice(0, displayCount));
  }, [invoices, displayCount]);

  useEffect(() => {
    if (!searchJobCard.trim()) {
      filterInvoices('', searchCustomer, filterStatus);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = invoices.filter(inv => 
        inv.jobCard?.jobNumber?.toLowerCase().includes(searchJobCard.toLowerCase())
      );
      setDisplayedInvoices(filtered.slice(0, displayCount));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchJobCard, invoices, displayCount]);

  useEffect(() => {
    if (!searchCustomer.trim()) {
      filterInvoices(searchJobCard, '', filterStatus);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = invoices.filter(inv => 
        inv.customerName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchCustomer.toLowerCase())
      );
      setDisplayedInvoices(filtered.slice(0, displayCount));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCustomer, invoices, displayCount]);

  const filterInvoices = (jobCard, customer, status) => {
    let filtered = invoices;

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
      // Handle RETURNED status filter
      if (status === 'RETURNED') {
        filtered = filtered.filter(inv => inv.isReturned === true);
      } else {
        filtered = filtered.filter(inv => 
          !inv.isReturned && inv.paymentStatus === status
        );
      }
    }

    setDisplayedInvoices(filtered.slice(0, displayCount));
  };

  // ✅ Effect to apply status filter when status changes
  useEffect(() => {
    filterInvoices(searchJobCard, searchCustomer, filterStatus);
  }, [filterStatus]);

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

  const getStatusBadge = (invoice) => {
    // Check if invoice is returned
    if (invoice.isReturned) {
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            RETURNED
          </span>
        </div>
      );
    }
    
    // Regular payment status
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      UNPAID: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[invoice.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
        {invoice.paymentStatus}
      </span>
    );
  };

  // ✅ NEW: Reset all filters
  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth('ALL');
    setSearchJobCard('');
    setSearchCustomer('');
    setFilterStatus('ALL');
    setDisplayCount(10);
  };

  const filteredByStatus = filterStatus === 'ALL' 
    ? displayedInvoices 
    : displayedInvoices.filter(inv => {
        if (filterStatus === 'RETURNED') {
          return inv.isReturned === true;
        } else {
          return !inv.isReturned && inv.paymentStatus === filterStatus;
        }
      });

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

      {/* ✅ NEW: Year/Month Filter Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
              Showing: {selectedMonth === 'ALL' ? 'All Months' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </span>
          </div>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
          >
            <span>{showDateFilter ? 'Hide' : 'Show'} Filters</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showDateFilter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="ALL">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year} {year === new Date().getFullYear() && '(Current)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* ✅ Date Range Summary */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-700">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <strong>{invoices.length}</strong> invoices found
            </span>
            {selectedMonth !== 'ALL' && (
              <span className="text-blue-600 font-medium">
                in {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            )}
            {selectedMonth === 'ALL' && selectedYear !== 'ALL' && (
              <span className="text-blue-600 font-medium">
                in year {selectedYear}
              </span>
            )}
            {selectedYear === 'ALL' && (
              <span className="text-blue-600 font-medium">
                across all years
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Bars */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
              <option value="RETURNED">Returned</option>
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
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-2">No invoices found</p>
            <p className="text-sm text-gray-500 mb-4">
              {selectedMonth !== 'ALL' 
                ? `No invoices in ${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                : selectedYear !== 'ALL'
                ? `No invoices in year ${selectedYear}`
                : 'Try adjusting your filters or create a new invoice'
              }
            </p>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
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
                        {getStatusBadge(invoice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline"
                          >
                            View
                          </button>
                          
                          {/* Edit Button - only for unpaid/partial invoices and not returned */}
                          {!invoice.isReturned && (invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIAL') && (
                            <button
                              onClick={() => setEditingInvoice(invoice.id)}
                              className="text-green-600 hover:text-green-900 font-medium text-sm hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          
                          {/* DELETE Button - ONLY for ROLE_ADMIN users and NOT for PAID or RETURNED invoices */}
                          {isAdmin() && !invoice.isReturned && invoice.paymentStatus !== 'PAID' && (
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

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredByStatus.length} of {invoices.length} invoices
                {selectedMonth !== 'ALL' && ` in ${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
                {selectedMonth === 'ALL' && selectedYear !== 'ALL' && ` in year ${selectedYear}`}
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
              Rs.{filteredByStatus.filter(inv => !inv.isReturned).reduce((sum, inv) => sum + inv.balance, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;