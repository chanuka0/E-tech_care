

import { useState, useEffect, useMemo } from 'react';
import { useApi } from '../services/apiService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StockReport = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Date range - removed future date restriction
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Report data with safe defaults matching your backend structure
  const [summary, setSummary] = useState({
    totalMovements: 0,
    totalQuantityIn: 0,
    totalQuantityOut: 0,
    netChange: 0,
    inMovements: 0,
    outMovements: 0,
    adjustments: 0,
    totalItems: 0,
    totalCurrentStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [movements, setMovements] = useState([]);
  const [itemReport, setItemReport] = useState([]);
  const [trends, setTrends] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      // Format dates to match your backend LocalDateTime format
      const start = `${startDate}T00:00:00`;
      const end = `${endDate}T23:59:59`;

      // API calls matching your StockReportController endpoints
      const apiCalls = [
        apiCall(`/api/reports/stock/summary?startDate=${start}&endDate=${end}`),
        apiCall(`/api/reports/stock/movements?startDate=${start}&endDate=${end}`),
        apiCall(`/api/reports/stock/by-item?startDate=${start}&endDate=${end}`),
        apiCall(`/api/reports/stock/trends?startDate=${start}&endDate=${end}`),
        apiCall(`/api/reports/stock/most-used?startDate=${start}&endDate=${end}&limit=10`),
        apiCall('/api/reports/stock/by-category')
      ];

      const responses = await Promise.allSettled(apiCalls);

      // Handle responses with your specific data structure
      const [
        summaryResponse,
        movementsResponse,
        itemReportResponse,
        trendsResponse,
        mostUsedResponse,
        categoryResponse
      ] = responses.map((response, index) => {
        if (response.status === 'fulfilled' && response.value) {
          return response.value;
        } else {
          console.warn(`API call ${index} failed:`, response.reason);
          // Return safe defaults based on your endpoints
          switch (index) {
            case 0: return {
              totalMovements: 0, totalQuantityIn: 0, totalQuantityOut: 0, netChange: 0,
              inMovements: 0, outMovements: 0, adjustments: 0, totalItems: 0,
              totalCurrentStock: 0, lowStockItems: 0, outOfStockItems: 0
            };
            case 1: return [];
            case 2: return [];
            case 3: return [];
            case 4: return [];
            case 5: return [];
            default: return null;
          }
        }
      });

      setSummary(summaryResponse);
      setMovements(movementsResponse || []);
      setItemReport(itemReportResponse || []);
      setTrends(trendsResponse || []);
      setMostUsed(mostUsedResponse || []);
      setCategoryReport(categoryResponse || []);

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter movements based on your StockMovement entity structure
  const filteredMovements = useMemo(() => {
    if (!movements || !Array.isArray(movements)) return [];
    
    return movements.filter(movement => {
      if (!movement) return false;
      
      const item = movement.inventoryItem || {};
      
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'ALL' || movement.movementType === filterType;
      const matchesItem = !selectedItem || item.id === selectedItem;
      
      return matchesSearch && matchesType && matchesItem;
    });
  }, [movements, searchTerm, filterType, selectedItem]);

  const displayedMovements = filteredMovements.slice(0, displayCount);

  // Enhanced CSV export matching your StockMovement entity
  const handleExportExcel = () => {
    try {
      const csvContent = generateCSV(filteredMovements);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV file');
    }
  };

  const generateCSV = (data) => {
    const headers = [
      'Date', 'Time', 'Item Name', 'SKU', 'Movement Type', 'Quantity', 
      'Reference Type', 'Reference Number', 'Serial Number', 'Reason', 
      'Notes', 'Performed By', 'Previous Qty', 'New Qty'
    ];
    
    const rows = data.map(movement => {
      const item = movement.inventoryItem || {};
      const date = new Date(movement.createdAt);
      
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        item.name || '',
        item.sku || '',
        movement.movementType || '',
        movement.quantity || 0,
        movement.referenceType || '',
        movement.referenceNumber || '',
        movement.serialNumber || '',
        movement.reason || '',
        movement.notes || '',
        movement.performedBy || 'System',
        movement.previousQuantity || 0,
        movement.newQuantity || 0
      ];
    });
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Safe data checks
  const hasData = summary && Object.keys(summary).length > 0;
  const hasMovements = movements && movements.length > 0;
  const hasItemReport = itemReport && itemReport.length > 0;
  const hasTrends = trends && trends.length > 0;
  const hasMostUsed = mostUsed && mostUsed.length > 0;
  const hasCategoryReport = categoryReport && categoryReport.length > 0;

  if (loading && !hasData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading stock report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen print:bg-white">
      {/* Header */}
      <div className="flex justify-between items-center print:block">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Stock Movement Report</h1>
          <p className="text-gray-600 mt-1">Track inventory movements, trends, and analytics</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handleExportExcel}
            disabled={!hasMovements}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>

        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Date Range Selector - Removed future date restriction */}
      <div className="bg-white rounded-lg shadow p-4 print:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:bg-gray-400 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>
      </div>

      {hasData && (
        <>
          {/* Enhanced Summary Cards matching your backend data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Movements</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalMovements}</p>
                  <p className="text-blue-100 text-xs mt-2">All transactions</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Stock In</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalQuantityIn}</p>
                  <p className="text-green-100 text-xs mt-2">{summary.inMovements} transactions</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Stock Out</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalQuantityOut}</p>
                  <p className="text-red-100 text-xs mt-2">{summary.outMovements} transactions</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Net Change</p>
                  <p className={`text-3xl font-bold mt-2 ${summary.netChange >= 0 ? 'text-white' : 'text-red-200'}`}>
                    {summary.netChange >= 0 ? '+' : ''}{summary.netChange}
                  </p>
                  <p className="text-purple-100 text-xs mt-2">
                    {summary.adjustments} adjustments
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Inventory Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalItems}</p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{summary.lowStockItems}</p>
                </div>
                <div className="text-orange-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{summary.outOfStockItems}</p>
                </div>
                <div className="text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Movement Trends Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📈 Daily Stock Movement Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              {hasTrends ? (
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inQuantity" stroke="#10b981" strokeWidth={2} name="Stock In" />
                  <Line type="monotone" dataKey="outQuantity" stroke="#ef4444" strokeWidth={2} name="Stock Out" />
                  <Line type="monotone" dataKey="netQuantity" stroke="#3b82f6" strokeWidth={2} name="Net Change" />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No trend data available for the selected period
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Used Items */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">🔥 Most Used Items (Top 10)</h2>
              <ResponsiveContainer width="100%" height={300}>
                {hasMostUsed ? (
                  <BarChart data={mostUsed} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="itemName" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="totalUsed" fill="#3b82f6" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No usage data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📦 Stock by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                {hasCategoryReport ? (
                  <PieChart>
                    <Pie
                      data={categoryReport}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, totalStock }) => `${category}: ${totalStock}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalStock"
                    >
                      {categoryReport.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Stock']} />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No category data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Item-Wise Report Table */}
          <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Item-Wise Stock Report</h2>
            {hasItemReport ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">SKU</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Category</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Current Stock</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Stock In</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Stock Out</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Adjustments</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Net Change</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Movements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemReport.map((item, index) => (
                      <tr key={item.itemId || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                            {item.hasSerialization && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Serialized</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-600">{item.category || 'Uncategorized'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-semibold ${item.currentStock <= item.minThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-green-600 font-semibold">+{item.totalIn}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-red-600 font-semibold">-{item.totalOut}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-yellow-600 font-semibold">{item.adjustments}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-semibold ${item.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.netChange >= 0 ? '+' : ''}{item.netChange}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {item.movementCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No item report data available
              </div>
            )}
          </div>

          {/* Detailed Movements Table */}
          <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">📝 Detailed Stock Movements</h2>
              <span className="text-sm text-gray-600">
                Showing {displayedMovements.length} of {filteredMovements.length} movements
              </span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search item, SKU, serial, reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                <select
                  value={selectedItem || ''}
                  onChange={(e) => setSelectedItem(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Items</option>
                  {itemReport.map(item => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasMovements ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Item</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Serial</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">By</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedMovements.map((movement, index) => (
                        <tr key={movement.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">
                                {new Date(movement.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-gray-500">
                                {new Date(movement.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{movement.inventoryItem?.name}</p>
                              <p className="text-xs text-gray-500">{movement.inventoryItem?.sku}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              movement.movementType === 'IN' ? 'bg-green-100 text-green-800' :
                              movement.movementType === 'OUT' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {movement.movementType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${
                              movement.movementType === 'IN' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs">
                              <p className="text-gray-900">{movement.referenceNumber || '-'}</p>
                              <p className="text-gray-500">{movement.referenceType || '-'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                            {movement.serialNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {movement.performedBy || 'System'}
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            <div>
                              <p className="text-gray-500">{movement.previousQuantity} →</p>
                              <p className="font-semibold text-gray-900">{movement.newQuantity}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {displayCount < filteredMovements.length && (
                  <div className="flex justify-center mt-6 print:hidden">
                    <button
                      onClick={() => setDisplayCount(prev => prev + 20)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Show More ({filteredMovements.length - displayCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No movement data available for the selected period
              </div>
            )}
          </div>
        </>
      )}

      {!hasData && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-600 mb-4">Select a date range and generate a stock report to see data</p>
          <button
            onClick={fetchReportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default StockReport;