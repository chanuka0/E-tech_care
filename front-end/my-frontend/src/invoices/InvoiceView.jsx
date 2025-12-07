import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import PaymentModal from './PaymentModal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// REPLACE THIS WITH YOUR ACTUAL BASE64 IMAGE STRING
const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAUUUUIRRRRQhFFFFCEUUUUIX//2Q==';

const InvoiceView = ({ invoiceId, onClose, onRefresh }) => {
  const { apiCall } = useApi();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/invoices/${invoiceId}`);
        setInvoice(data);
      } catch (err) {
        setError('Failed to load invoice');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePaymentSuccess = (response) => {
    setInvoice(response);
    setShowPaymentModal(false);
    if (onRefresh) onRefresh();
  };

  const generatePreviewHTML = () => {
    if (!invoice) return '';

    const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
    const paymentMethod = invoice.paymentMethod || 'Cash';
    
    // Generate services HTML from job card
    const servicesHTML = (invoice.jobCard?.serviceCategories || []).map((service, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>SERVICE</td>
        <td>${service.name} ${service.description ? `(${service.description})` : ''}</td>
        <td>Service</td>
        <td>1</td>
        <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');
    
    // Generate parts HTML with itemCode and warrantyNumber
    const itemsHTML = (invoice.items || []).map((item, index) => `
      <tr>
        <td>${(invoice.jobCard?.serviceCategories?.length || 0) + index + 1}</td>
        <td>${item.itemCode || item.sku || 'N/A'}</td>
        <td>${item.itemName || 'Item'}</td>
        <td>${item.warranty || 'No Warranty'}</td>
        <td>${item.quantity || 0}</td>
        <td>${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    // Calculate totals
    const servicesTotal = (invoice.jobCard?.serviceCategories || [])
      .reduce((sum, service) => sum + (service.servicePrice || 0), 0);
    const itemsSubtotal = invoice.subtotal || 0;
    const combinedSubtotal = servicesTotal + itemsSubtotal;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>E-TechCare Invoice (A5)</title>
<style>
    @page {
        size: A5;
        margin: 15mm;
    }
    body {
        font-family: Arial, sans-serif;
        font-size: 13px;
        margin: 0;
        padding: 0;
        color: #000;
    }

    /* HEADER */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
    }
    .company-info {
        line-height: 1.5;
    }
    .company-info h1 {
        font-size: 36px;
        margin: 0;
        font-weight: 900;
        letter-spacing: 1px;
        color: #111;
    }
    .company-info p {
        margin: 2px 0;
        font-size: 12px;
    }
    .logo img {
        width: 100px;
        height: auto;
    }

    /* TITLE */
    h2 {
        text-align: center;
        text-decoration: underline;
        margin: 12px 0;
        font-size: 22px;
        letter-spacing: 1px;
    }

    /* INVOICE DETAILS */
    .invoice-details {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 12px;
    }
    .invoice-details td {
        padding: 4px 6px;
        border: 1px solid #000;
    }

    /* ITEM TABLE */
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }
    th, td {
        border: 1px solid #000;
        padding: 6px;
        text-align: center;
    }
    th {
        background-color: #f3f3f3;
        font-weight: bold;
    }

    /* TOTAL SECTION */
    .totals {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 13px;
    }
    .totals td {
        padding: 6px;
        text-align: right;
        border: none;
    }
    .totals .label {
        width: 80%;
        text-align: right;
        font-weight: bold;
    }
    .totals .value {
        width: 20%;
        border-bottom: 1px solid #000;
    }
    .totals .highlight {
        background-color: #e8f4e5;
        font-weight: bold;
        border: 1px solid #000;
    }

    /* NOTICE */
    .notice {
        margin-top: 20px;
        font-size: 11px;
    }
    .notice b {
        display: block;
        margin-bottom: 5px;
    }
    ul {
        margin-top: 0;
        padding-left: 20px;
    }

    /* SIGNATURES */
    .signatures {
        margin-top: 35px;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
    }
    .signatures div {
        width: 45%;
        text-align: center;
    }
    .signatures hr {
        border: none;
        border-top: 1px solid #000;
        margin-bottom: 3px;
    }
</style>
</head>
<body>

<div class="header">
    <div class="company-info">
        <h1>E - TECHCARE</h1>
        <p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p>
        <p><b>TEL:</b> 076 795 7125</p>
        <p><b>EMAIL:</b> etechcarelh@gmail.com</p>
        <p><b>WHATSAPP:</b> 076 795 7125</p>
    </div>
    <div class="logo">
        <img src="${COMPANY_LOGO_BASE64}" alt="TechCare Logo" onerror="this.style.display='none'">
    </div>
</div>

<h2>INVOICE</h2>

<table class="invoice-details">
    <tr>
        <td><b>DATE :</b> ${new Date(invoice.createdAt).toLocaleDateString()}</td>
        <td><b>USER :</b> Admin</td>
        <td><b>JOB NO :</b> ${jobNumber}</td>
    </tr>
    <tr>
        <td><b>INVOICE NO :</b> ${invoice.invoiceNumber}</td>
        <td><b>PMT METHOD :</b> ${paymentMethod}</td>
        <td><b>CUSTOMER :</b> ${invoice.customerName}</td>
    </tr>
    <tr>
        <td colspan="3"><b>CONTACT NUMBER :</b> ${invoice.customerPhone}</td>
    </tr>
</table>

<!-- UPDATED: Combined Services + Items Table -->
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Item Code</th>
            <th>Description</th>
            <th>Warranty</th>
            <th>QTY</th>
            <th>Unit Price</th>
            <th>Amount</th>
        </tr>
    </thead>
    <tbody>
        ${servicesHTML}
        ${itemsHTML}
    </tbody>
</table>

<!-- UPDATED: Total Section with Services -->
<table class="totals">
    <tr>
        <td class="label">SUBTOTAL (Items)</td>
        <td class="value">${itemsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">SERVICES TOTAL</td>
        <td class="value">${servicesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">COMBINED TOTAL</td>
        <td class="value">${combinedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">DISCOUNT</td>
        <td class="value">${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">ADVANCE</td>
        <td class="value">${invoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label highlight">SUB TOTAL</td>
        <td class="value highlight">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">BALANCE</td>
        <td class="value">${invoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
</table>

<div class="notice">
    <b>Important Notice</b>
    <ul>
        <li>Warranty period one year less than 14 working days.</li>
        <li>Warranty covers only manufacturer's defects. Damages or defects due to misuse, negligence, or power issues are not covered.</li>
        <li>Repairs or replacements may include labor or material costs.</li>
        <li>No warranty for cartridges, power adaptors, some battery types, and software.</li>
    </ul>
</div>

<div class="signatures">
    <div>
        <hr>
        <p>Authorized</p>
    </div>
    <div>
        <hr>
        <p>Customer Signature</p>
    </div>
</div>

</body>
</html>
    `;
  };

  const openPreview = () => {
    const previewHTML = generatePreviewHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(previewHTML);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const exportTemplatePDF = () => {
    if (!invoice) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header with logo placeholder
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('E - TECHCARE', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text('No.158, Wakwella Road, Galle', margin, yPosition);
    yPosition += 4;
    pdf.text('TEL: 076 795 7125 | EMAIL: etechcarelh@gmail.com', margin, yPosition);
    yPosition += 4;
    pdf.text('WHATSAPP: 076 795 7125', margin, yPosition);
    yPosition += 8;

    // Add logo placeholder box
    pdf.rect(pageWidth - margin - 25, margin, 25, 25);
    pdf.setFontSize(7);
    pdf.text('Company Logo', pageWidth - margin - 12.5, margin + 12.5, { align: 'center' });

    // Horizontal line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Invoice Title
    pdf.setFontSize(16);
    pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Invoice Details Table
    const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
    const details = [
      [`DATE: ${new Date(invoice.createdAt).toLocaleDateString()}`, `USER: Admin`, `JOB NO: ${jobNumber}`],
      [`INVOICE NO: ${invoice.invoiceNumber}`, `PMT METHOD: ${invoice.paymentMethod || 'Cash'}`, `CUSTOMER: ${invoice.customerName}`],
      [`CONTACT NUMBER: ${invoice.customerPhone}`, '', '']
    ];

    pdf.setFontSize(8);
    details.forEach(row => {
      pdf.text(row[0], margin, yPosition);
      pdf.text(row[1], pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(row[2], pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 4;
    });
    yPosition += 5;

    // UPDATED: Items Table with Services and itemCode
    const servicesData = (invoice.jobCard?.serviceCategories || []).map((service, index) => [
      (index + 1).toString(),
      'SERVICE',
      service.name,
      'Service',
      '1',
      `Rs.${(service.servicePrice || 0).toFixed(2)}`,
      `Rs.${(service.servicePrice || 0).toFixed(2)}`
    ]);

    const itemsData = (invoice.items || []).map((item, index) => [
      ((invoice.jobCard?.serviceCategories?.length || 0) + index + 1).toString(),
      item.itemCode || item.sku || 'N/A',
      item.itemName || 'Item',
      item.warranty || 'No Warranty',
      (item.quantity || 0).toString(),
      `Rs.${(item.unitPrice || 0).toFixed(2)}`,
      `Rs.${(item.total || 0).toFixed(2)}`
    ]);

    const combinedData = [...servicesData, ...itemsData];

    pdf.autoTable({
      startY: yPosition,
      head: [['No', 'Item Code', 'Description', 'Warranty', 'QTY', 'Unit Price', 'Amount']],
      body: combinedData,
      styles: { 
        fontSize: 7,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - (margin * 2)
    });

    let finalY = pdf.lastAutoTable.finalY + 5;

    // UPDATED: Totals with Services
    const servicesTotal = (invoice.jobCard?.serviceCategories || [])
      .reduce((sum, service) => sum + (service.servicePrice || 0), 0);
    const itemsSubtotal = invoice.subtotal || 0;
    const combinedSubtotal = servicesTotal + itemsSubtotal;

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text(`ITEMS SUBTOTAL: Rs.${itemsSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`SERVICES TOTAL: Rs.${servicesTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`COMBINED TOTAL: Rs.${combinedSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`DISCOUNT: Rs.${invoice.discount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`ADVANCE: Rs.${invoice.paidAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`SUB TOTAL: Rs.${invoice.total.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`BALANCE: Rs.${invoice.balance.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 10;

    // Important Notice
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(7);
    pdf.text('Important Notice:', margin, finalY);
    finalY += 4;
    pdf.text('- Warranty covers only manufacturer\'s defects. Damages due to misuse not covered.', margin, finalY);
    finalY += 3;
    pdf.text('- Repairs may include labor or material costs.', margin, finalY);
    finalY += 3;
    pdf.text('- No warranty for cartridges, adaptors, batteries, software.', margin, finalY);
    finalY += 10;

    // Signatures
    const signatureY = finalY + 15;
    pdf.line(margin + 10, signatureY, margin + 50, signatureY);
    pdf.line(pageWidth - margin - 50, signatureY, pageWidth - margin - 10, signatureY);
    pdf.text('Authorized', margin + 30, signatureY + 5, { align: 'center' });
    pdf.text('Customer Signature', pageWidth - margin - 30, signatureY + 5, { align: 'center' });

    pdf.save(`Invoice_${invoice.invoiceNumber}_A5.pdf`);
  };

  const exportPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 12;

    // Customer Info
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 6;
    doc.setFontSize(9);
    doc.text(`Name: ${invoice.customerName}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${invoice.customerPhone}`, 20, yPosition);
    yPosition += 5;
    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, 20, yPosition);
      yPosition += 5;
    }

    // Job Card Info (if exists)
    if (invoice.jobCard) {
      yPosition += 3;
      doc.setFont(undefined, 'bold');
      doc.text('Job Card Details:', 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 5;
      doc.text(`Job Number: ${invoice.jobCard.jobNumber}`, 20, yPosition);
      yPosition += 5;
      if (invoice.jobCard.fault) {
        doc.text(`Fault Type: ${invoice.jobCard.fault.faultName}`, 20, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 5;

    // Items Table with itemCode
    const itemsData = (invoice.items || []).map(item => [
      item.itemCode || item.sku || 'N/A',
      item.itemName || 'Item',
      item.quantity || 0,
      `Rs.${(item.unitPrice || 0).toFixed(2)}`,
      `Rs.${(item.total || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Item Code', 'Description', 'Qty', 'Rate', 'Total']],
      body: itemsData,
      margin: { left: 20, right: 20 }
    });

    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal: Rs.${invoice.subtotal.toFixed(2)}`, 20, finalY);
    doc.text(`Discount: -Rs.${invoice.discount.toFixed(2)}`, 20, finalY + 6);
    doc.text(`Tax: +Rs.${invoice.tax.toFixed(2)}`, 20, finalY + 12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: Rs.${invoice.total.toFixed(2)}`, 20, finalY + 20);
    doc.setFont(undefined, 'normal');
    doc.text(`Paid: Rs.${invoice.paidAmount.toFixed(2)}`, 20, finalY + 26);
    doc.text(`Balance: Rs.${invoice.balance.toFixed(2)}`, 20, finalY + 32);

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 border-green-300',
      PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      UNPAID: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Invoice not found'}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    );
  }

  // Get device serials only (DEVICE_SERIAL type)
  const deviceSerials = invoice.jobCard?.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];

  // Calculate total for used items
  const usedItemsTotal = (invoice.jobCard?.usedItems || []).reduce((sum, item) => {
    return sum + (item.quantityUsed * (item.unitPrice || 0));
  }, 0);

  // Calculate total services cost from job card
  const jobCardServicesTotal = (invoice.jobCard?.serviceCategories || [])
    .reduce((sum, service) => sum + (service.servicePrice || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{invoice.invoiceNumber}</h1>
              <p className="text-blue-100">Invoice Details</p>
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
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getPaymentStatusColor(invoice.paymentStatus)}`}>
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                <p className="text-sm font-medium text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{invoice.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{invoice.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Job Card Information */}
          {invoice.jobCard && (
            <>
              {/* Job Card Header */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Job Card Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Number</p>
                    <p className="font-bold text-lg text-green-700">{invoice.jobCard.jobNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Device Type</p>
                    <p className="font-semibold text-gray-900">{invoice.jobCard.deviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">{invoice.jobCard.status}</p>
                  </div>
                </div>
              </div>

              {/* Fault Information */}
              {invoice.jobCard.fault && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fault Information
                  </h2>
                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600">Fault Type</p>
                      <p className="font-bold text-lg text-red-700">{invoice.jobCard.fault.faultName}</p>
                    </div>
                    <div className="pt-3 border-t border-red-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Fault Description</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{invoice.jobCard.faultDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Serial (DEVICE_SERIAL only) */}
              {deviceSerials.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Device Serial
                  </h2>
                  <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                    <div className="space-y-2">
                      {deviceSerials.map((serial, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-3">DEVICE_SERIAL</span>
                            <span className="text-gray-700 font-semibold text-lg">{serial.serialValue}</span>
                          </div>
                          <span className="text-blue-600 text-sm font-medium">🔹 Primary</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Used Items / Parts - WITH WARRANTY */}
              {invoice.jobCard.usedItems && invoice.jobCard.usedItems.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 15h8" />
                    </svg>
                    Used Items / Parts
                  </h2>
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-green-300">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Warranty</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {invoice.jobCard.usedItems.map((item, index) => {
                            const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
                            return (
                              <tr key={index} className="hover:bg-green-100 transition-colors">
                                <td className="py-3 px-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                    {item.inventoryItem?.sku || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {item.inventoryItem?.name || 'Unknown Item'}
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
                                <td className="text-left py-3 px-2">
                                  {item.warranty ? (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                      {item.warranty}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 text-xs">None</span>
                                  )}
                                </td>
                                <td className="text-center py-3 px-2">
                                  {item.warrantyNumber ? (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                      {item.warrantyNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
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
                            Rs.{usedItemsTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Card Services Section - NEW */}
              {invoice.jobCard?.serviceCategories && invoice.jobCard.serviceCategories.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Services Performed
                  </h2>
                  <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-purple-300">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Code</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-200">
                          {invoice.jobCard.serviceCategories.map((service, index) => (
                            <tr key={index} className="hover:bg-purple-100 transition-colors">
                              <td className="py-3 px-2">
                                <span className="font-semibold text-gray-900">{service.name}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  {service.code}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-gray-600">
                                {service.description || 'N/A'}
                              </td>
                              <td className="text-right py-3 px-2">
                                <span className="font-bold text-purple-700">
                                  Rs.{(service.servicePrice || 0).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Services Cost */}
                    <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
                      <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-lg font-semibold text-gray-900">Total Services Cost:</span>
                          <span className="text-2xl font-bold text-purple-700">
                            Rs.{jobCardServicesTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Services Section - ADDED */}
          {invoice.items && invoice.items.filter(item => item.itemType === 'SERVICE').length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Services Provided
              </h2>
              <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-purple-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200">
                      {invoice.items
                        .filter(item => item.itemType === 'SERVICE')
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-purple-100 transition-colors">
                            <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
                            <td className="text-center py-3 px-2 font-semibold">
                              <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2 font-semibold text-gray-900">
                              Rs.{(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-2 font-bold text-purple-700">
                              Rs.{(item.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Services Total */}
                <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
                  <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-semibold text-gray-900">Total Services:</span>
                      <span className="text-2xl font-bold text-purple-700">
                        Rs.{invoice.items
                          .filter(item => item.itemType === 'SERVICE')
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parts Section - ADDED */}
          {invoice.items && invoice.items.filter(item => item.itemType === 'PART').length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Parts/Items Used
              </h2>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-green-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                      {invoice.items
                        .filter(item => item.itemType === 'PART')
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-green-100 transition-colors">
                            <td className="px-2 py-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                {item.itemCode || item.sku || 'N/A'}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
                            <td className="text-center py-3 px-2 font-semibold">
                              <span className="bg-green-200 text-green-800 px-3 py-1 rounded">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2 font-semibold text-gray-900">
                              Rs.{(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-center py-3 px-2">
                              {item.warranty && item.warranty !== 'No Warranty' ? (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {item.warranty}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">None</span>
                              )}
                            </td>
                            <td className="text-center py-3 px-2">
                              {item.warrantyNumber ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                  {item.warrantyNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="text-right py-3 px-2 font-bold text-green-700">
                              Rs.{(item.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Parts Total */}
                <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
                  <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-semibold text-gray-900">Total Parts:</span>
                      <span className="text-2xl font-bold text-green-700">
                        Rs.{invoice.items
                          .filter(item => item.itemType === 'PART')
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items Table - MAIN ITEMS */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Item Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty #</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        {/* ✅ NEW: Item Code Column */}
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                            {item.itemCode || item.sku || 'N/A'}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.itemName || 'Item'}</p>
                            {item.serialNumbers && item.serialNumbers.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Serials: </span>
                                <span>{item.serialNumbers.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          {item.quantity || 0}
                        </td>
                        
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          Rs.{(item.unitPrice || 0).toFixed(2)}
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          {item.warranty && item.warranty !== 'No Warranty' ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {item.warranty}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">None</span>
                          )}
                        </td>
                        
                        {/* ✅ NEW: Warranty Number Column */}
                        <td className="px-4 py-3 text-center">
                          {item.warrantyNumber ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                              {item.warrantyNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          Rs.{(item.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                        No items in invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">Rs.{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-Rs.{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">+Rs.{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">Rs.{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-700">Rs.{invoice.paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-yellow-700">Rs.{invoice.balance.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Payment Method</p>
              <p className="text-lg font-bold text-blue-700">{invoice.paymentMethod || 'Not Set'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              Print
            </button>
            <button
              onClick={openPreview}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Preview A5 Template</span>
            </button>
            <button
              onClick={exportTemplatePDF}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download A5 PDF</span>
            </button>
            {invoice.paymentStatus !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
              >
                Add Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default InvoiceView;