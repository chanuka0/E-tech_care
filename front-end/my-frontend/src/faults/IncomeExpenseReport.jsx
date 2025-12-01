import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const IncomeExpenseReport = () => {
  const { apiCall } = useApi();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchReport = async (start, end) => {
    setLoading(true);
    try {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      const data = await apiCall(`/api/reports/income-expenses?startDate=${startStr}&endDate=${endStr}`);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateRange.startDate, dateRange.endDate);
  }, []);

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    setDateRange(prev => ({ ...prev, startDate: newStartDate }));
    if (newStartDate && dateRange.endDate) {
      fetchReport(newStartDate, dateRange.endDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    setDateRange(prev => ({ ...prev, endDate: newEndDate }));
    if (dateRange.startDate && newEndDate) {
      fetchReport(dateRange.startDate, newEndDate);
    }
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

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Income & Expenses Report</h1>
        <div className="flex space-x-3">
          <button
            onClick={loadLast30Days}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={loadCurrentMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date Range
        </label>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={formatDateForInput(dateRange.startDate)}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={formatDateForInput(dateRange.endDate)}
              onChange={handleEndDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Income</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    Rs.{report.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-green-700 text-sm mt-3">
                {report.totalInvoices} invoices
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    Rs.{report.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-red-700 text-sm mt-3">
                {report.totalExpensesCount} expenses
              </p>
            </div>

            <div className={`bg-gradient-to-br ${report.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-300' : 'from-orange-50 to-orange-100 border-orange-300'} border-2 p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    Net Profit/Loss
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${report.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    Rs.{report.netProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${report.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className={`text-sm mt-3 ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {report.netProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Date Range</p>
                  <p className="text-lg font-bold text-purple-900 mt-2">
                    {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-700 text-sm mt-3">
                {Math.ceil((new Date(report.endDate) - new Date(report.startDate)) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Net
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(report.dailyBreakdown)
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, daily]) => (
                      <tr key={date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          Rs.{daily.income.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          Rs.{daily.expenses.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          (daily.income - daily.expenses) >= 0 ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          Rs.{(daily.income - daily.expenses).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Visualization */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Income vs Expenses Trend</h2>
            <div className="space-y-4">
              {Object.entries(report.dailyBreakdown)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .map(([date, daily]) => {
                  const maxValue = Math.max(report.totalIncome, report.totalExpenses);
                  const incomeWidth = (daily.income / maxValue) * 100;
                  const expensesWidth = (daily.expenses / maxValue) * 100;
                  
                  return (
                    <div key={date} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <span>Net: Rs.{(daily.income - daily.expenses).toFixed(2)}</span>
                      </div>
                      <div className="flex space-x-1 h-6">
                        <div 
                          className="bg-green-500 rounded-l transition-all duration-500"
                          style={{ width: `${incomeWidth}%` }}
                          title={`Income: Rs.${daily.income.toFixed(2)}`}
                        ></div>
                        <div 
                          className="bg-red-500 rounded-r transition-all duration-500"
                          style={{ width: `${expensesWidth}%` }}
                          title={`Expenses: Rs.${daily.expenses.toFixed(2)}`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeExpenseReport;