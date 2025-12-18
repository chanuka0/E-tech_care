




import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import CancelOrderModal from './CancelOrderModal';
import CreateInvoiceModal from "../invoices/CreateInvoiceModal";

const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,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';

const JobCardView = ({ jobCardId, onClose, onEdit, onStatusChange, onNavigate }) => {
  const { apiCall } = useApi();
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/jobcards/${jobCardId}`);
        setJobCard(data);
      } catch (err) {
        setError('Failed to load job card details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (jobCardId) {
      fetchJobCard();
    }
  }, [jobCardId]);

  const downloadJobCard = () => {
    try {
      const jobCardHTML = generateJobCardHTML();
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups to print the job card');
        return;
      }
      
      // Set the window title to the job card number
      printWindow.document.title = `JobCard_${jobCard.jobNumber}`;
      printWindow.document.write(jobCardHTML);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error printing job card:', error);
      alert('Error printing job card: ' + error.message);
    }
  };

  const exportJobCardPDF = () => {
    try {
      const jobCardHTML = generateJobCardHTML();
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups to download the job card');
        return;
      }
      
      printWindow.document.write(jobCardHTML);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    } catch (error) {
      console.error('Error exporting job card PDF:', error);
      alert('Error exporting job card: ' + error.message);
    }
  };

  const generateJobCardHTML = () => {
    if (!jobCard) return '';

    const formatSerialType = (type) => {
      const typeMap = {
        'DEVICE_SERIAL': 'Device Serial',
        'IMEI': 'IMEI Number',
        'SERIAL_NUMBER': 'Serial Number',
        'MODEL_NUMBER': 'Model Number',
        'RAM': 'RAM',
        'HDD': 'Hard Disk',
        'SSD': 'SSD',
        'BATTERY': 'Battery',
        'GRAPHICS_CARD': 'Graphics Card',
        'MOTHERBOARD': 'Motherboard',
        'POWER_SUPPLY': 'Power Supply',
        'COOLING_FAN': 'Cooling Fan',
        'OPTICAL_DRIVE': 'Optical Drive',
        'WIFI_CARD': 'WiFi Card',
        'BLUETOOTH': 'Bluetooth',
        'WEBCAM': 'Webcam',
        'MICROPHONE': 'Microphone',
        'SPEAKERS': 'Speakers',
        'TOUCHPAD': 'Touchpad',
        'KEYBOARD': 'Keyboard',
        'SCREEN': 'Screen',
        'CHASSIS': 'Chassis'
      };
      return typeMap[type] || type.replace(/_/g, ' ');
    };

    const deviceSerial = (jobCard.serials || []).find(s => s.serialType === 'DEVICE_SERIAL');
    const otherSerials = (jobCard.serials || []).filter(s => s.serialType !== 'DEVICE_SERIAL');
    const uniqueSerialTypes = [...new Set(otherSerials.map(s => s.serialType))];

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>E-TechCare Job Card (A5)</title>
<style>
    @page {
        size: A5 portrait;
        margin: 6mm;
    }
    
    body {
        font-family: Arial, sans-serif;
        font-size: 10px;
        margin: 0;
        padding: 0;
        color: #000;
        line-height: 1.2;
        width: 148mm;
        height: 210mm;
    }

    .header {
        border: 2px solid #4a5568;
        padding: 8px;
        margin-bottom: 6px;
    }
    
    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 6px;
        border-bottom: 1px solid #cbd5e0;
        margin-bottom: 6px;
    }
    
    .logo-container {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .company-logo {
        width: 100px;
        height: 80px;
        object-fit: contain;
    }
    
    .company-name {
        font-size: 40px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #2d3748;
    }
    
    .header-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px 12px;
        font-size: 8px;
        color: #2d3748;
    }
    
    .info-row {
        display: flex;
        align-items: center;
    }
    
    .info-label {
        font-weight: 700;
        min-width: 55px;
        color: #2d3748;
    }
    
    .info-value {
        color: #4a5568;
        font-weight: 800;
    }

    .title-bar {
        border: 2px solid #4a5568;
        padding: 4px 6px;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #4a5568;
        color: #fff;
    }
    
    .title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
    }
    
    .job-number {
        font-size: 11px;
        font-weight: 700;
    }

    .meta-row {
        border: 1px solid #4a5568;
        padding: 2px 6px;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
    }
    
    .meta-item strong {
        font-weight: 700;
        color: #2d3748;
    }
    
    .urgent {
        border: 2px solid #e53e3e;
        padding: 2px 6px;
        text-align: center;
        margin-bottom: 6px;
        font-size: 10px;
        font-weight: 700;
        background-color: #fff0f0;
        color: #e53e3e;
    }

    .card {
        border: 1px solid #4a5568;
        margin-bottom: 4px;
    }
    
    .card-h {
        background-color: #4a5568;
        color: #fff;
        padding: 2px 4px;
        font-size: 10px;
        font-weight: 700;
    }
    
    .card-b {
        padding: 3px 4px;
    }

    .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        margin-bottom: 4px;
    }

    .i-row {
        display: flex;
        padding: 1px 0;
        font-size: 10px;
    }
    
    .i-label {
        font-weight: 700;
        min-width: 45px;
        color: #2d3748;
    }
    
    .i-value {
        flex: 1;
        color: #4a5568;
    }

    .serial {
        border: 2px solid #4a5568;
        text-align: center;
        padding: 3px;
    }
    
    .serial-type {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: #2d3748;
    }
    
    .serial-num {
        font-family: 'Courier New', monospace;
        font-size: 10px;
        font-weight: 700;
        border: 1px dashed #4a5568;
        padding: 2px;
        margin-top: 2px;
        color: #2d3748;
    }

    .comp-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
    }
    
    .comp {
        border: 1px solid #4a5568;
        padding: 2px 4px;
        font-size: 10px;
        font-weight: 600;
        background-color: #e2e8f0;
        color: #2d3748;
    }

    .list-item {
        padding: 1px 0 1px 8px;
        font-size: 10px;
        position: relative;
        color: #2d3748;
    }
    
    .list-item:before {
        content: "•";
        position: absolute;
        left: 0;
    }

    .desc {
        border: 1px solid #cbd5e0;
        padding: 3px;
        font-size: 10px;
        line-height: 1.2;
        max-height: 30px;
        overflow: hidden;
        background-color: white;
        color: #2d3748;
    }

    .payment {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 10px;
    }
    
    .payment-amt {
        font-size: 11px;
        font-weight: 700;
        border: 1px solid #4a5568;
        padding: 2px 6px;
        color: #2d3748;
    }

    .sig-section {
        border: 2px solid #4a5568;
        padding: 8px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 8px;
        background-color: #f7fafc;
    }
    
    .sig-box {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .sig-line {
        width: 100%;
        border-bottom: 1px solid #000;
        height: 35px;
        margin-bottom: 4px;
    }
    
    .sig-label {
        font-size: 9px;
        font-weight: 600;
        text-align: center;
        color: #2d3748;
        margin-top: 2px;
    }

    .footer {
        margin-top: 6px;
        padding-top: 3px;
        border-top: 1px solid #4a5568;
        text-align: center;
        font-size: 6px;
        font-weight: 700;
        color: #4a5568;
    }
    
    @media print {
        body { 
            width: 148mm; 
            height: 210mm; 
        }
        .card, .sig-section { 
            page-break-inside: avoid; 
        }
        .header, .title-bar {
            break-inside: avoid;
        }
    }
</style>
</head>
<body>

<div class="header">
    <div class="header-top">
        <div class="logo-container">
            <img src="${COMPANY_LOGO_BASE64}" alt="Logo" class="company-logo">
            <div class="company-name">E-TECHCARE</div>
        </div>
    </div>
    <div class="header-info">
        <div class="info-row">
            <span class="info-label">ADDRESS:</span>
            <span class="info-value">No.158, Wakwella Road, Galle</span>
        </div>
        <div class="info-row">
            <span class="info-label">TEL:</span>
            <span class="info-value">076 795 7125</span>
        </div>
        <div class="info-row">
            <span class="info-label">EMAIL:</span>
            <span class="info-value">etechcarelh@gmail.com</span>
        </div>
        <div class="info-row">
            <span class="info-label">WHATSAPP:</span>
            <span class="info-value">076 795 7125</span>
        </div>
    </div>
</div>

<div class="title-bar">
    <div class="title">JOB CARD</div>
    <div class="job-number">#${jobCard.jobNumber}</div>
</div>

<div class="meta-row">
    <div class="meta-item"><strong>DATE:</strong> ${new Date(jobCard.createdAt).toLocaleDateString()}</div>
    <div class="meta-item"><strong>STATUS:</strong> ${jobCard.status.replace(/_/g, ' ')}</div>
</div>

${jobCard.oneDayService ? '<div class="urgent">*** ONE DAY SERVICE ***</div>' : ''}

<div class="row-2">
    <div class="card">
        <div class="card-h">CUSTOMER</div>
        <div class="card-b">
            <div class="i-row">
                <div class="i-label">Name:</div>
                <div class="i-value">${jobCard.customerName}</div>
            </div>
            <div class="i-row">
                <div class="i-label">Phone:</div>
                <div class="i-value">${jobCard.customerPhone}</div>
            </div>
            <div class="i-row">
                <div class="i-label">Email:</div>
                <div class="i-value">${jobCard.customerEmail || 'N/A'}</div>
            </div>
        </div>
    </div>
    
    <div class="card">
        <div class="card-h">DEVICE</div>
        <div class="card-b">
            <div class="i-row">
                <div class="i-label">Type:</div>
                <div class="i-value">${jobCard.deviceType}</div>
            </div>
            <div class="i-row">
                <div class="i-label">Brand:</div>
                <div class="i-value">${jobCard.brand?.brandName || 'N/A'}</div>
            </div>
            <div class="i-row">
                <div class="i-label">Model:</div>
                <div class="i-value">${jobCard.model?.modelName || 'N/A'}</div>
            </div>
            ${jobCard.processor ? `
            <div class="i-row">
                <div class="i-label">CPU:</div>
                <div class="i-value">${jobCard.processor.processorName}</div>
            </div>
            ` : ''}
            ${deviceSerial ? `
            <div class="i-row">
                <div class="i-label">Serial:</div>
                <div class="i-value" style="font-family: 'Courier New', monospace; font-weight: 700;">${deviceSerial.serialValue}</div>
            </div>
            ` : ''}
        </div>
    </div>
</div>

${uniqueSerialTypes.length > 0 ? `
<div class="card">
    <div class="card-h">COMPONENTS</div>
    <div class="card-b">
        <div class="comp-grid">
            ${uniqueSerialTypes.map(st => `<div class="comp">${formatSerialType(st)}</div>`).join('')}
        </div>
    </div>
</div>
` : ''}

<div class="row-2">
    <div class="card">
        <div class="card-h">CONDITION</div>
        <div class="card-b">
            ${jobCard.deviceConditions && jobCard.deviceConditions.length > 0 
              ? jobCard.deviceConditions.map(c => `<div class="list-item">${c.conditionName}</div>`).join('')
              : '<div style="text-align: center; padding: 5px; color: #718096;">-</div>'
            }
        </div>
    </div>
    
    <div class="card">
        <div class="card-h">FAULTS</div>
        <div class="card-b">
            ${jobCard.faults && jobCard.faults.length > 0 
              ? jobCard.faults.map(f => `<div class="list-item">${f.faultName}</div>`).join('')
              : '<div style="text-align: center; padding: 5px; color: #718096;">-</div>'
            }
        </div>
    </div>
</div>

${jobCard.faultDescription ? `
<div class="card">
    <div class="card-h">FAULT DETAILS</div>
    <div class="card-b">
        <div class="desc">${jobCard.faultDescription.substring(0, 150)}${jobCard.faultDescription.length > 150 ? '...' : ''}</div>
    </div>
</div>
` : ''}

${jobCard.serviceCategories && jobCard.serviceCategories.length > 0 ? `
<div class="card">
    <div class="card-h">SERVICES</div>
    <div class="card-b">
        ${jobCard.serviceCategories.map(s => `<div class="list-item">${s.name}</div>`).join('')}
    </div>
</div>
` : ''}

${jobCard.advancePayment && jobCard.advancePayment > 0 ? `
<div class="card">
    <div class="card-h">PAYMENT</div>
    <div class="card-b">
        <div class="payment">
            <div><strong>Advance Payment:</strong></div>
            <div class="payment-amt">Rs. ${jobCard.advancePayment?.toFixed(2)}</div>
        </div>
    </div>
</div>
` : ''}

${jobCard.notes ? `
<div class="card">
    <div class="card-h">NOTES</div>
    <div class="card-b">
        <div class="desc">${jobCard.notes.substring(0, 150)}${jobCard.notes.length > 150 ? '...' : ''}</div>
    </div>
</div>
` : ''}

<div class="sig-section">
    <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Authorized</div>
    </div>
    <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Customer Signature</div>
    </div>
</div>

<div class="footer">E-TECHCARE - PROFESSIONAL DEVICE REPAIR SERVICES</div>

</body>
</html>
`;
  };

  const handleCancelSuccess = (response) => {
    setJobCard(response);
    setShowCancelModal(false);
    if (onStatusChange) onStatusChange();
  };

  const handleInvoiceSuccess = (response) => {
    setShowCreateInvoiceModal(false);
    
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = 'Invoice created successfully!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);

    if (onNavigate) {
      onNavigate('invoices', response.id);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      let endpoint = '';
      let action = '';

      switch (newStatus) {
        case 'WAITING_FOR_PARTS':
          endpoint = `/api/jobcards/${jobCardId}/waiting-for-parts`;
          action = 'waiting for parts';
          break;
        case 'WAITING_FOR_APPROVAL':
          endpoint = `/api/jobcards/${jobCardId}/waiting-for-approval`;
          action = 'waiting for approval';
          break;
        case 'IN_PROGRESS':
          endpoint = `/api/jobcards/${jobCardId}/in-progress`;
          action = 'in progress';
          break;
        case 'PENDING':
          endpoint = `/api/jobcards/${jobCardId}/pending`;
          action = 'pending';
          break;
        default:
          return;
      }

      const response = await apiCall(endpoint, { method: 'POST' });
      setJobCard(response);
      
      const msg = document.createElement('div');
      msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      msg.textContent = `Status updated to ${action}`;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);

      if (onStatusChange) onStatusChange();
    } catch (err) {
      setError(err.message || 'Failed to update status');
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
      WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300',
      WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      IN_PROGRESS: '🔧',
      WAITING_FOR_PARTS: '📦',
      WAITING_FOR_APPROVAL: '👥',
      COMPLETED: '✅',
      DELIVERED: '🚚',
      CANCELLED: '❌',
    };
    return icons[status] || '📄';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSerialTypeColor = (type) => {
    const colors = {
      'DEVICE_SERIAL': 'bg-blue-600 text-white',
      'IMEI': 'bg-purple-600 text-white',
      'SERIAL_NUMBER': 'bg-indigo-600 text-white',
      'MODEL_NUMBER': 'bg-violet-600 text-white'
    };
    return colors[type] || 'bg-gray-600 text-white';
  };

  const calculateTotalServicePrice = () => {
    return (jobCard?.serviceCategories || []).reduce((sum, service) => {
      return sum + (service.servicePrice || 0);
    }, 0);
  };

  const calculateUsedItemsTotal = () => {
    return (jobCard?.usedItems || []).reduce((sum, item) => {
      return sum + (item.quantityUsed * (item.unitPrice || 0));
    }, 0);
  };

  const calculateGrandTotal = () => {
    const servicePrice = calculateTotalServicePrice();
    const usedItemsPrice = calculateUsedItemsTotal();
    return servicePrice + usedItemsPrice;
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !jobCard) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Job card not found'}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const deviceSerials = jobCard.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];
  const otherSerials = jobCard.serials?.filter(s => s.serialType !== 'DEVICE_SERIAL') || [];

  const isCompleted = jobCard.status === 'COMPLETED';
  const isDelivered = jobCard.status === 'DELIVERED';
  const isCancelled = jobCard.status === 'CANCELLED';
  const isWaitingForParts = jobCard.status === 'WAITING_FOR_PARTS';
  const isWaitingForApproval = jobCard.status === 'WAITING_FOR_APPROVAL';
  const isInProgress = jobCard.status === 'IN_PROGRESS';
  const isPending = jobCard.status === 'PENDING';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className={`p-6 text-white ${
          jobCard.oneDayService 
            ? 'bg-gradient-to-r from-red-600 to-red-800'
            : jobCard.status === 'WAITING_FOR_PARTS'
            ? 'bg-gradient-to-r from-orange-600 to-orange-800'
            : jobCard.status === 'WAITING_FOR_APPROVAL'
            ? 'bg-gradient-to-r from-purple-600 to-purple-800'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{jobCard.jobNumber}</h1>
              <p className="text-blue-100">Job Card Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(jobCard.status)}`}>
              <span className="mr-2">{getStatusIcon(jobCard.status)}</span>
              {jobCard.status.replace(/_/g, ' ')}
            </span>
            {jobCard.oneDayService && (
              <span className="px-3 py-1 bg-white text-red-600 rounded-full text-sm font-bold border-2 border-white">
                🚨 ONE DAY SERVICE
              </span>
            )}
            {isCancelled && (
              <span className="text-red-200 text-sm font-medium">❌ Cancelled</span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Action Buttons */}
          {!isCancelled && !isDelivered && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Status Actions</h2>
              <div className="flex flex-wrap gap-3">
                {isInProgress && (
                  <>
                    <button
                      onClick={() => handleStatusChange('WAITING_FOR_PARTS')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                    >
                      <span>📦</span>
                      <span>Mark as Waiting for Parts</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('WAITING_FOR_APPROVAL')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                    >
                      <span>👥</span>
                      <span>Mark as Waiting for Approval</span>
                    </button>
                  </>
                )}
                {(isWaitingForParts || isWaitingForApproval) && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <span>🔧</span>
                    <span>Back to In Progress</span>
                  </button>
                )}
                {(isPending || isWaitingForParts || isWaitingForApproval) && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Start Work</span>
                  </button>
                )}
                {updatingStatus && (
                  <div className="flex items-center text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Updating status...
                  </div>
                )}
              </div>

              {/* Status Help Text */}
              {(isWaitingForParts || isWaitingForApproval) && (
                <div className={`mt-4 p-3 rounded-lg ${
                  isWaitingForParts ? 'bg-orange-50 border border-orange-200' : 'bg-purple-50 border border-purple-200'
                }`}>
                  <p className={`text-sm ${isWaitingForParts ? 'text-orange-700' : 'text-purple-700'}`}>
                    {isWaitingForParts 
                      ? '⏳ This job is paused waiting for parts. Update inventory or contact supplier.'
                      : '⏳ This job is paused waiting for customer approval. Contact the customer for confirmation.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Job Number</label>
              <p className="text-lg font-bold text-gray-900">{jobCard.jobNumber}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(jobCard.status)}`}>
                {getStatusIcon(jobCard.status)} {jobCard.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Created</label>
              <p className="text-sm text-gray-900">{formatDate(jobCard.createdAt)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Updated</label>
              <p className="text-sm text-gray-900">{formatDate(jobCard.updatedAt)}</p>
            </div>
            {jobCard.completedAt && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Completed</label>
                <p className="text-sm text-gray-900">{formatDate(jobCard.completedAt)}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Device Type</label>
              <p className="text-sm font-semibold text-gray-900">{jobCard.deviceType}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">Customer Name</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Device Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">Device Type</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.deviceType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Brand</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.brand?.brandName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.model?.modelName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Processor</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.processor?.processorName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Device Serials */}
          {deviceSerials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Device Serial Number (PRIMARY)
              </h2>
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                <div className="space-y-3">
                  {deviceSerials.map((serial, index) => (
                    <div key={index} className="flex flex-col space-y-2 bg-white p-4 rounded-lg border-2 border-blue-400 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                          Device Serial
                        </span>
                        <span className="text-blue-600 text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Primary Identifier
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 font-mono text-lg font-bold tracking-wider bg-gray-50 p-3 rounded border border-gray-200">
                          {serial.serialValue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other Serials */}
          {otherSerials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Other Serials (IMEI, etc.)
              </h2>
              <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                <div className="space-y-2">
                  {otherSerials.map((serial, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-purple-300">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded mr-3 ${getSerialTypeColor(serial.serialType)}`}>
                          {serial.serialType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-700 font-semibold">{serial.serialValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* One Day Service Information */}
          {jobCard.oneDayService && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Service Priority
              </h2>
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">One Day Service</h3>
                    <p className="text-red-700">
                      This job is prioritized for 24-hour completion. Urgent attention required!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Conditions */}
          {jobCard.deviceConditions && jobCard.deviceConditions.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Device Conditions ({jobCard.deviceConditions.length})
              </h2>
              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {jobCard.deviceConditions.map(condition => (
                    <div key={condition.id} className="flex items-center gap-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
                      <span className="font-medium">{condition.conditionName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fault Information */}
          {jobCard.faults && jobCard.faults.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Faults ({jobCard.faults.length})
              </h2>
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  {jobCard.faults.map(fault => (
                    <div key={fault.id} className="flex items-center gap-2 bg-red-200 text-red-800 px-3 py-1 rounded-full">
                      <span className="font-medium">{fault.faultName}</span>
                    </div>
                  ))}
                </div>
                {jobCard.faultDescription && (
                  <div className="pt-4 border-t border-red-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Fault Description:</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{jobCard.faultDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Categories */}
          {jobCard.serviceCategories && jobCard.serviceCategories.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Services ({jobCard.serviceCategories.length})
              </h2>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  {jobCard.serviceCategories.map(service => (
                    <div key={service.id} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded-full">
                      <span className="font-medium">
                        {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Service Price */}
                <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Service Price:</span>
                    <span className="text-2xl font-bold text-green-700">
                      Rs.{calculateTotalServicePrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Used Items / Parts */}
          {jobCard.usedItems && jobCard.usedItems.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Used Items / Parts ({jobCard.usedItems.length})
              </h2>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-green-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                      {jobCard.usedItems.map((item, index) => {
                        const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
                        return (
                          <tr key={index} className="hover:bg-green-100 transition-colors">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.inventoryItem?.name || 'Unknown Item'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  SKU: {item.inventoryItem?.sku || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">
                                {item.quantityUsed}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-semibold text-gray-900">
                                Rs.{(item.unitPrice || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-bold text-green-700">
                                Rs.{itemTotal.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total Parts Cost */}
                <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
                  <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-semibold text-gray-900">Total Parts Cost:</span>
                      <span className="text-2xl font-bold text-green-700">
                        Rs.{calculateUsedItemsTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {jobCard.notes && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Additional Notes
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{jobCard.notes}</p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <label className="text-sm font-medium text-blue-600">Advance Payment</label>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                <label className="text-sm font-medium text-green-600">Estimated Cost</label>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                <label className="text-sm font-medium text-purple-600">Total Price at Moment</label>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  Rs.{calculateGrandTotal().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Details (if cancelled) */}
          {isCancelled && jobCard.cancelledBy && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancellation Details
              </h2>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-red-600 font-medium mb-1">Cancelled By</p>
                      <p className="text-lg font-bold text-red-900">
                        {jobCard.cancelledBy === 'CUSTOMER' ? 'Customer' : 'Technician'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium mb-1">User ID</p>
                      <p className="text-lg font-bold text-red-900">#{jobCard.cancelledByUserId}</p>
                    </div>
                  </div>
                </div>

                {jobCard.cancellationReason && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">Reason for Cancellation</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{jobCard.cancellationReason}</p>
                  </div>
                )}

                {jobCard.cancelledBy === 'CUSTOMER' && jobCard.cancellationFee > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium mb-1">Cancellation Fee (Invoice Created)</p>
                    <p className="text-2xl font-bold text-orange-900">Rs.{jobCard.cancellationFee?.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</span>
              </div>
              {jobCard.updatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.updatedAt)}</span>
                </div>
              )}
              {jobCard.completedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Completed:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            {!isCancelled && (
              <>
                {/* Generate Invoice Button */}
                {isCompleted && (
                  <button
                    onClick={() => setShowCreateInvoiceModal(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Invoice</span>
                  </button>
                )}
                {/* Download Job Card Buttons */}
                <button
                  onClick={downloadJobCard}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Print Job Card</span>
                </button>

                {/* <button
                  onClick={exportJobCardPDF}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>
 */}
                {/* Edit Button */}
                {!isDelivered && (
                  <button
                    onClick={() => onEdit(jobCardId)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Job Card</span>
                  </button>
                )}

                {/* Cancel Button */}
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Job Card</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelOrderModal
          jobCard={jobCard}
          onSuccess={handleCancelSuccess}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <CreateInvoiceModal
          jobCard={jobCard}
          onSuccess={handleInvoiceSuccess}
          onClose={() => setShowCreateInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default JobCardView;