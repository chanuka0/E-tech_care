
import { useState, useEffect, useMemo } from 'react';

// ─── Constants ──────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const STATUS_STYLES = {
  PENDING:                'bg-yellow-100 text-yellow-800',
  IN_PROGRESS:            'bg-blue-100 text-blue-800',
  COMPLETED:              'bg-green-100 text-green-800',
  DELIVERED:              'bg-purple-100 text-purple-800',
  WAITING_FOR_PARTS:      'bg-orange-100 text-orange-800',
  WAITING_FOR_APPROVAL:   'bg-indigo-100 text-indigo-800',
  CANCELLED:              'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_STYLES = {
  UNPAID:           'bg-red-100 text-red-800',
  PARTIALLY_PAID:   'bg-yellow-100 text-yellow-800',
  PAID:             'bg-green-100 text-green-800',
  FULLY_PAID:       'bg-green-100 text-green-800',
  REFUNDED:         'bg-purple-100 text-purple-800',
  RETURNED:         'bg-gray-100 text-gray-800',
};

const MONTHS = [
  { value: 'all', label: 'All Months' },
  { value: 0,    label: 'January' },
  { value: 1,    label: 'February' },
  { value: 2,    label: 'March' },
  { value: 3,    label: 'April' },
  { value: 4,    label: 'May' },
  { value: 5,    label: 'June' },
  { value: 6,    label: 'July' },
  { value: 7,    label: 'August' },
  { value: 8,    label: 'September' },
  { value: 9,    label: 'October' },
  { value: 10,   label: 'November' },
  { value: 11,   label: 'December' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatRs = (value) => 'Rs.' + (value != null ? Number(value).toFixed(2) : '0.00');

/** Extract unique years from a list of items using a date field, sorted desc */
const getYearsFrom = (items, dateField) => {
  const years = new Set();
  (items || []).forEach((item) => {
    if (item[dateField]) years.add(new Date(item[dateField]).getFullYear());
  });
  return [...years].sort((a, b) => b - a);
};

/** Filter items by selected year + month */
const filterByDate = (items, dateField, selectedYear, selectedMonth) => {
  return (items || []).filter((item) => {
    if (!item[dateField]) return false;
    const d = new Date(item[dateField]);
    if (selectedYear !== 'all' && d.getFullYear() !== selectedYear) return false;
    if (selectedMonth !== 'all' && d.getMonth() !== selectedMonth) return false;
    return true;
  });
};

// ─── Reusable Small Components ──────────────────────────────────────────────

const StatCard = ({ label, value, colorClass }) => (
  <div className={`p-4 rounded-lg border-2 ${colorClass}`}>
    <p className="text-xs font-semibold mb-1 uppercase tracking-wide opacity-75">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const SectionHeader = ({ title, count }) => (
  <div className="flex items-center justify-between mb-3">
    <h4 className="font-semibold text-gray-900 text-base">{title}</h4>
    {count != null && (
      <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{count}</span>
    )}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-10 text-gray-400">
    <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
  </div>
);

/** Year + Month filter bar — shared by JobCards and Invoices tabs */
const DateFilterBar = ({ years, selectedYear, selectedMonth, onYearChange, onMonthChange }) => (
  <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
    {/* Year selector */}
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
      <select
        value={selectedYear}
        onChange={(e) => { onYearChange(e.target.value === 'all' ? 'all' : Number(e.target.value)); onMonthChange('all'); }}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}{y === CURRENT_YEAR ? ' (Current)' : ''}</option>
        ))}
      </select>
    </div>

    {/* Month selector */}
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>

    {/* Reset button — only show when not on default */}
    {(selectedYear !== CURRENT_YEAR || selectedMonth !== 'all') && (
      <button
        type="button"
        onClick={() => { onYearChange(CURRENT_YEAR); onMonthChange('all'); }}
        className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
      >
        Reset to current year
      </button>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const CustomerDetailsModal = ({ customer, onClose, onRefresh, apiCall }) => {
  // ── Credit state
  const [creditAmount, setCreditAmount]       = useState('');
  const [creditAction, setCreditAction]       = useState('add');
  const [creditLoading, setCreditLoading]     = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');

  // ── Summary data
  const [customerSummary, setCustomerSummary] = useState(null);
  const [summaryLoading, setSummaryLoading]   = useState(true);

  // ── Tab
  const [activeTab, setActiveTab]             = useState('info');

  // ── Expand/collapse rows
  const [expandedJobId, setExpandedJobId]     = useState(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // ── Date filters for Job Cards tab
  const [jobYear,  setJobYear]                = useState(CURRENT_YEAR);
  const [jobMonth, setJobMonth]               = useState('all');

  // ── Date filters for Invoices tab
  const [invYear,  setInvYear]                = useState(CURRENT_YEAR);
  const [invMonth, setInvMonth]               = useState('all');

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (customer?.customerId) fetchCustomerSummary();
  }, [customer]);

  const fetchCustomerSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await apiCall(`/api/customers/${customer.customerId}/summary/detailed`);
      setCustomerSummary(data);
    } catch (err) {
      console.error('Failed to load customer summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Derived / memoised data
  // ────────────────────────────────────────────────────────────────────────────
  const allJobs      = customerSummary?.jobHistory?.jobs      || [];
  const allInvoices  = customerSummary?.paymentHistory?.invoices || [];

  // Years available in data (for the dropdown)
  const jobYears = useMemo(() => getYearsFrom(allJobs, 'createdAt'),           [allJobs]);
  const invYears = useMemo(() => getYearsFrom(allInvoices, 'createdAt'),       [allInvoices]);

  // Filtered lists
  const filteredJobs     = useMemo(() => filterByDate(allJobs,     'createdAt', jobYear, jobMonth), [allJobs, jobYear, jobMonth]);
  const filteredInvoices = useMemo(() => filterByDate(allInvoices, 'createdAt', invYear, invMonth), [allInvoices, invYear, invMonth]);

  // Filtered stats for job cards (recalculated from filtered list)
  const jobStats = useMemo(() => {
    const total     = filteredJobs.length;
    const completed = filteredJobs.filter(j => j.status === 'COMPLETED' || j.status === 'DELIVERED').length;
    const pending   = filteredJobs.filter(j => ['PENDING','IN_PROGRESS','WAITING_FOR_PARTS','WAITING_FOR_APPROVAL'].includes(j.status)).length;
    const cancelled = filteredJobs.filter(j => j.status === 'CANCELLED').length;
    const byStatus  = {};
    filteredJobs.forEach(j => { byStatus[j.status] = (byStatus[j.status] || 0) + 1; });
    return { total, completed, pending, cancelled, byStatus };
  }, [filteredJobs]);

  // Filtered financial stats for invoices
  const invoiceStats = useMemo(() => {
    const totalInvoiced   = filteredInvoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
    const totalPaid       = filteredInvoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
    const totalOutstanding= filteredInvoices.reduce((s, i) => s + (Number(i.balance) || 0), 0);
    return { totalInvoiced, totalPaid, totalOutstanding };
  }, [filteredInvoices]);

  // ────────────────────────────────────────────────────────────────────────────
  // Credit submit
  // ────────────────────────────────────────────────────────────────────────────
  const handleCreditSubmit = async (e) => {
    e.preventDefault();
    if (!creditAmount || parseFloat(creditAmount) <= 0) { setError('Please enter a valid amount'); return; }

    setCreditLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = creditAction === 'add'
        ? `/api/customers/${customer.customerId}/add-credit`
        : `/api/customers/${customer.customerId}/deduct-credit`;

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(creditAmount) }),
      });

      setSuccess(response.message || `Credit ${creditAction === 'add' ? 'added' : 'deducted'} successfully`);
      setCreditAmount('');
      onRefresh();
      fetchCustomerSummary();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${creditAction} credit`);
    } finally {
      setCreditLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // TAB RENDERERS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Information ─────────────────────────────────────────────────────────
  const renderInfoTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Credit Balance"  value={formatRs(customer.creditBalance)}         colorClass="bg-green-50 border-green-300 text-green-700" />
        <StatCard label="Total Visits"    value={customer.totalServiceCount || 0}          colorClass="bg-blue-50 border-blue-300 text-blue-700" />
        <StatCard label="Status"          value={customer.isActive ? 'Active' : 'Inactive'} colorClass={customer.isActive ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'} />
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
        {[
          { label: 'Full Name',   value: customer.customerName },
          { label: 'Phone',       value: customer.phoneNumber },
          { label: 'Email',       value: customer.email },
          { label: 'Address',     value: customer.address || '—' },
          { label: 'Member Since',value: formatDate(customer.createdAt) },
          { label: 'Last Visit',  value: formatDateTime(customer.lastVisit) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between px-4 py-2.5">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className="text-sm text-gray-900 font-semibold text-right max-w-[55%] break-words">{value}</span>
          </div>
        ))}
      </div>

      {customer.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Notes</p>
          <p className="text-sm text-amber-900">{customer.notes}</p>
        </div>
      )}
    </div>
  );

  // ── Job Cards ───────────────────────────────────────────────────────────
  const renderJobCardsTab = () => {
    if (summaryLoading) return <Spinner />;

    return (
      <div className="space-y-4">
        {/* Date filter bar */}
        <DateFilterBar
          years={jobYears}
          selectedYear={jobYear}
          selectedMonth={jobMonth}
          onYearChange={(y) => { setJobYear(y); setExpandedJobId(null); }}
          onMonthChange={(m) => { setJobMonth(m); setExpandedJobId(null); }}
        />

        {/* Stat cards — reflect current filter */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total Jobs"  value={jobStats.total}     colorClass="bg-blue-50 border-blue-300 text-blue-700" />
          <StatCard label="Completed"   value={jobStats.completed} colorClass="bg-green-50 border-green-300 text-green-700" />
          <StatCard label="Pending"     value={jobStats.pending}   colorClass="bg-orange-50 border-orange-300 text-orange-700" />
          <StatCard label="Cancelled"   value={jobStats.cancelled} colorClass="bg-red-50 border-red-300 text-red-700" />
        </div>

        {/* Status pills — only statuses that exist in filtered set */}
        {Object.keys(jobStats.byStatus).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(jobStats.byStatus).map(([status, count]) => (
              <span key={status} className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace(/_/g, ' ')} — {count}
              </span>
            ))}
          </div>
        )}

        {/* Job card list */}
        <div>
          <SectionHeader title="Job Cards" count={filteredJobs.length} />

          {filteredJobs.length === 0 ? (
            <EmptyState message={
              jobYear === 'all' && jobMonth === 'all'
                ? 'No job cards found for this customer'
                : 'No job cards found for the selected period. Try changing the year or month filter.'
            } />
          ) : (
            <div className="space-y-2">
              {filteredJobs.map((job, idx) => {
                const isOpen = expandedJobId === idx;
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Collapsible header */}
                    <button
                      type="button"
                      onClick={() => setExpandedJobId(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-sm text-gray-900 whitespace-nowrap">{job.jobNumber}</span>
                        <span className="text-xs text-gray-500 truncate">{job.deviceType}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-gray-800">{formatRs(job.totalServicePrice)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-700'}`}>
                          {job.status?.replace(/_/g, ' ') || '—'}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created</span>
                            <span className="font-medium text-gray-800">{formatDate(job.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Completed</span>
                            <span className="font-medium text-gray-800">{formatDate(job.completedAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">1-Day Service</span>
                            <span className={`font-semibold ${job.oneDayService ? 'text-green-700' : 'text-gray-500'}`}>{job.oneDayService ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Price</span>
                            <span className="font-semibold text-gray-800">{formatRs(job.totalServicePrice)}</span>
                          </div>
                        </div>

                        {job.faults && job.faults.length > 0 && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase font-semibold">Faults</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {job.faults.map((f, i) => <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{f}</span>)}
                            </div>
                          </div>
                        )}

                        {job.services && job.services.length > 0 && (
                          <div>
                            <span className="text-gray-500 text-xs uppercase font-semibold">Services</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {job.services.map((s, i) => <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Invoices ────────────────────────────────────────────────────────────
  const renderInvoicesTab = () => {
    if (summaryLoading) return <Spinner />;

    return (
      <div className="space-y-4">
        {/* Date filter bar */}
        <DateFilterBar
          years={invYears}
          selectedYear={invYear}
          selectedMonth={invMonth}
          onYearChange={(y) => { setInvYear(y); setExpandedInvoiceId(null); }}
          onMonthChange={(m) => { setInvMonth(m); setExpandedInvoiceId(null); }}
        />

        {/* Stat cards — reflect current filter */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Invoiced"  value={formatRs(invoiceStats.totalInvoiced)}   colorClass="bg-blue-50 border-blue-300 text-blue-700" />
          <StatCard label="Total Paid"      value={formatRs(invoiceStats.totalPaid)}       colorClass="bg-green-50 border-green-300 text-green-700" />
          <StatCard label="Outstanding"     value={formatRs(invoiceStats.totalOutstanding)} colorClass="bg-red-50 border-red-300 text-red-700" />
        </div>

        {/* Invoice list */}
        <div>
          <SectionHeader title="Invoices" count={filteredInvoices.length} />

          {filteredInvoices.length === 0 ? (
            <EmptyState message={
              invYear === 'all' && invMonth === 'all'
                ? 'No invoices found for this customer'
                : 'No invoices found for the selected period. Try changing the year or month filter.'
            } />
          ) : (
            <div className="space-y-2">
              {filteredInvoices.map((inv, idx) => {
                const isOpen      = expandedInvoiceId === idx;
                const statusStyle = PAYMENT_STATUS_STYLES[inv.paymentStatus] || 'bg-gray-100 text-gray-700';
                const paidPercent = inv.total ? Math.min(100, Math.round((Number(inv.paidAmount) / Number(inv.total)) * 100)) : 0;

                return (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Collapsible header */}
                    <button
                      type="button"
                      onClick={() => setExpandedInvoiceId(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-sm text-gray-900 whitespace-nowrap">{inv.invoiceNumber}</span>
                        {inv.jobNumber && <span className="text-xs text-gray-500">Job: {inv.jobNumber}</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-gray-800">{formatRs(inv.total)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}>
                          {inv.paymentStatus?.replace(/_/g, ' ') || '—'}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm space-y-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created</span>
                            <span className="font-medium text-gray-800">{formatDate(inv.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium text-gray-800">{inv.paymentMethod || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-800">{formatRs(inv.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Discount</span>
                            <span className="font-medium text-gray-800">{formatRs(inv.discount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-medium text-gray-800">{formatRs(inv.tax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold text-gray-900">{formatRs(inv.total)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Paid</span>
                            <span className="font-semibold text-green-700">{formatRs(inv.paidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Balance</span>
                            <span className={`font-semibold ${Number(inv.balance) > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatRs(inv.balance)}</span>
                          </div>
                        </div>

                        {/* Payment progress bar */}
                        <div className="pt-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Payment Progress</span>
                            <span>{paidPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Credit ──────────────────────────────────────────────────────────────
  const renderCreditTab = () => (
    <div className="space-y-5">
      {error   && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">{success}</div>}

      <StatCard label="Current Credit Balance" value={formatRs(customer.creditBalance)} colorClass="bg-blue-50 border-blue-300 text-blue-700" />

      <form onSubmit={handleCreditSubmit} className="space-y-4">
        <div className="flex gap-2">
          {['add', 'deduct'].map((action) => (
            <label
              key={action}
              className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors
                ${creditAction === action
                  ? (action === 'add' ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50')
                  : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name="action"
                value={action}
                checked={creditAction === action}
                onChange={(e) => setCreditAction(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{action} Credit</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={creditAmount}
            onChange={(e) => { setCreditAmount(e.target.value); setError(''); }}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={creditLoading}
          className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors
            ${creditAction === 'add'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
              : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'}`}
        >
          {creditLoading ? 'Processing...' : creditAction === 'add' ? 'Add Credit' : 'Deduct Credit'}
        </button>
      </form>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TAB CONFIG
  // ════════════════════════════════════════════════════════════════════════════
  const tabs = [
    { key: 'info',     label: 'Information' },
    { key: 'jobcards', label: `Job Cards${allJobs.length ? ` (${allJobs.length})` : ''}` },
    { key: 'invoices', label: `Invoices${allInvoices.length ? ` (${allInvoices.length})` : ''}` },
    { key: 'credit',   label: 'Credit' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'info':     return renderInfoTab();
      case 'jobcards': return renderJobCardsTab();
      case 'invoices': return renderInvoicesTab();
      case 'credit':   return renderCreditTab();
      default:         return null;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-lg">
              {customer.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{customer.customerName}</h3>
              <p className="text-blue-200 text-xs">{customer.phoneNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6">
          {renderTab()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;