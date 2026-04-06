
import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import PaymentModal from './PaymentModal';
import ReturnInvoiceModal from './ReturnInvoiceModal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,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';

const InvoiceView = ({ invoiceId, onClose, onRefresh }) => {
  const { isAdmin } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/invoices/${invoiceId}`);
        setInvoice(data);
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (invoiceId) fetch();
  }, [invoiceId]);

  const handlePaymentSuccess = (resp) => { setInvoice(resp); setShowPaymentModal(false); if (onRefresh) onRefresh(); };
  const handleReturnSuccess = (resp) => { setInvoice(resp.invoice); setShowReturnModal(false); if (onRefresh) onRefresh(); };

  const getStatusColor = (s) => ({ PAID: 'bg-green-100 text-green-800 border-green-300', PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300', UNPAID: 'bg-red-100 text-red-800 border-red-300' }[s] || 'bg-gray-100 text-gray-800 border-gray-300');

  // ✅ Get effective service price for regular customers
  const getEffectiveServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice || 0;
  };

  const IMPORTANT_NOTICE_HTML = `
<div class="notice" style="margin-top:18px;font-size:8.5px;">
  <p style="font-weight:bold;margin:0 0 4px 0;">Important Notice</p>
  <ul style="margin:0;padding-left:14px;line-height:1.7;">
    <li>Warranty covers only manufacturer's defects. Damages or defects due to misuse, negligence, or power issues are not covered.</li>
    <li>Repairs or replacements may include labor or material costs.</li>
    <li>No warranty for cartridges, power adaptors, some battery types, and software.</li>
  </ul>
</div>`;

  const generatePreviewHTML = () => {
    if (!invoice) return '';
    const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
    const paymentMethod = invoice.paymentMethod || 'Cash';
    // ✅ Determine regular customer from invoice
    const isRegular = invoice.isRegularCustomer || false;

    const isCancellationInvoice = invoice.items?.some(item =>
      item.itemType === 'CANCELLATION_FEE' || item.itemCode === 'CANCEL-FEE'
    );

    if (isCancellationInvoice) {
      const cancellationItem = invoice.items?.find(item =>
        item.itemType === 'CANCELLATION_FEE' || item.itemCode === 'CANCEL-FEE'
      ) || invoice.items?.[0];
      const feeAmount = cancellationItem?.total || invoice.total || 0;

      return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>E-TechCare Invoice (A5) - Cancellation Fee</title><style>@page{size:A5;margin:10mm}body{font-family:Arial,sans-serif;font-size:10px;margin:0;padding:0;color:#000;line-height:1.3}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:8px;margin-bottom:10px;border-bottom:3px solid #000}.header-left{display:flex;align-items:center;gap:12px}.logo{width:80px;height:60px;display:flex;align-items:center;justify-content:center;padding:3px;background-color:#fff}.logo img{width:100%;height:100%;object-fit:contain}.company-info h1{font-size:24px;margin:0;font-weight:900;letter-spacing:2px;color:#111}.company-details{text-align:right;line-height:1.5;font-size:9px}.company-details p{margin:2px 0}h2{text-align:center;margin:8px 0;font-size:18px;letter-spacing:1px;border-top:2px solid #000;border-bottom:2px solid #000;padding:6px 0;background-color:#f5f5f5;font-weight:bold}.invoice-details{margin-bottom:10px;font-size:9px;line-height:1.6;display:grid;grid-template-columns:1fr 1fr;gap:3px 15px}.invoice-details p{margin:0}.invoice-details .full-width{grid-column:1 / -1}.invoice-details b{display:inline-block;min-width:110px}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #000;padding:4px 3px;text-align:center}th{background-color:#e8e8e8;font-weight:bold;font-size:9px}td{font-size:9px}.totals{width:100%;border-collapse:collapse;margin-top:8px;font-size:10px}.totals td{padding:4px;text-align:right;border:none}.totals .label{width:80%;text-align:right;font-weight:bold}.totals .value{width:20%;border-bottom:1px solid #000}.totals .highlight{font-weight:bold;border-top:2px solid #000;padding-top:6px}.signatures{margin-top:25px;display:flex;justify-content:space-between;font-size:9px}.signatures div{width:45%;text-align:center}.signatures hr{border:none;border-top:1px solid #000;margin-bottom:3px}</style></head><body>
<div class="header"><div class="header-left"><div class="logo"><img src="${COMPANY_LOGO_BASE64}" alt="E-TechCare Logo"></div><div class="company-info"><h1>E-TECHCARE</h1></div></div><div class="company-details"><p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p><p><b>TEL:</b> 076 795 7125</p><p><b>EMAIL:</b> etechcarelh@gmail.com</p><p><b>WHATSAPP:</b> 076 795 7125</p></div></div>
<h2>CANCELLATION FEE INVOICE</h2>
<div class="invoice-details"><p><b>DATE:</b> ${new Date(invoice.createdAt).toLocaleDateString()}</p><p><b>USER:</b> Admin</p><p><b>INVOICE NO:</b> ${invoice.invoiceNumber}</p><p><b>JOB NO:</b> ${jobNumber}</p><p><b>PAYMENT METHOD:</b> ${paymentMethod}</p><p class="full-width"><b>CUSTOMER:</b> ${invoice.customerName}</p><p class="full-width"><b>CONTACT NUMBER:</b> ${invoice.customerPhone}</p><p class="full-width"><b>REASON:</b> Job Card Cancellation Fee</p></div>
<table><thead><tr><th style="width:5%">No</th><th style="width:15%">Item Code</th><th style="width:50%">Description</th><th style="width:10%">QTY</th><th style="width:10%">Unit Price</th><th style="width:10%">Amount</th></tr></thead><tbody><tr><td>1</td><td> - </td><td>Cancellation Fee</td><td>1</td><td>${feeAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${feeAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr></tbody></table>
<table class="totals"><tr><td class="label highlight">TOTAL</td><td class="value highlight">${feeAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label">DISCOUNT</td><td class="value">0.00</td></tr><tr><td class="label">ADVANCE</td><td class="value">0.00</td></tr><tr><td class="label highlight">SUB TOTAL</td><td class="value highlight">${feeAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label">BALANCE</td><td class="value">${feeAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr></table>
${IMPORTANT_NOTICE_HTML}
<div class="signatures"><div><hr><p>Authorized</p></div><div><hr><p>Customer Signature</p></div></div></body></html>`;
    }

    // ✅ Use effective service price for regular customers in print
    const servicesTotal = (invoice.jobCard?.serviceCategories || []).reduce(
      (s, sv) => s + getEffectiveServicePrice(sv, isRegular), 0
    );
    const invoiceItemsTotal = (invoice.items || []).reduce((s, i) => s + (i.total || 0), 0);
    const calculatedTotal = servicesTotal + invoiceItemsTotal;

    // ✅ Services HTML: show effective price in print
    const servicesHTML = (invoice.jobCard?.serviceCategories || []).map((service, index) => {
      const price = getEffectiveServicePrice(service, isRegular);
      return `<tr><td>${index+1}</td><td>-</td><td>${service.name}${service.description?` (${service.description})`:''}</td><td>-</td><td>-</td><td>1</td><td>${price.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${price.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`;
    }).join('');

    const itemsHTML = (invoice.items || []).map((item, index) => {
      const isSvc = item.itemType === 'SERVICE';
      return `<tr><td>${(invoice.jobCard?.serviceCategories?.length||0)+index+1}</td><td>${isSvc?'-':(item.itemCode||item.sku||'N/A')}</td><td>${item.itemName||'Item'}</td><td>${isSvc?'-':(item.warranty||'No Warranty')}</td><td>${isSvc?'-':(item.warrantyNumber||'-')}</td><td>${item.quantity||0}</td><td>${(item.unitPrice||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${(item.total||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`;
    }).join('');

    const advanceAmount = invoice.paymentStatus === 'PAID' ? 0 : invoice.paidAmount;
    const subTotal = calculatedTotal - (invoice.discount || 0) - advanceAmount;
    const balance = invoice.paymentStatus === 'PAID' ? 0 : invoice.balance;

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>E-TechCare Invoice (A5)</title><style>@page{size:A5;margin:10mm}body{font-family:Arial,sans-serif;font-size:10px;margin:0;padding:0;color:#000;line-height:1.3}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:8px;margin-bottom:10px;border-bottom:3px solid #000}.header-left{display:flex;align-items:center;gap:12px}.logo{width:80px;height:60px;display:flex;align-items:center;justify-content:center;padding:3px;background-color:#fff}.logo img{width:100%;height:100%;object-fit:contain}.company-info h1{font-size:24px;margin:0;font-weight:900;letter-spacing:2px;color:#111}.company-details{text-align:right;line-height:1.5;font-size:9px}.company-details p{margin:2px 0}h2{text-align:center;margin:8px 0;font-size:18px;letter-spacing:1px;border-top:2px solid #000;border-bottom:2px solid #000;padding:6px 0;background-color:#f5f5f5;font-weight:bold}.invoice-details{margin-bottom:10px;font-size:9px;line-height:1.6;display:grid;grid-template-columns:1fr 1fr;gap:3px 15px}.invoice-details p{margin:0}.invoice-details .full-width{grid-column:1 / -1}.invoice-details b{display:inline-block;min-width:110px}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #000;padding:4px 3px;text-align:center}th{background-color:#e8e8e8;font-weight:bold}td{font-size:9px}.totals{width:100%;border-collapse:collapse;margin-top:8px;font-size:10px}.totals td{padding:4px;text-align:right;border:none}.totals .label{width:80%;text-align:right;font-weight:bold}.totals .value{width:20%;border-bottom:1px solid #000}.totals .highlight{font-weight:bold;border-top:2px solid #000;padding-top:6px}.signatures{margin-top:25px;display:flex;justify-content:space-between;font-size:9px}.signatures div{width:45%;text-align:center}.signatures hr{border:none;border-top:1px solid #000;margin-bottom:3px}</style></head><body>
<div class="header"><div class="header-left"><div class="logo"><img src="${COMPANY_LOGO_BASE64}" alt="E-TechCare Logo"></div><div class="company-info"><h1>E-TECHCARE</h1></div></div><div class="company-details"><p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p><p><b>TEL:</b> 076 795 7125</p><p><b>EMAIL:</b> etechcarelh@gmail.com</p><p><b>WHATSAPP:</b> 076 795 7125</p></div></div>
<h2>INVOICE</h2>
<div class="invoice-details"><p><b>DATE:</b> ${new Date(invoice.createdAt).toLocaleDateString()}</p><p><b>USER:</b> Admin</p><p><b>INVOICE NO:</b> ${invoice.invoiceNumber}</p><p><b>JOB NO:</b> ${jobNumber}</p><p><b>PAYMENT METHOD:</b> ${paymentMethod}</p><p class="full-width"><b>CUSTOMER:</b> ${invoice.customerName}${isRegular?' ⭐':''}</p><p class="full-width"><b>CONTACT NUMBER:</b> ${invoice.customerPhone}</p></div>
<table><thead><tr><th style="width:5%">No</th><th style="width:11%">Item Code</th><th style="width:28%">Description</th><th style="width:11%">Warranty</th><th style="width:11%">Warranty No</th><th style="width:7%">QTY</th><th style="width:13%">Unit Price</th><th style="width:14%">Amount</th></tr></thead><tbody>${servicesHTML}${itemsHTML}</tbody></table>
<table class="totals"><tr><td class="label highlight">TOTAL</td><td class="value highlight">${calculatedTotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label">DISCOUNT</td><td class="value">${(invoice.discount||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label">ADVANCE</td><td class="value">${advanceAmount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label highlight">SUB TOTAL</td><td class="value highlight">${subTotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr><tr><td class="label">BALANCE</td><td class="value">${balance.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr></table>
${IMPORTANT_NOTICE_HTML}
<div class="signatures"><div><hr><p>Authorized</p></div><div><hr><p>Customer Signature</p></div></div></body></html>`;
  };

  const openPreview = () => {
    const html = generatePreviewHTML();
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !invoice) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error || 'Invoice not found'}</div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Back</button>
    </div>
  );

  // ✅ Determine regular customer status from invoice
  const isRegular = invoice.isRegularCustomer || false;

  const deviceSerials = invoice.jobCard?.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];
  const usedItemsTotal = (invoice.jobCard?.usedItems || []).reduce((s, i) => s + (i.quantityUsed * (i.unitPrice || 0)), 0);

  // ✅ Use effective service price for totals
  const jobCardServicesTotal = (invoice.jobCard?.serviceCategories || []).reduce(
    (s, sv) => s + getEffectiveServicePrice(sv, isRegular), 0
  );

  const cardCls = "bg-white border border-gray-200 rounded p-2";
  const cardT = "text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5";
  const tblH = "px-2 py-1.5 text-left font-semibold text-gray-700 text-xs";
  const tblD = "px-2 py-1.5 text-xs";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-7xl h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold">{invoice.invoiceNumber}</h1>
              <p className="text-blue-200 text-xs">Invoice Details</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(invoice.paymentStatus)}`}>{invoice.paymentStatus}</span>
            {invoice.isReturned && <span className="bg-orange-500 px-2 py-0.5 rounded text-xs font-bold text-white">RETURNED</span>}
            {/* ✅ Regular customer badge */}
            {isRegular && <span className="bg-white text-blue-700 px-2 py-0.5 rounded text-xs font-bold">⭐ Regular Customer</span>}
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-4 gap-2 p-2 min-h-0">

          {/* === COL 1: Customer + Job Card + Device + Timeline === */}
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0 pr-0.5">

            {invoice.isReturned && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded p-2 text-xs">
                <p className="font-bold text-orange-900 mb-1">Invoice Return Info</p>
                <p><span className="text-orange-600">Date:</span> {new Date(invoice.returnedAt).toLocaleString()}</p>
                <p><span className="text-orange-600">Amount:</span> <b>Rs.{invoice.returnedAmount?.toFixed(2) || '0.00'}</b></p>
                <p className="mt-1"><span className="text-orange-600">Reason:</span></p>
                <p className="bg-white p-1 rounded border border-orange-200 mt-0.5">{invoice.returnReason}</p>
              </div>
            )}

            {/* Customer */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-1.5">
                <p className={cardT + ' mb-0'}>Customer</p>
                {isRegular && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">⭐ Regular</span>}
              </div>
              <div className="space-y-0.5 text-xs">
                <p><span className="text-gray-500">Name:</span> <b>{invoice.customerName}</b></p>
                <p><span className="text-gray-500">Phone:</span> <b>{invoice.customerPhone}</b></p>
                <p><span className="text-gray-500">Email:</span> {invoice.customerEmail || 'N/A'}</p>
              </div>
              {isRegular && (
                <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                  <p className="text-xs text-blue-700 font-medium">⭐ Special pricing applied</p>
                </div>
              )}
            </div>

            {/* Job Card Info */}
            {invoice.jobCard && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className={cardT + ' text-green-700'}>Job Card</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                  <div><p className="text-gray-500">Job #</p><p className="font-bold text-green-700">{invoice.jobCard.jobNumber}</p></div>
                  <div><p className="text-gray-500">Device</p><p className="font-semibold">{invoice.jobCard.deviceType}</p></div>
                  <div><p className="text-gray-500">Status</p><p className="font-semibold">{invoice.jobCard.status}</p></div>
                </div>
              </div>
            )}

            {/* Device Serials */}
            {deviceSerials.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className={cardT + ' text-blue-700'}>Device Serials</p>
                {deviceSerials.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-blue-300 text-xs">
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded mr-2">SN</span>
                    <span className="font-semibold text-gray-800 flex-1">{s.serialValue}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className={cardCls}>
              <p className={cardT}>Timeline</p>
              <div className="space-y-0.5 text-xs">
                <p><span className="text-gray-500">Created:</span> {new Date(invoice.createdAt).toLocaleString()}</p>
                {invoice.updatedAt && <p><span className="text-gray-500">Updated:</span> {new Date(invoice.updatedAt).toLocaleString()}</p>}
                {invoice.isReturned && invoice.returnedAt && <p><span className="text-orange-500">Returned:</span> {new Date(invoice.returnedAt).toLocaleString()}</p>}
              </div>
            </div>
          </div>

          {/* === COL 2: Services + Parts + Used Items === */}
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0 pr-0.5">

            {/* ✅ Job Card Services with special pricing */}
            {invoice.jobCard?.serviceCategories?.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className={cardT + ' text-purple-700 mb-0'}>Services Performed</p>
                  {isRegular && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special</span>}
                </div>
                <div className="space-y-1">
                  {invoice.jobCard.serviceCategories.map((sv, i) => {
                    const price = getEffectiveServicePrice(sv, isRegular);
                    const hasSpecial = isRegular && sv.specialServicePrice != null;
                    return (
                      <div key={i} className={`flex justify-between p-1.5 rounded border text-xs ${hasSpecial ? 'bg-blue-50 border-blue-200' : 'bg-white border-purple-200'}`}>
                        <div>
                          <p className="font-semibold text-gray-900">{sv.name}</p>
                          {sv.description && !hasSpecial && <p className="text-gray-500">{sv.description}</p>}
                          {hasSpecial && (
                            <p className="text-gray-400 line-through text-xs">Rs.{sv.servicePrice?.toFixed(2)}</p>
                          )}
                          <span className="bg-purple-200 text-purple-800 px-1 py-0.5 rounded text-xs">{sv.code}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-bold ${hasSpecial ? 'text-blue-700' : 'text-purple-700'}`}>
                            {hasSpecial && '⭐ '}Rs.{price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-purple-300 pt-1 mt-1 text-right">
                  <p className="text-xs font-bold text-purple-700">
                    Total{isRegular ? ' ⭐' : ''}: Rs.{jobCardServicesTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Parts section */}
            {invoice.items?.filter(it => it.itemType === 'PART').length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className={cardT + ' text-green-700'}>Parts/Items</p>
                <div className="space-y-1">
                  {invoice.items.filter(it => it.itemType === 'PART').map((item, i) => (
                    <div key={i} className="bg-white p-1.5 rounded border border-green-200 text-xs">
                      <div className="flex justify-between">
                        <div className="min-w-0 flex-1">
                          <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono text-xs mr-1">{item.itemCode || 'N/A'}</span>
                          <span className="font-semibold text-gray-900">{item.itemName}</span>
                        </div>
                        <span className="font-bold text-green-700 ml-1">Rs.{(item.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2 mt-0.5 text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        {item.warranty && item.warranty !== 'No Warranty' && <span className="bg-blue-100 text-blue-800 px-1 rounded">{item.warranty}</span>}
                        {item.warrantyNumber && <span className="bg-green-100 text-green-800 px-1 rounded font-mono font-bold">{item.warrantyNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-green-300 pt-1 mt-1 text-right">
                  <p className="text-xs font-bold text-green-700">Total: Rs.{invoice.items.filter(it => it.itemType === 'PART').reduce((s, it) => s + (it.total || 0), 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Used Items */}
            {invoice.jobCard?.usedItems?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className={cardT + ' text-green-700'}>Used Items (Job Card)</p>
                <div className="space-y-1">
                  {invoice.jobCard.usedItems.map((item, i) => {
                    const t = (item.quantityUsed || 0) * (item.unitPrice || 0);
                    return (
                      <div key={i} className="bg-white p-1.5 rounded border border-green-200 text-xs">
                        <div className="flex justify-between">
                          <div>
                            <span className="bg-blue-100 text-blue-800 px-1 rounded font-mono text-xs mr-1">{item.inventoryItem?.sku || 'N/A'}</span>
                            <span className="font-semibold">{item.inventoryItem?.name}</span>
                          </div>
                          <span className="font-bold text-green-700">Rs.{t.toFixed(2)}</span>
                        </div>
                        <p className="text-gray-500 mt-0.5">Qty: {item.quantityUsed} · Price: Rs.{(item.unitPrice || 0).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-green-300 pt-1 mt-1 text-right">
                  <p className="text-xs font-bold text-green-700">Total: Rs.{usedItemsTotal.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* === COL 3: Invoice Items Table + Faults === */}
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0 pr-0.5">

            {invoice.jobCard?.fault && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className={cardT + ' text-red-700'}>Fault Info</p>
                <p className="text-xs font-bold text-red-700">{invoice.jobCard.fault.faultName}</p>
                {invoice.jobCard.faultDescription && <p className="text-xs text-gray-700 mt-1 bg-white p-1.5 rounded border border-red-200 whitespace-pre-wrap">{invoice.jobCard.faultDescription}</p>}
              </div>
            )}

            <div className={cardCls + ' flex-1'}>
              <p className={cardT}>Invoice Items</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={tblH}>Code</th>
                      <th className={tblH}>Item</th>
                      <th className={tblH + ' text-center'}>Qty</th>
                      <th className={tblH + ' text-right'}>Rate</th>
                      <th className={tblH + ' text-center'}>Warranty</th>
                      <th className={tblH + ' text-center'}>W#</th>
                      <th className={tblH + ' text-right'}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => {
                        const isSvc = item.itemType === 'SERVICE';
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className={tblD}>
                              <span className={`px-1 py-0.5 rounded font-mono ${isSvc ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'}`}>{isSvc ? '-' : (item.itemCode || item.sku || 'N/A')}</span>
                            </td>
                            <td className={tblD}>
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              {item.serialNumbers?.length > 0 && <p className="text-gray-500">Serials: {item.serialNumbers.join(', ')}</p>}
                            </td>
                            <td className={tblD + ' text-center font-semibold'}>{item.quantity}</td>
                            <td className={tblD + ' text-right font-semibold'}>Rs.{(item.unitPrice || 0).toFixed(2)}</td>
                            <td className={tblD + ' text-center'}>
                              {isSvc ? <span className="text-gray-400">-</span> : item.warranty && item.warranty !== 'No Warranty'
                                ? <span className="bg-blue-100 text-blue-800 px-1 rounded text-xs">{item.warranty}</span>
                                : <span className="text-gray-400">None</span>}
                            </td>
                            <td className={tblD + ' text-center'}>
                              {isSvc ? <span className="text-gray-400">-</span> : item.warrantyNumber
                                ? <span className="bg-green-100 text-green-800 px-1 rounded font-mono font-bold text-xs">{item.warrantyNumber}</span>
                                : <span className="text-gray-400">-</span>}
                            </td>
                            <td className={tblD + ' text-right font-bold text-blue-600'}>Rs.{(item.total || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="7" className="px-2 py-4 text-center text-gray-400 text-xs">No items in invoice</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* === COL 4: Payment Summary + Actions === */}
          <div className="flex flex-col gap-2 overflow-hidden min-h-0">

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded p-2">
              <p className={cardT + ' text-blue-700'}>Payment Summary</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">Rs.{invoice.subtotal.toFixed(2)}</span></div>
                {invoice.discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-red-600">-Rs.{invoice.discount.toFixed(2)}</span></div>}
                {invoice.tax > 0 && <div className="flex justify-between"><span className="text-gray-600">Tax:</span><span>+Rs.{invoice.tax.toFixed(2)}</span></div>}
                <div className="flex justify-between border-t-2 border-blue-300 pt-1">
                  <span className="font-bold text-gray-900">Total{isRegular ? ' ⭐' : ''}:</span>
                  <span className="text-blue-700 font-bold text-sm">Rs.{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                <p className="text-xs text-green-500 font-medium">Paid</p>
                <p className="text-lg font-bold text-green-700">Rs.{invoice.paidAmount.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                <p className="text-xs text-yellow-500 font-medium">Balance Due</p>
                <p className="text-lg font-bold text-yellow-700">Rs.{invoice.balance.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                <p className="text-xs text-blue-500 font-medium">Payment Method</p>
                <p className="text-sm font-bold text-blue-700">{invoice.paymentMethod || 'Not Set'}</p>
              </div>
            </div>

            <div className={`rounded px-3 py-1.5 text-center text-xs font-bold border ${getStatusColor(invoice.paymentStatus)}`}>
              ● {invoice.paymentStatus}
            </div>

            <div className="flex-1 min-h-0" />

            <div className="space-y-1.5 flex-shrink-0">
              <button onClick={openPreview}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Print A5 Invoice
              </button>

              {invoice.paymentStatus !== 'PAID' && !invoice.isReturned && (
                <button onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold">
                  Add Payment
                </button>
              )}

              {isAdmin() && invoice.paymentStatus === 'PAID' && !invoice.isReturned && (
                <button onClick={() => setShowReturnModal(true)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Return Invoice
                </button>
              )}

              <button onClick={onClose}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

      {showPaymentModal && <PaymentModal invoice={invoice} onSuccess={handlePaymentSuccess} onClose={() => setShowPaymentModal(false)} />}
      {showReturnModal && <ReturnInvoiceModal invoice={invoice} onSuccess={handleReturnSuccess} onClose={() => setShowReturnModal(false)} />}
    </div>
  );
};

export default InvoiceView;