
import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import CancelOrderModal from './CancelOrderModal';
import CreateInvoiceModal from "../invoices/CreateInvoiceModal";

 const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,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';

const JobCardView = ({ jobCardId, onClose, onEdit, onStatusChange, onNavigate }) => {
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/jobcards/${jobCardId}`);
        setJobCard(data);
        if (data.invoiceId || data.invoice) setInvoiceGenerated(true);
      } catch (err) {
        setError('Failed to load job card details');
        console.error(err);
      } finally { setLoading(false); }
    };
    if (jobCardId) fetchJobCard();
  }, [jobCardId]);

  // ✅ Get effective service price for regular customers
  const getServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice || 0;
  };

  // ✅ Calculate service total using effective prices
  const calcServiceTotal = () => {
    const isRegular = jobCard?.isRegularCustomer || false;
    return (jobCard?.serviceCategories || []).reduce((sum, s) => sum + getServicePrice(s, isRegular), 0);
  };

  const calcPartsTotal = () => (jobCard?.usedItems || []).reduce((sum, item) => sum + (item.quantityUsed * (item.unitPrice || 0)), 0);
  const calcGrandTotal = () => calcServiceTotal() + calcPartsTotal();

  const generateJobCardHTML = () => {
    if (!jobCard) return '';
    const formatSerialType = (type) => {
      const typeMap = { 'DEVICE_SERIAL': 'Device Serial', 'IMEI': 'IMEI Number', 'SERIAL_NUMBER': 'Serial Number', 'MODEL_NUMBER': 'Model Number', 'RAM': 'RAM', 'HDD': 'Hard Disk', 'SSD': 'SSD', 'BATTERY': 'Battery', 'GRAPHICS_CARD': 'Graphics Card', 'MOTHERBOARD': 'Motherboard', 'POWER_SUPPLY': 'Power Supply', 'COOLING_FAN': 'Cooling Fan', 'OPTICAL_DRIVE': 'Optical Drive', 'WIFI_CARD': 'WiFi Card', 'BLUETOOTH': 'Bluetooth', 'WEBCAM': 'Webcam', 'MICROPHONE': 'Microphone', 'SPEAKERS': 'Speakers', 'TOUCHPAD': 'Touchpad', 'KEYBOARD': 'Keyboard', 'SCREEN': 'Screen', 'CHASSIS': 'Chassis', 'CHARGER': 'Charger' };
      return typeMap[type] || type.replace(/_/g, ' ');
    };
    const deviceSerial = (jobCard.serials || []).find(s => s.serialType === 'DEVICE_SERIAL');
    const otherSerials = (jobCard.serials || []).filter(s => s.serialType !== 'DEVICE_SERIAL');
    const uniqueSerialTypes = [...new Set(otherSerials.map(s => s.serialType))];
    if (jobCard.withCharger && !uniqueSerialTypes.includes('CHARGER')) uniqueSerialTypes.push('CHARGER');
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>E-TechCare Job Card (A5)</title><style>@page{size:A5 portrait;margin:6mm}body{font-family:Arial,sans-serif;font-size:10px;margin:0;padding:0;color:#000;line-height:1.2;width:148mm;height:210mm}.header{border:2px solid #4a5568;padding:8px;margin-bottom:6px}.header-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:1px solid #cbd5e0;margin-bottom:6px}.logo-container{display:flex;align-items:center;gap:6px}.company-logo{width:100px;height:80px;object-fit:contain}.company-name{font-size:40px;font-weight:900;letter-spacing:2px;color:#2d3748}.header-info{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 12px;font-size:8px;color:#2d3748}.info-row{display:flex;align-items:center}.info-label{font-weight:700;min-width:55px;color:#2d3748}.info-value{color:#4a5568;font-weight:800}.title-bar{border:2px solid #4a5568;padding:4px 6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;background-color:#4a5568;color:#fff}.title{font-size:11px;font-weight:700;letter-spacing:1px}.job-number{font-size:11px;font-weight:700}.meta-row{border:1px solid #4a5568;padding:2px 6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;font-size:10px}.meta-item strong{font-weight:700;color:#2d3748}.urgent{border:2px solid #e53e3e;padding:2px 6px;text-align:center;margin-bottom:6px;font-size:10px;font-weight:700;background-color:#fff0f0;color:#e53e3e}.card{border:1px solid #4a5568;margin-bottom:4px}.card-h{background-color:#4a5568;color:#fff;padding:2px 4px;font-size:10px;font-weight:700}.card-b{padding:3px 4px}.row-2{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px}.i-row{display:flex;padding:1px 0;font-size:10px}.i-label{font-weight:700;min-width:45px;color:#2d3748}.i-value{flex:1;color:#4a5568}.serial{border:2px solid #4a5568;text-align:center;padding:3px}.serial-type{font-size:10px;font-weight:700;text-transform:uppercase;color:#2d3748}.serial-num{font-family:'Courier New',monospace;font-size:10px;font-weight:700;border:1px dashed #4a5568;padding:2px;margin-top:2px;color:#2d3748}.comp-grid{display:flex;flex-wrap:wrap;gap:3px}.comp{border:1px solid #4a5568;padding:2px 4px;font-size:10px;font-weight:600;background-color:#e2e8f0;color:#2d3748}.list-item{padding:1px 0 1px 8px;font-size:10px;position:relative;color:#2d3748}.list-item:before{content:"•";position:absolute;left:0}.desc{border:1px solid #cbd5e0;padding:3px;font-size:10px;line-height:1.2;max-height:30px;overflow:hidden;background-color:white;color:#2d3748}.payment{display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:10px}.payment-amt{font-size:11px;font-weight:700;border:1px solid #4a5568;padding:2px 6px;color:#2d3748}.terms-section{border:1px solid #cbd5e0;padding:4px;margin-bottom:8px;font-size:8px;line-height:1.3;background-color:#f7fafc;color:#2d3748}.terms-item{margin-bottom:2px;padding-left:8px;position:relative}.terms-item:before{content:"•";position:absolute;left:0;font-weight:bold}.sig-section{border:2px solid #4a5568;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:4px;background-color:#f7fafc}.sig-box{display:flex;flex-direction:column;align-items:center}.sig-line{width:100%;border-bottom:1px solid #000;height:35px;margin-bottom:4px}.sig-label{font-size:9px;font-weight:600;text-align:center;color:#2d3748;margin-top:2px}.footer{margin-top:6px;padding-top:3px;border-top:1px solid #4a5568;text-align:center;font-size:6px;font-weight:700;color:#4a5568}@media print{body{width:148mm;height:210mm}.card,.sig-section{page-break-inside:avoid}.header,.title-bar{break-inside:avoid}}</style></head><body><div class="header"><div class="header-top"><div class="logo-container"><img src="${COMPANY_LOGO_BASE64}" alt="Logo" class="company-logo"><div class="company-name">E-TECHCARE</div></div></div><div class="header-info"><div class="info-row"><span class="info-label">ADDRESS:</span><span class="info-value">No.158, Wakwella Road, Galle</span></div><div class="info-row"><span class="info-label">TEL:</span><span class="info-value">076 795 7125</span></div><div class="info-row"><span class="info-label">EMAIL:</span><span class="info-value">etechcarelh@gmail.com</span></div><div class="info-row"><span class="info-label">WHATSAPP:</span><span class="info-value">076 795 7125</span></div></div></div><div class="title-bar"><div class="title">JOB CARD</div><div class="job-number">#${jobCard.jobNumber}</div></div><div class="meta-row"><div class="meta-item"><strong>DATE:</strong> ${new Date(jobCard.createdAt).toLocaleDateString()}</div><div class="meta-item"><strong>STATUS:</strong> ${jobCard.status.replace(/_/g, ' ')}</div></div>${jobCard.oneDayService ? '<div class="urgent">*** ONE DAY SERVICE ***</div>' : ''}<div class="row-2"><div class="card"><div class="card-h">CUSTOMER</div><div class="card-b"><div class="i-row"><div class="i-label">Name:</div><div class="i-value">${jobCard.customerName}</div></div><div class="i-row"><div class="i-label">Phone:</div><div class="i-value">${jobCard.customerPhone}</div></div><div class="i-row"><div class="i-label">Email:</div><div class="i-value">${jobCard.customerEmail || 'N/A'}</div></div></div></div><div class="card"><div class="card-h">DEVICE</div><div class="card-b"><div class="i-row"><div class="i-label">Type:</div><div class="i-value">${jobCard.deviceType}</div></div><div class="i-row"><div class="i-label">Brand:</div><div class="i-value">${jobCard.brand?.brandName || 'N/A'}</div></div><div class="i-row"><div class="i-label">Model:</div><div class="i-value">${jobCard.model?.modelName || 'N/A'}</div></div>${jobCard.processor ? `<div class="i-row"><div class="i-label">CPU:</div><div class="i-value">${jobCard.processor.processorName}</div></div>` : ''}${deviceSerial ? `<div class="i-row"><div class="i-label">Serial:</div><div class="i-value" style="font-family:'Courier New',monospace;font-weight:700;">${deviceSerial.serialValue}</div></div>` : ''}</div></div></div>${uniqueSerialTypes.length > 0 ? `<div class="card"><div class="card-h">COMPONENTS</div><div class="card-b"><div class="comp-grid">${uniqueSerialTypes.map(st => `<div class="comp">${formatSerialType(st)}</div>`).join('')}</div></div></div>` : ''}<div class="row-2"><div class="card"><div class="card-h">CONDITION</div><div class="card-b">${jobCard.deviceConditions && jobCard.deviceConditions.length > 0 ? jobCard.deviceConditions.map(c => `<div class="list-item">${c.conditionName}</div>`).join('') : '<div style="text-align:center;padding:5px;color:#718096;">-</div>'}</div></div><div class="card"><div class="card-h">FAULTS</div><div class="card-b">${jobCard.faults && jobCard.faults.length > 0 ? jobCard.faults.map(f => `<div class="list-item">${f.faultName}</div>`).join('') : '<div style="text-align:center;padding:5px;color:#718096;">-</div>'}</div></div></div>${jobCard.faultDescription ? `<div class="card"><div class="card-h">FAULT DETAILS</div><div class="card-b"><div class="desc">${jobCard.faultDescription.substring(0, 150)}${jobCard.faultDescription.length > 150 ? '...' : ''}</div></div></div>` : ''}${jobCard.serviceCategories && jobCard.serviceCategories.length > 0 ? `<div class="card"><div class="card-h">SERVICES</div><div class="card-b">${jobCard.serviceCategories.map(s => `<div class="list-item">${s.name}</div>`).join('')}</div></div>` : ''}${jobCard.advancePayment && jobCard.advancePayment > 0 ? `<div class="card"><div class="card-h">PAYMENT</div><div class="card-b"><div class="payment"><div><strong>Advance Payment:</strong></div><div class="payment-amt">Rs. ${jobCard.advancePayment?.toFixed(2)}</div></div></div></div>` : ''}${jobCard.notes ? `<div class="card"><div class="card-h">NOTES</div><div class="card-b"><div class="desc">${jobCard.notes.substring(0, 150)}${jobCard.notes.length > 150 ? '...' : ''}</div></div></div>` : ''}<div class="terms-section"><div class="terms-item">Job note is essential to release the device will not be released at all without job note.</div><div class="terms-item">Inspection fee Rs.1000 will be charged if the device is carried out without repairing.</div><div class="terms-item">We will expect to complete all the repairs as soon as we can after final inspection will inform you to about device condition to provided phone number. If the device is not collected within 3 months of the repair, it would be disposed to recover the cost.</div><div class="terms-item">We will provide 2-month warranty on repairs carried out by us and this applies only to defects which we have rectified.</div><div class="terms-item">We will not take any responsibilities regarding data in your computer and this will be confirmed by us when you hand over the device to repair.</div></div><div class="sig-section"><div class="sig-box"><div class="sig-line"></div><div class="sig-label">Authorized</div></div><div class="sig-box"><div class="sig-line"></div><div class="sig-label">Customer Signature</div></div></div><div class="footer">E-TECHCARE - PROFESSIONAL DEVICE REPAIR SERVICES</div></body></html>`;
  };

  const downloadJobCard = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) { alert('Please allow pop-ups to print the job card'); return; }
      printWindow.document.title = `JobCard_${jobCard.jobNumber}`;
      printWindow.document.write(generateJobCardHTML());
      printWindow.document.close();
      setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    } catch (error) { alert('Error printing job card: ' + error.message); }
  };

  const handleCancelSuccess = (response) => {
    try {
      if (response && response.id) setJobCard(response);
      setShowCancelModal(false);
      const msg = document.createElement('div');
      msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      msg.textContent = '✅ Job card cancelled successfully!';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
      setTimeout(() => {
        try { if (onStatusChange) onStatusChange(); } catch (err) { console.error(err); }
        setTimeout(() => { if (onClose) onClose(); }, 1000);
      }, 500);
    } catch (err) { console.error(err); setShowCancelModal(false); }
  };

  const handleInvoiceSuccess = (response) => {
    setShowCreateInvoiceModal(false);
    setInvoiceGenerated(true);
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    msg.textContent = 'Invoice created successfully!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
    if (onNavigate) onNavigate('invoices', response.id);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const endpointMap = {
        'WAITING_FOR_PARTS': `/api/jobcards/${jobCardId}/waiting-for-parts`,
        'WAITING_FOR_APPROVAL': `/api/jobcards/${jobCardId}/waiting-for-approval`,
        'IN_PROGRESS': `/api/jobcards/${jobCardId}/in-progress`,
        'PENDING': `/api/jobcards/${jobCardId}/pending`,
      };
      const endpoint = endpointMap[newStatus];
      if (!endpoint) return;
      const response = await apiCall(endpoint, { method: 'POST' });
      setJobCard(response);
      const msg = document.createElement('div');
      msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      msg.textContent = `Status updated to ${newStatus.replace(/_/g, ' ')}`;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
      if (onStatusChange) onStatusChange();
    } catch (err) { setError(err.message || 'Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const getStatusColor = (status) => {
    const colors = { PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300', IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300', WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300', WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300', COMPLETED: 'bg-green-100 text-green-800 border-green-300', DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300', CANCELLED: 'bg-red-100 text-red-800 border-red-300' };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = { PENDING: '⏳', IN_PROGRESS: '🔧', WAITING_FOR_PARTS: '📦', WAITING_FOR_APPROVAL: '👥', COMPLETED: '✅', DELIVERED: '🚚', CANCELLED: '❌' };
    return icons[status] || '📄';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !jobCard) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">{error || 'Job card not found'}</div>
      <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">Back to List</button>
    </div>
  );

  const isRegular = jobCard.isRegularCustomer || false;
  const deviceSerials = jobCard.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];
  const otherSerials = jobCard.serials?.filter(s => s.serialType !== 'DEVICE_SERIAL') || [];
  const isCompleted = jobCard.status === 'COMPLETED';
  const isDelivered = jobCard.status === 'DELIVERED';
  const isCancelled = jobCard.status === 'CANCELLED';
  const isWaitingForParts = jobCard.status === 'WAITING_FOR_PARTS';
  const isWaitingForApproval = jobCard.status === 'WAITING_FOR_APPROVAL';
  const isInProgress = jobCard.status === 'IN_PROGRESS';
  const isPending = jobCard.status === 'PENDING';
  const showCancelButton = !isCancelled && !isDelivered && !invoiceGenerated;

  const rowCls = "flex justify-between items-start py-0.5 border-b border-gray-100 last:border-0";
  const labelCls = "text-xs text-gray-500 flex-shrink-0 w-24";
  const valCls = "text-xs font-medium text-gray-800 text-right flex-1";

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className={`flex-none px-4 py-2 flex justify-between items-center text-white ${
        jobCard.oneDayService ? 'bg-red-700' :
        jobCard.status === 'WAITING_FOR_PARTS' ? 'bg-orange-700' :
        jobCard.status === 'WAITING_FOR_APPROVAL' ? 'bg-purple-700' :
        jobCard.status === 'CANCELLED' ? 'bg-gray-700' : 'bg-blue-700'
      }`}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold">{jobCard.jobNumber}</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(jobCard.status)}`}>
            {getStatusIcon(jobCard.status)} {jobCard.status.replace(/_/g, ' ')}
          </span>
          {jobCard.oneDayService && <span className="px-2 py-0.5 bg-white text-red-600 rounded-full text-xs font-bold">🚨 ONE DAY</span>}
          {/* ✅ Regular customer badge in header */}
          {isRegular && <span className="px-2 py-0.5 bg-white text-blue-700 rounded-full text-xs font-bold">⭐ Regular Customer</span>}
          {invoiceGenerated && <span className="px-2 py-0.5 bg-white text-purple-700 rounded-full text-xs font-bold">📄 Invoice Generated</span>}
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-200 bg-red-800 rounded px-2 py-0.5">{error}</span>}
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden grid grid-cols-4 gap-2 p-2">

        {/* COLUMN 1: Customer + Device + Flags + Timeline */}
        <div className="flex flex-col gap-2 overflow-hidden">
          {/* Customer */}
          <div className="border border-gray-200 rounded p-2 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Customer</div>
              {isRegular && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium">⭐ Regular</span>}
            </div>
            <div className="space-y-0.5">
              <div className={rowCls}><span className={labelCls}>Name</span><span className={valCls}>{jobCard.customerName}</span></div>
              <div className={rowCls}><span className={labelCls}>Phone</span><span className={valCls}>{jobCard.customerPhone}</span></div>
              <div className={rowCls}><span className={labelCls}>Email</span><span className={`${valCls} truncate`}>{jobCard.customerEmail || 'N/A'}</span></div>
            </div>
            {isRegular && (
              <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                <p className="text-xs text-blue-700 font-medium">⭐ Special pricing applied</p>
              </div>
            )}
          </div>

          {/* Device */}
          <div className="border border-gray-200 rounded p-2 bg-white">
            <div className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Device</div>
            <div className="space-y-0.5">
              <div className={rowCls}><span className={labelCls}>Type</span><span className={valCls}>{jobCard.deviceType}</span></div>
              <div className={rowCls}><span className={labelCls}>Brand</span><span className={valCls}>{jobCard.brand?.brandName || 'N/A'}</span></div>
              <div className={rowCls}><span className={labelCls}>Model</span><span className={valCls}>{jobCard.model?.modelName || 'N/A'}</span></div>
              <div className={rowCls}><span className={labelCls}>Model No.</span><span className={valCls}>{jobCard.modelNumber?.modelNumber || 'N/A'}</span></div>
              {jobCard.processor && <div className={rowCls}><span className={labelCls}>Processor</span><span className={valCls}>{jobCard.processor.processorName}</span></div>}
            </div>
          </div>

          {/* Flags */}
          <div className="border border-gray-200 rounded p-2 bg-white">
            <div className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Flags</div>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 p-1.5 rounded border ${jobCard.oneDayService ? 'bg-red-50 border-red-200' : 'border-gray-100 bg-gray-50'}`}>
                <span className="text-xs">🚨</span>
                <span className="text-xs font-medium text-gray-700">One Day Service</span>
                <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${jobCard.oneDayService ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{jobCard.oneDayService ? 'YES' : 'NO'}</span>
              </div>
              <div className={`flex items-center gap-2 p-1.5 rounded border ${jobCard.withCharger ? 'bg-green-50 border-green-200' : 'border-gray-100 bg-gray-50'}`}>
                <span className="text-xs">🔌</span>
                <span className="text-xs font-medium text-gray-700">With Charger</span>
                <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${jobCard.withCharger ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{jobCard.withCharger ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-gray-200 rounded p-2 bg-white flex-1">
            <div className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Timeline</div>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <div className="w-2 h-2 mt-0.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <div><div className="text-xs text-gray-500">Created</div><div className="text-xs font-medium text-gray-800">{formatDate(jobCard.createdAt)}</div></div>
              </div>
              {jobCard.updatedAt && (
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 mt-0.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <div><div className="text-xs text-gray-500">Updated</div><div className="text-xs font-medium text-gray-800">{formatDate(jobCard.updatedAt)}</div></div>
                </div>
              )}
              {jobCard.completedAt && (
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 mt-0.5 bg-green-600 rounded-full flex-shrink-0"></div>
                  <div><div className="text-xs text-gray-500">Completed</div><div className="text-xs font-medium text-gray-800">{formatDate(jobCard.completedAt)}</div></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Serials + Conditions + Faults + Notes */}
        <div className="flex flex-col gap-2 overflow-hidden">
          {deviceSerials.length > 0 && (
            <div className="border border-blue-200 rounded p-2 bg-blue-50">
              <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Device Serial (Primary)</div>
              <div className="space-y-1">
                {deviceSerials.map((serial, i) => (
                  <div key={i} className="bg-white border-2 border-blue-300 rounded p-1.5">
                    <div className="text-xs font-mono font-bold text-gray-800 tracking-wider text-center">{serial.serialValue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherSerials.length > 0 && (
            <div className="border border-purple-200 rounded p-2 bg-purple-50">
              <div className="text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Other Serials</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {otherSerials.map((serial, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-purple-200">
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded font-bold flex-shrink-0">{serial.serialType.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono text-gray-700 truncate">{serial.serialValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobCard.deviceConditions && jobCard.deviceConditions.length > 0 && (
            <div className="border border-yellow-200 rounded p-2 bg-yellow-50">
              <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Conditions ({jobCard.deviceConditions.length})</div>
              <div className="flex flex-wrap gap-1">
                {jobCard.deviceConditions.map(c => (
                  <span key={c.id} className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs font-medium">{c.conditionName}</span>
                ))}
              </div>
            </div>
          )}

          {jobCard.faults && jobCard.faults.length > 0 && (
            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults ({jobCard.faults.length})</div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {jobCard.faults.map(f => (
                  <span key={f.id} className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs font-medium">{f.faultName}</span>
                ))}
              </div>
              {jobCard.faultDescription && (
                <div className="bg-white border border-red-200 rounded p-1.5">
                  <div className="text-xs text-gray-500 mb-0.5">Description:</div>
                  <p className="text-xs text-gray-800 whitespace-pre-wrap line-clamp-4">{jobCard.faultDescription}</p>
                </div>
              )}
            </div>
          )}

          {jobCard.notes && (
            <div className="border border-gray-200 rounded p-2 bg-white flex-1">
              <div className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Notes</div>
              <p className="text-xs text-gray-800 whitespace-pre-wrap">{jobCard.notes}</p>
            </div>
          )}
        </div>

        {/* COLUMN 3: Services + Used Items + Cancellation */}
        <div className="flex flex-col gap-2 overflow-hidden">

          {/* ✅ Services with special pricing support */}
          {jobCard.serviceCategories && jobCard.serviceCategories.length > 0 && (
            <div className="border border-green-200 rounded p-2 bg-green-50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">
                  Services ({jobCard.serviceCategories.length})
                </div>
                {isRegular && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special Price</span>
                )}
              </div>
              <div className="space-y-1 mb-1.5 max-h-28 overflow-y-auto">
                {jobCard.serviceCategories.map(s => {
                  const price = getServicePrice(s, isRegular);
                  const hasSpecial = isRegular && s.specialServicePrice != null;
                  return (
                    <div key={s.id} className={`flex items-center justify-between px-1.5 py-1 rounded border text-xs ${hasSpecial ? 'bg-blue-50 border-blue-200' : 'bg-white border-green-200'}`}>
                      <span className="font-medium text-gray-800 truncate flex-1 mr-2">{s.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {hasSpecial && (
                          <span className="text-gray-400 line-through text-xs">Rs.{s.servicePrice?.toFixed(2)}</span>
                        )}
                        <span className={`font-bold ${hasSpecial ? 'text-blue-700' : 'text-green-700'}`}>
                          {hasSpecial && '⭐ '}Rs.{price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
                <span className="text-xs font-semibold text-gray-700">Service Total{isRegular ? ' ⭐' : ''}:</span>
                <span className="text-sm font-bold text-green-700">Rs.{calcServiceTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Used Items */}
          {jobCard.usedItems && jobCard.usedItems.length > 0 && (
            <div className="border border-blue-200 rounded p-2 bg-blue-50 flex-1 flex flex-col">
              <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Used Parts ({jobCard.usedItems.length})</div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {jobCard.usedItems.map((item, i) => (
                  <div key={i} className="bg-white p-1.5 rounded border border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-800 truncate flex-1">{item.inventoryItem?.name || 'Unknown'}</span>
                      <span className="text-xs font-bold text-blue-700 ml-1">Rs.{((item.quantityUsed || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Qty: {item.quantityUsed} × Rs.{(item.unitPrice || 0).toFixed(2)}</div>
                    {item.usedSerialNumbers?.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {item.usedSerialNumbers.map((s, si) => <span key={si} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">{s}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between items-center bg-blue-100 border border-blue-300 rounded px-2 py-1">
                <span className="text-xs font-semibold text-gray-700">Parts Total:</span>
                <span className="text-sm font-bold text-blue-700">Rs.{calcPartsTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {isCancelled && jobCard.cancelledBy && (
            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Cancellation</div>
              <div className="space-y-0.5">
                <div className={rowCls}><span className={labelCls}>Cancelled By</span><span className={valCls}>{jobCard.cancelledBy === 'CUSTOMER' ? 'Customer' : 'Technician'}</span></div>
                {jobCard.cancellationReason && <div className={rowCls}><span className={labelCls}>Reason</span><span className={`${valCls} text-left`}>{jobCard.cancellationReason}</span></div>}
                {jobCard.cancellationFee > 0 && <div className={rowCls}><span className={labelCls}>Fee</span><span className="text-xs font-bold text-red-700">Rs.{jobCard.cancellationFee?.toFixed(2)}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 4: Payment + Quick Actions + Action Buttons */}
        <div className="flex flex-col gap-2 overflow-hidden">
          {/* Payment */}
          <div className="border border-gray-200 rounded p-2 bg-white">
            <div className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Payment</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-1.5 bg-blue-50 border border-blue-200 rounded">
                <span className="text-xs text-gray-600">Advance</span>
                <span className="text-sm font-bold text-blue-700">Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-green-50 border border-green-200 rounded">
                <span className="text-xs text-gray-600">Estimated</span>
                <span className="text-sm font-bold text-green-700">Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={`flex justify-between items-center p-1.5 border rounded ${isRegular ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                <span className="text-xs text-gray-600">Total (now){isRegular ? ' ⭐' : ''}</span>
                <span className={`text-sm font-bold ${isRegular ? 'text-blue-700' : 'text-purple-700'}`}>Rs.{calcGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Status Actions */}
          {!isCancelled && !isDelivered && (
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Quick Actions</div>
              <div className="space-y-1">
                {isInProgress && (
                  <>
                    <button onClick={() => handleStatusChange('WAITING_FOR_PARTS')} disabled={updatingStatus} className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-medium rounded transition-colors">
                      📦 Waiting for Parts
                    </button>
                    <button onClick={() => handleStatusChange('WAITING_FOR_APPROVAL')} disabled={updatingStatus} className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-medium rounded transition-colors">
                      👥 Waiting for Approval
                    </button>
                  </>
                )}
                {(isWaitingForParts || isWaitingForApproval) && (
                  <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updatingStatus} className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors">
                    🔧 Back to In Progress
                  </button>
                )}
                {(isPending || isWaitingForParts || isWaitingForApproval) && (
                  <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updatingStatus} className="w-full py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors">
                    🚀 Start Work
                  </button>
                )}
                {updatingStatus && <div className="text-xs text-gray-500 text-center">Updating...</div>}
              </div>
              {(isWaitingForParts || isWaitingForApproval) && (
                <div className={`mt-1.5 p-1.5 rounded text-xs ${isWaitingForParts ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                  {isWaitingForParts ? '⏳ Paused — waiting for parts.' : '⏳ Paused — awaiting customer approval.'}
                </div>
              )}
            </div>
          )}

          {/* Components summary */}
          {(otherSerials.length > 0 || jobCard.withCharger) && (
            <div className="border border-indigo-200 rounded p-2 bg-indigo-50">
              <div className="text-xs font-bold text-indigo-700 mb-1.5 uppercase tracking-wide">Components</div>
              <div className="flex flex-wrap gap-1">
                {otherSerials.map((s, i) => (
                  <span key={i} className="bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full text-xs">{s.serialType.replace(/_/g, ' ')}</span>
                ))}
                {jobCard.withCharger && <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">Charger</span>}
              </div>
            </div>
          )}

          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="border border-gray-200 rounded p-2 bg-white space-y-1.5">
            <div className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Actions</div>
            <button onClick={downloadJobCard} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors">
              🖨️ Print Job Card
            </button>
            {!isCancelled && (
              <>
                {isCompleted && (
                  <button onClick={() => setShowCreateInvoiceModal(true)} className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors">
                    📄 Generate Invoice
                  </button>
                )}
                {!isDelivered && (
                  <button onClick={() => onEdit(jobCardId)} className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors">
                    ✏️ Edit Job Card
                  </button>
                )}
                {showCancelButton && (
                  <button onClick={() => setShowCancelModal(true)} className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors">
                    ✕ Cancel Job Card
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <CancelOrderModal jobCard={jobCard} onSuccess={handleCancelSuccess} onClose={() => setShowCancelModal(false)} />
      )}
      {showCreateInvoiceModal && (
        <CreateInvoiceModal jobCard={jobCard} onSuccess={handleInvoiceSuccess} onClose={() => setShowCreateInvoiceModal(false)} />
      )}
    </div>
  );
};

export default JobCardView;