import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const StockMovementReport = () => {
  const { apiCall } = useApi();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterItem, setFilterItem] = useState('');
  const [filterJobCard, setFilterJobCard] = useState('');
  const [filterInvoice, setFilterInvoice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    fetchInventoryItems();
    fetchMovements();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const data = await apiCall('/api/inventory');
      setInventoryItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory items:', err);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/inventory/stock-movements');
      // Sort by date descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMovements(sorted);
    } catch (err) {
      setError('Failed to load stock movements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeColor = (type) => {
    const colors = {
      'IN': 'bg-green-100 text-green-800',
      'OUT': 'bg-red-100 text-red-800',
      'ADJUSTMENT': 'bg-yellow-100 text-yellow-800',
      'RETURN': 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Apply filters
  const filteredMovements = movements.filter(movement => {
    const typeMatch = filterType === 'ALL' || movement.movementType === filterType;
    const itemMatch = filterItem === '' || movement.inventoryItem?.id === parseInt(filterItem);
    const jobCardMatch = filterJobCard === '' || 
      movement.jobCardNumber?.toLowerCase().includes(filterJobCard.toLowerCase());
    const invoiceMatch = filterInvoice === '' || 
      movement.invoiceNumber?.toLowerCase().includes(filterInvoice.toLowerCase());
    
    let dateMatch = true;
    if (startDate && endDate) {
      const movementDate = new Date(movement.createdAt);
      dateMatch = movementDate >= new Date(startDate) && movementDate <= new Date(endDate);
    }
    
    return typeMatch && itemMatch && jobCardMatch && invoiceMatch && dateMatch;
  });

  const displayedMovements = filteredMovements.slice(0, displayCount);
  const hasMoreMovements = filteredMovements.length > displayCount;

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Item', 'Quantity', 'Job Card', 'Invoice', 'Notes'];
    const rows = filteredMovements.map(m => [
      new Date(m.createdAt).toLocaleString(),
      m.movementType,
      m.inventoryItem?.name || 'N/A',
      m.quantity,
      m.jobCardNumber || 'N/A',
      m.invoiceNumber || 'N/A',
      m.notes || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setFilterType('ALL');
    setFilterItem('');
    setFilterJobCard('');
    setFilterInvoice('');
    setStartDate('');
    setEndDate('');
    setDisplayCount(20);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Stock Movement Report</h2>
          <p className="text-gray-600 mt-1">Track all inventory movements with job card & invoice references</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {(filterType !== 'ALL' || filterItem || filterJobCard || filterInvoice || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Movement Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="RETURN">Return</option>
            </select>
          </div>

          {/* Item Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inventory Item</label>
            <select
              value={filterItem}
              onChange={(e) => {
                setFilterItem(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Items</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* Job Card Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Card Number</label>
            <input
              type="text"
              placeholder="Enter job card number..."
              value={filterJobCard}
              onChange={(e) => {
                setFilterJobCard(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Invoice Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
            <input
              type="text"
              placeholder="Enter invoice number..."
              value={filterInvoice}
              onChange={(e) => {
                setFilterInvoice(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDisplayCount(20);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 font-medium mb-1">Total Movements</p>
          <p className="text-2xl font-bold text-gray-900">{filteredMovements.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <p className="text-xs text-green-600 font-medium mb-1">Stock In</p>
          <p className="text-2xl font-bold text-green-700">
            {filteredMovements.filter(m => m.movementType === 'IN').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <p className="text-xs text-red-600 font-medium mb-1">Stock Out</p>
          <p className="text-2xl font-bold text-red-700">
            {filteredMovements.filter(m => m.movementType === 'OUT').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Adjustments/Returns</p>
          <p className="text-2xl font-bold text-blue-700">
            {filteredMovements.filter(m => m.movementType === 'ADJUSTMENT' || m.movementType === 'RETURN').length}
          </p>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : displayedMovements.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Movements Found</h3>
            <p className="text-gray-500">No stock movements match your filter criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Serial Numbers</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Card</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedMovements.map(movement => (
                    <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMovementTypeColor(movement.movementType)}`}>
                          {movement.movementType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{movement.inventoryItem?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">SKU: {movement.inventoryItem?.sku || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${movement.movementType === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {movement.serialNumbers && movement.serialNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {movement.serialNumbers.map((serial, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                {serial}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No Serials</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {movement.jobCardNumber ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {movement.jobCardNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {movement.invoiceNumber ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {movement.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {movement.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* See More Button */}
            {hasMoreMovements && (
              <div className="flex justify-center py-4 border-t border-gray-200">
                <button
                  onClick={() => setDisplayCount(prev => prev + 20)}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
                >
                  See More ({filteredMovements.length - displayCount} remaining)
                </button>
              </div>
            )}

            {/* Display Info */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {displayedMovements.length} of {filteredMovements.length} movements
                {hasMoreMovements && ` • Load more to see older movements`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockMovementReport;