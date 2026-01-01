import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const IncomeExpenseReport = () => {
  const { apiCall } = useApi();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  // ✅ FIXED: Use correct date format for API (YYYY-MM-DD)
  const fetchReport = async (start, end) => {
    setLoading(true);
    setError('');
    try {
      const startStr = start.toISOString().split('T')[0]; // YYYY-MM-DD
      const endStr = end.toISOString().split('T')[0];     // YYYY-MM-DD
      
      console.log(`Fetching report from ${startStr} to ${endStr}`);
      
      const data = await apiCall(
        `/api/reports/income-expenses?startDate=${startStr}&endDate=${endStr}`
      );
      
      if (data) {
        setReport(data);
        console.log('Report data:', data);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setError(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateRange.startDate, dateRange.endDate);
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDate = new Date(value);
    
    setDateRange(prev => ({
      ...prev,
      [name]: newDate
    }));
  };

  const handleApply = () => {
    if (dateRange.startDate > dateRange.endDate) {
      setError('Start date must be before end date');
      return;
    }
    fetchReport(dateRange.startDate, dateRange.endDate);
  };

  const loadCurrentMonth = () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date();
    setDateRange({ startDate: start, endDate: end });
    fetchReport(start, end);
  };

  const loadLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setDateRange({ startDate: start, endDate: end });
    fetchReport(start, end);
  };

  const exportToCSV = () => {
    if (!report) return;

    const rows = [
      ['Income & Expense Report'],
      [`From: ${report.startDate} To: ${report.endDate}`],
      [''],
      ['Summary'],
      ['Total Income', report.totalIncome.toFixed(2)],
      ['Total Expenses', report.totalExpenses.toFixed(2)],
      ['Net Profit/Loss', report.netProfit.toFixed(2)],
      [''],
      ['Daily Breakdown'],
      ['Date', 'Income', 'Expenses', 'Net']
    ];

    // Add daily data
    Object.entries(report.dailyBreakdown || {}).forEach(([date, daily]) => {
      rows.push([
        date,
        daily.income.toFixed(2),
        daily.expenses.toFixed(2),
        (daily.income - daily.expenses).toFixed(2)
      ]);
    });

    const csvContent = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-expense-report-${dateRange.startDate.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading income & expense report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Income & Expenses Report</h1>
          <p className="text-gray-600 mt-1">Track your business income and expenses over time</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadLast30Days}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Last 30 Days
          </button>
          <button
            onClick={loadCurrentMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            This Month
          </button>
          {report && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      {/* Date Picker */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Income</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    Rs.{report.totalIncome.toFixed(2)}
                  </p>
                  <p className="text-green-700 text-xs mt-2">
                    ✅ From {report.totalInvoices} paid invoices
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    Rs.{report.totalExpenses.toFixed(2)}
                  </p>
                  <p className="text-red-700 text-xs mt-2">
                    From {report.totalExpensesCount} transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className={`bg-gradient-to-br ${report.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-300' : 'from-orange-50 to-orange-100 border-orange-300'} border-2 p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {report.netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${report.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    Rs.{report.netProfit.toFixed(2)}
                  </p>
                  <p className={`text-xs mt-2 ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {report.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${report.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Date Range</p>
                  <p className="text-lg font-bold text-purple-900 mt-2">
                    {Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))} days
                  </p>
                  <p className="text-purple-700 text-xs mt-2">
                    {report.startDate} to {report.endDate}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">📋 Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Income</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Daily Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(report.dailyBreakdown || {})
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, daily]) => {
                      const net = daily.income - daily.expenses;
                      return (
                        <tr key={date} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{date}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            <span className="text-green-600 font-semibold">
                              Rs.{daily.income.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <span className="text-red-600 font-semibold">
                              Rs.{daily.expenses.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <span className={`font-semibold ${net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              Rs.{net.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">Select dates and click "Apply" to generate report</p>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseReport;