import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ReportsDashboard = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days
  
  const [dashboardData, setDashboardData] = useState({
    jobCardStats: {},
    invoiceStats: {},
    inventoryStats: {},
    revenueData: [],
    jobCardTrend: [],
    topSellingItems: [],
    lowStockItems: [],
    serviceBreakdown: [],
    paymentStatusBreakdown: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const [
        jobCards,
        invoices,
        inventory,
        stockMovements,
        serviceCategories
      ] = await Promise.all([
        apiCall('/api/jobcards'),
        apiCall('/api/invoices'),
        apiCall('/api/inventory'),
        apiCall('/api/inventory/stock-movements'),
        apiCall('/api/service-categories')
      ]);

      // Filter by date range
      const filteredJobCards = jobCards.filter(jc => 
        new Date(jc.createdAt) >= startDate && new Date(jc.createdAt) <= endDate
      );
      
      const filteredInvoices = invoices.filter(inv => 
        new Date(inv.createdAt) >= startDate && new Date(inv.createdAt) <= endDate
      );

      // Calculate job card stats
      const jobCardStats = {
        total: filteredJobCards.length,
        pending: filteredJobCards.filter(jc => jc.status === 'PENDING').length,
        inProgress: filteredJobCards.filter(jc => jc.status === 'IN_PROGRESS').length,
        completed: filteredJobCards.filter(jc => jc.status === 'COMPLETED').length,
        delivered: filteredJobCards.filter(jc => jc.status === 'DELIVERED').length,
        cancelled: filteredJobCards.filter(jc => jc.status === 'CANCELLED').length,
        oneDayService: filteredJobCards.filter(jc => jc.oneDayService).length
      };

      // Calculate invoice stats
      const invoiceStats = {
        total: filteredInvoices.length,
        totalRevenue: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
        totalCollected: filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        totalOutstanding: filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0),
        paid: filteredInvoices.filter(inv => inv.paymentStatus === 'PAID').length,
        partial: filteredInvoices.filter(inv => inv.paymentStatus === 'PARTIAL').length,
        unpaid: filteredInvoices.filter(inv => inv.paymentStatus === 'UNPAID').length
      };

      // Calculate inventory stats
      const inventoryStats = {
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0),
        lowStockItems: inventory.filter(item => item.quantity <= item.minThreshold).length,
        outOfStockItems: inventory.filter(item => item.quantity === 0).length
      };

      // Revenue trend (daily)
      const revenueData = generateDailyRevenue(filteredInvoices, parseInt(dateRange));

      // Job card trend (daily)
      const jobCardTrend = generateDailyJobCards(filteredJobCards, parseInt(dateRange));

      // Top selling items
      const topSellingItems = calculateTopSellingItems(stockMovements, inventory);

      // Low stock items
      const lowStockItems = inventory
        .filter(item => item.quantity <= item.minThreshold)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10);

      // Service breakdown
      const serviceBreakdown = calculateServiceBreakdown(filteredJobCards, serviceCategories);

      // Payment status breakdown
      const paymentStatusBreakdown = [
        { name: 'Paid', value: invoiceStats.paid, color: '#10b981' },
        { name: 'Partial', value: invoiceStats.partial, color: '#f59e0b' },
        { name: 'Unpaid', value: invoiceStats.unpaid, color: '#ef4444' }
      ];

      setDashboardData({
        jobCardStats,
        invoiceStats,
        inventoryStats,
        revenueData,
        jobCardTrend,
        topSellingItems,
        lowStockItems,
        serviceBreakdown,
        paymentStatusBreakdown
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyRevenue = (invoices, days) => {
    const data = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= date && invDate < nextDate;
      });
      
      const revenue = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const collected = dayInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(revenue),
        collected: Math.round(collected)
      });
    }
    
    return data;
  };

  const generateDailyJobCards = (jobCards, days) => {
    const data = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayJobCards = jobCards.filter(jc => {
        const jcDate = new Date(jc.createdAt);
        return jcDate >= date && jcDate < nextDate;
      });
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: dayJobCards.length,
        completed: dayJobCards.filter(jc => jc.status === 'COMPLETED').length
      });
    }
    
    return data;
  };

  const calculateTopSellingItems = (movements, inventory) => {
    const itemSales = {};
    
    movements.forEach(movement => {
      if (movement.movementType === 'OUT' && movement.inventoryItem) {
        const itemId = movement.inventoryItem.id;
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            name: movement.inventoryItem.name,
            quantity: 0
          };
        }
        itemSales[itemId].quantity += movement.quantity;
      }
    });
    
    return Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const calculateServiceBreakdown = (jobCards, services) => {
    const serviceCount = {};
    
    jobCards.forEach(jc => {
      if (jc.serviceCategories) {
        jc.serviceCategories.forEach(service => {
          if (!serviceCount[service.id]) {
            serviceCount[service.id] = {
              name: service.name,
              count: 0,
              revenue: 0
            };
          }
          serviceCount[service.id].count++;
          serviceCount[service.id].revenue += service.servicePrice || 0;
        });
      }
    });
    
    return Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and insights</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">Rs.{dashboardData.invoiceStats.totalRevenue?.toFixed(0)}</p>
              <p className="text-blue-100 text-xs mt-2">From {dashboardData.invoiceStats.total} invoices</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Job Cards */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Job Cards</p>
              <p className="text-3xl font-bold mt-2">{dashboardData.jobCardStats.total}</p>
              <p className="text-green-100 text-xs mt-2">
                {dashboardData.jobCardStats.completed} completed
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Outstanding Balance</p>
              <p className="text-3xl font-bold mt-2">Rs.{dashboardData.invoiceStats.totalOutstanding?.toFixed(0)}</p>
              <p className="text-yellow-100 text-xs mt-2">
                From {dashboardData.invoiceStats.partial + dashboardData.invoiceStats.unpaid} invoices
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Inventory Value</p>
              <p className="text-3xl font-bold mt-2">Rs.{dashboardData.inventoryStats.totalValue?.toFixed(0)}</p>
              <p className="text-purple-100 text-xs mt-2">
                {dashboardData.inventoryStats.totalItems} items in stock
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `Rs.${value}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Total Revenue" />
            <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Job Card Trend Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Job Card Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.jobCardTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="created" fill="#3b82f6" name="Created" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.paymentStatusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.paymentStatusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{dashboardData.invoiceStats.paid}</p>
              <p className="text-sm text-gray-600">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.invoiceStats.partial}</p>
              <p className="text-sm text-gray-600">Partial</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{dashboardData.invoiceStats.unpaid}</p>
              <p className="text-sm text-gray-600">Unpaid</p>
            </div>
          </div>
        </div>

        {/* Job Card Status Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Job Card Status</h2>
          <div className="space-y-4">
            <StatusBar 
              label="Pending" 
              count={dashboardData.jobCardStats.pending}
              total={dashboardData.jobCardStats.total}
              color="bg-yellow-500"
            />
            <StatusBar 
              label="In Progress" 
              count={dashboardData.jobCardStats.inProgress}
              total={dashboardData.jobCardStats.total}
              color="bg-blue-500"
            />
            <StatusBar 
              label="Completed" 
              count={dashboardData.jobCardStats.completed}
              total={dashboardData.jobCardStats.total}
              color="bg-green-500"
            />
            <StatusBar 
              label="Delivered" 
              count={dashboardData.jobCardStats.delivered}
              total={dashboardData.jobCardStats.total}
              color="bg-purple-500"
            />
            <StatusBar 
              label="Cancelled" 
              count={dashboardData.jobCardStats.cancelled}
              total={dashboardData.jobCardStats.total}
              color="bg-red-500"
            />
            {dashboardData.jobCardStats.oneDayService > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900">🚨 One Day Service</p>
                  <p className="text-2xl font-bold text-red-700">{dashboardData.jobCardStats.oneDayService}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.topSellingItems} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Service Categories Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Revenue</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Avg Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.serviceBreakdown.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {service.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                    Rs.{service.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    Rs.{(service.revenue / service.count).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {dashboardData.lowStockItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.268 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-red-900">⚠️ Low Stock Alert ({dashboardData.inventoryStats.lowStockItems} items)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.lowStockItems.map((item) => (
              <div key={item.id} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>
                  {item.quantity === 0 && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Current Stock</p>
                    <p className="text-2xl font-bold text-red-600">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Min Threshold</p>
                    <p className="text-lg font-semibold text-gray-700">{item.minThreshold}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component: Status Bar
const StatusBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
    </div>
  );
};

export default ReportsDashboard;