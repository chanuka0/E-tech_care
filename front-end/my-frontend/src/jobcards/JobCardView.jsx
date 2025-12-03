// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import CancelOrderModal from './CancelOrderModal';
// import CreateInvoiceModal from "../invoices/CreateInvoiceModal";
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';


// const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCABlAKoDASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAAgGBwMEBQECCf/EAEsQAAEDAwMABQYHDQYGAwAAAAERAAMABAUGEQcSIhMUITEyQVFSYXGBkQgWJDVCVJGSk6Gx0hczNlVicnOCssJDV4Oiw9Hh/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAQFAwIGAP/EADgRAAEDAgIHBAkCBwAAAAAAAAIAAQMEEgURExQhIjFBUTJSkZIVQmFicXKBoeGxwSMkM0NTorL/2gAMAwEAAhEDEQA/AH4f8Ce9WvWw/wCBPerXoQiiihEIvDQhFFe8SH1a8oQiiiihCKKKKEIooooQiiiihCKKKEHl4aFQh8VCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIX//2Q==';


// const JobCardView = ({ jobCardId, onClose, onEdit, onStatusChange, onNavigate }) => {
//   const { apiCall } = useApi();
//   const [jobCard, setJobCard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(false);

//   useEffect(() => {
//     const fetchJobCard = async () => {
//       try {
//         setLoading(true);
//         const data = await apiCall(`/api/jobcards/${jobCardId}`);
//         setJobCard(data);
//       } catch (err) {
//         setError('Failed to load job card details');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (jobCardId) {
//       fetchJobCard();
//     }
//   }, [jobCardId]);

// const downloadJobCard = () => {
//   try {
//     const jobCardHTML = generateJobCardHTML();
//     const printWindow = window.open('', '_blank');
    
//     if (!printWindow) {
//       alert('Please allow pop-ups to print the job card');
//       return;
//     }
    
//     printWindow.document.write(jobCardHTML);
//     printWindow.document.close();
    
//     // Wait for content to fully load before printing
//     setTimeout(() => {
//       printWindow.focus();
//       printWindow.print();
//     }, 500);
//   } catch (error) {
//     console.error('Error printing job card:', error);
//     alert('Error printing job card: ' + error.message);
//   }
// };

// const exportJobCardPDF = () => {
//   try {
//     const jobCardHTML = generateJobCardHTML();
//     const printWindow = window.open('', '_blank');
    
//     if (!printWindow) {
//       alert('Please allow pop-ups to download the job card');
//       return;
//     }
    
//     printWindow.document.write(jobCardHTML);
//     printWindow.document.close();
    
//     setTimeout(() => {
//       printWindow.focus();
//       printWindow.print();
//       // Close after print dialog closes
//       printWindow.onafterprint = () => {
//         printWindow.close();
//       };
//     }, 500);
//   } catch (error) {
//     console.error('Error exporting job card PDF:', error);
//     alert('Error exporting job card: ' + error.message);
//   }
// };

// const generateJobCardHTML = () => {
//   if (!jobCard) return '';

//   // Get only DEVICE_SERIAL
//   const deviceSerial = (jobCard.serials || []).find(s => s.serialType === 'DEVICE_SERIAL');

//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//   <meta charset="UTF-8">
//   <title>E-TechCare Job Card (A5)</title>
//   <style>
//       @page {
//           size: A5;
//           margin: 10mm;
//       }
//       body {
//           font-family: Arial, sans-serif;
//           font-size: 11px;
//           margin: 0;
//           padding: 0;
//           color: #000;
//       }

//       /* HEADER */
//       .header {
//           border-bottom: 2px solid #000;
//           padding-bottom: 8px;
//           margin-bottom: 10px;
//       }
//       .company-name {
//           font-size: 24px;
//           font-weight: 900;
//           margin: 0;
//           padding: 0;
//       }
//       .company-contact {
//           font-size: 9px;
//           margin: 2px 0;
//           padding: 0;
//       }

//       /* TITLE */
//       .title {
//           text-align: center;
//           font-size: 16px;
//           font-weight: bold;
//           margin: 8px 0;
//           text-decoration: underline;
//       }

//       /* JOB DETAILS */
//       .job-details {
//           margin-bottom: 8px;
//           line-height: 1.4;
//       }
//       .detail-row {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 3px;
//       }
//       .detail-label {
//           font-weight: bold;
//           width: 40%;
//       }
//       .detail-value {
//           width: 60%;
//       }

//       /* SECTION HEADER */
//       .section-header {
//           background-color: #e8e8e8;
//           font-weight: bold;
//           padding: 4px 6px;
//           margin: 8px 0 4px 0;
//           font-size: 10px;
//           border-bottom: 1px solid #000;
//       }

//       /* CONTENT SECTION */
//       .section-content {
//           margin-bottom: 6px;
//           line-height: 1.3;
//       }

//       .badge {
//           display: inline-block;
//           background-color: #ffebee;
//           color: #c62828;
//           padding: 2px 6px;
//           border-radius: 3px;
//           font-size: 9px;
//           font-weight: bold;
//           margin-top: 2px;
//       }

//       /* SERVICES LIST */
//       .services-list {
//           margin-bottom: 6px;
//       }
//       .service-item {
//           padding: 3px 0;
//           border-bottom: 0.5px solid #ccc;
//           font-size: 10px;
//       }

//       /* DEVICE INFO */
//       .device-info {
//           background-color: #f9f9f9;
//           padding: 4px;
//           border: 0.5px solid #ccc;
//           margin-bottom: 6px;
//           font-size: 10px;
//       }

//       /* SERIAL */
//       .serial-box {
//           background-color: #e3f2fd;
//           border: 1px solid #1976d2;
//           padding: 4px;
//           margin-bottom: 6px;
//           font-size: 10px;
//       }
//       .serial-label {
//           font-weight: bold;
//           color: #1565c0;
//       }
//       .serial-value {
//           font-size: 11px;
//           font-weight: bold;
//           margin-top: 2px;
//       }

//       /* PAYMENT BOX */
//       .payment-box {
//           background-color: #e8f5e9;
//           border: 1px solid #388e3c;
//           padding: 4px;
//           margin: 6px 0;
//           font-size: 10px;
//       }
//       .payment-row {
//           display: flex;
//           justify-content: space-between;
//           margin: 2px 0;
//       }
//       .payment-label {
//           font-weight: bold;
//       }
//       .payment-value {
//           text-align: right;
//       }

//       /* FAULTS/CONDITIONS */
//       .fault-item, .condition-item {
//           padding: 2px 0;
//           font-size: 10px;
//           border-bottom: 0.5px solid #eee;
//       }

//       /* NOTES */
//       .notes-box {
//           background-color: #fffde7;
//           border: 0.5px solid #f9a825;
//           padding: 4px;
//           font-size: 9px;
//           line-height: 1.3;
//           max-height: 60px;
//           overflow: hidden;
//       }
//   </style>
//   </head>
//   <body>

//   <!-- HEADER -->
//   <div class="header">
//       <p class="company-name">E-TECHCARE</p>
//       <p class="company-contact"><b>TEL:</b> 076 795 7125 | <b>EMAIL:</b> etechcarelh@gmail.com</p>
//   </div>

//   <div class="title">JOB CARD</div>

//   <!-- JOB DETAILS -->
//   <div class="job-details">
//       <div class="detail-row">
//           <span class="detail-label"><b>JOB #:</b></span>
//           <span class="detail-value">${jobCard.jobNumber}</span>
//       </div>
//       <div class="detail-row">
//           <span class="detail-label"><b>DATE:</b></span>
//           <span class="detail-value">${new Date(jobCard.createdAt).toLocaleDateString()}</span>
//       </div>
//       <div class="detail-row">
//           <span class="detail-label"><b>STATUS:</b></span>
//           <span class="detail-value">${jobCard.status.replace(/_/g, ' ')}</span>
//       </div>
//       ${jobCard.oneDayService ? `<div class="badge">🚨 ONE DAY SERVICE</div>` : ''}
//   </div>

//   <!-- CUSTOMER INFO -->
//   <div class="section-header">CUSTOMER</div>
//   <div class="section-content">
//       <div class="detail-row">
//           <span class="detail-label"><b>Name:</b></span>
//           <span class="detail-value">${jobCard.customerName}</span>
//       </div>
//       <div class="detail-row">
//           <span class="detail-label"><b>Phone:</b></span>
//           <span class="detail-value">${jobCard.customerPhone}</span>
//       </div>
//   </div>

//   <!-- DEVICE INFO -->
//   <div class="section-header">DEVICE</div>
//   <div class="device-info">
//       <div style="margin-bottom: 2px;"><b>${jobCard.deviceType}</b></div>
//       <div><b>Brand:</b> ${jobCard.brand?.brandName || 'N/A'}</div>
//       <div><b>Model:</b> ${jobCard.model?.modelName || 'N/A'}</div>
//       ${jobCard.processor ? `<div><b>Processor:</b> ${jobCard.processor.processorName}</div>` : ''}
//   </div>

//   <!-- DEVICE SERIAL -->
//   ${deviceSerial ? `
//   <div class="section-header">DEVICE SERIAL</div>
//   <div class="serial-box">
//       <div class="serial-label">Serial #:</div>
//       <div class="serial-value">${deviceSerial.serialValue}</div>
//   </div>
//   ` : ''}

//   <!-- DEVICE CONDITIONS -->
//   ${jobCard.deviceConditions && jobCard.deviceConditions.length > 0 ? `
//   <div class="section-header">CONDITION</div>
//   <div class="section-content">
//       ${jobCard.deviceConditions.map(c => `<div class="condition-item">• ${c.conditionName}</div>`).join('')}
//   </div>
//   ` : ''}

//   <!-- REPORTED FAULTS -->
//   ${jobCard.faults && jobCard.faults.length > 0 ? `
//   <div class="section-header">REPORTED FAULTS</div>
//   <div class="section-content">
//       ${jobCard.faults.map(f => `<div class="fault-item">• ${f.faultName}</div>`).join('')}
//   </div>
//   ` : ''}

//   <!-- FAULT DESCRIPTION -->
//   ${jobCard.faultDescription ? `
//   <div class="section-header">FAULT DETAILS</div>
//   <div class="section-content" style="font-size: 9px; line-height: 1.2; max-height: 50px; overflow: hidden;">
//       ${jobCard.faultDescription.substring(0, 200)}${jobCard.faultDescription.length > 200 ? '...' : ''}
//   </div>
//   ` : ''}

//   <!-- SERVICES -->
//   ${jobCard.serviceCategories && jobCard.serviceCategories.length > 0 ? `
//   <div class="section-header">SERVICES</div>
//   <div class="services-list">
//       ${jobCard.serviceCategories.map(s => `<div class="service-item">• ${s.name}</div>`).join('')}
//   </div>
//   ` : ''}

//   <!-- PAYMENT -->
//   <div class="payment-box">
//       <div class="payment-row">
//           <span class="payment-label">Advance Payment:</span>
//           <span class="payment-value"><b>Rs. ${jobCard.advancePayment?.toFixed(2) || '0.00'}</b></span>
//       </div>
//   </div>

//   <!-- NOTES -->
//   ${jobCard.notes ? `
//   <div class="section-header">NOTES</div>
//   <div class="notes-box">
//       ${jobCard.notes.substring(0, 200)}${jobCard.notes.length > 200 ? '...' : ''}
//   </div>
//   ` : ''}

//   </body>
//   </html>
//       `;
// };
//   // const generateJobCardHTML = () => {
//   // if (!jobCard) return '';

//   // // Calculate totals
//   // const totalServicePrice = calculateTotalServicePrice();
//   // const totalPartsCost = calculateUsedItemsTotal();
//   // const grandTotal = totalServicePrice + totalPartsCost;

//   //   // Generate services HTML
//   //   const servicesHTML = (jobCard.serviceCategories || []).map((service, index) => `
//   //     <tr>
//   //       <td>${index + 1}</td>
//   //       <td>${service.name || 'Service'}</td>
//   //       <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //       <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   //   `).join('');

//   //   // Generate used items HTML
//   //   const usedItemsHTML = (jobCard.usedItems || []).map((item, index) => {
//   //     const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
//   //     return `
//   //       <tr>
//   //         <td>${index + 1}</td>
//   //         <td>${item.inventoryItem?.name || 'Item'}</td>
//   //         <td>${item.inventoryItem?.sku || 'N/A'}</td>
//   //         <td>${item.quantityUsed || 0}</td>
//   //         <td>${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //         <td>${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //       </tr>
//   //     `;
//   //   }).join('');

//   //   // Generate faults HTML
//   //   const faultsHTML = (jobCard.faults || []).map((fault, index) => `
//   //     <tr>
//   //       <td>${index + 1}</td>
//   //       <td colspan="3">${fault.faultName || 'Fault'}</td>
//   //     </tr>
//   //   `).join('');

//   //   // Generate device conditions HTML
//   //   const conditionsHTML = (jobCard.deviceConditions || []).map((condition, index) => `
//   //     <tr>
//   //       <td>${index + 1}</td>
//   //       <td colspan="3">${condition.conditionName || 'Condition'}</td>
//   //     </tr>
//   //   `).join('');

//   //   // Generate serials HTML
//   //   const serialsHTML = (jobCard.serials || []).map((serial, index) => `
//   //     <tr>
//   //       <td>${index + 1}</td>
//   //       <td>${serial.serialType}</td>
//   //       <td colspan="2">${serial.serialValue}</td>
//   //     </tr>
//   //   `).join('');

//   //   return `
//   // <!DOCTYPE html>
//   // <html lang="en">
//   // <head>
//   // <meta charset="UTF-8">
//   // <title>E-TechCare Job Card (A5)</title>
//   // <style>
//   //     @page {
//   //         size: A5;
//   //         margin: 15mm;
//   //     }
//   //     body {
//   //         font-family: Arial, sans-serif;
//   //         font-size: 13px;
//   //         margin: 0;
//   //         padding: 0;
//   //         color: #000;
//   //     }

//   //     /* HEADER */
//   //     .header {
//   //         display: flex;
//   //         justify-content: space-between;
//   //         align-items: center;
//   //         border-bottom: 2px solid #000;
//   //         padding-bottom: 10px;
//   //     }
//   //     .company-info {
//   //         line-height: 1.5;
//   //     }
//   //     .company-info h1 {
//   //         font-size: 36px;
//   //         margin: 0;
//   //         font-weight: 900;
//   //         letter-spacing: 1px;
//   //         color: #111;
//   //     }
//   //     .company-info p {
//   //         margin: 2px 0;
//   //         font-size: 12px;
//   //     }
//   //     .logo img {
//   //         width: 100px;
//   //         height: auto;
//   //     }

//   //     /* TITLE */
//   //     h2 {
//   //         text-align: center;
//   //         text-decoration: underline;
//   //         margin: 12px 0;
//   //         font-size: 22px;
//   //         letter-spacing: 1px;
//   //     }

//   //     /* JOB CARD DETAILS */
//   //     .jobcard-details {
//   //         width: 100%;
//   //         border-collapse: collapse;
//   //         margin-bottom: 12px;
//   //         font-size: 12px;
//   //     }
//   //     .jobcard-details td {
//   //         padding: 4px 6px;
//   //         border: 1px solid #000;
//   //     }

//   //     /* SECTION HEADERS */
//   //     .section-header {
//   //         background-color: #f3f3f3;
//   //         font-weight: bold;
//   //         padding: 8px;
//   //         border: 1px solid #000;
//   //         margin-top: 15px;
//   //         margin-bottom: 8px;
//   //         font-size: 14px;
//   //     }

//   //     /* TABLES */
//   //     table {
//   //         width: 100%;
//   //         border-collapse: collapse;
//   //         font-size: 12px;
//   //         margin-bottom: 10px;
//   //     }
//   //     th, td {
//   //         border: 1px solid #000;
//   //         padding: 6px;
//   //         text-align: center;
//   //     }
//   //     th {
//   //         background-color: #f3f3f3;
//   //         font-weight: bold;
//   //     }

//   //     /* TOTAL SECTION */
//   //     .totals {
//   //         width: 100%;
//   //         border-collapse: collapse;
//   //         margin-top: 10px;
//   //         font-size: 13px;
//   //     }
//   //     .totals td {
//   //         padding: 6px;
//   //         text-align: right;
//   //         border: none;
//   //     }
//   //     .totals .label {
//   //         width: 70%;
//   //         text-align: right;
//   //         font-weight: bold;
//   //     }
//   //     .totals .value {
//   //         width: 30%;
//   //         border-bottom: 1px solid #000;
//   //     }
//   //     .totals .highlight {
//   //         background-color: #e8f4e5;
//   //         font-weight: bold;
//   //         border: 1px solid #000;
//   //     }

//   //     /* NOTICE */
//   //     .notice {
//   //         margin-top: 20px;
//   //         font-size: 11px;
//   //     }
//   //     .notice b {
//   //         display: block;
//   //         margin-bottom: 5px;
//   //     }
//   //     ul {
//   //         margin-top: 0;
//   //         padding-left: 20px;
//   //     }

//   //     /* SIGNATURES */
//   //     .signatures {
//   //         margin-top: 35px;
//   //         display: flex;
//   //         justify-content: space-between;
//   //         font-size: 12px;
//   //     }
//   //     .signatures div {
//   //         width: 45%;
//   //         text-align: center;
//   //     }
//   //     .signatures hr {
//   //         border: none;
//   //         border-top: 1px solid #000;
//   //         margin-bottom: 3px;
//   //     }

//   //     /* STATUS BADGE */
//   //     .status-badge {
//   //         display: inline-block;
//   //         padding: 4px 12px;
//   //         background-color: #e8f4e5;
//   //         border: 1px solid #000;
//   //         border-radius: 12px;
//   //         font-weight: bold;
//   //         font-size: 11px;
//   //         margin-left: 10px;
//   //     }

//   //     .urgent-badge {
//   //         background-color: #ffebee;
//   //         color: #c62828;
//   //         border-color: #c62828;
//   //     }

//   // </style>
//   // </head>
//   // <body>

//   // <div class="header">
//   //     <div class="company-info">
//   //         <h1>E - TECHCARE</h1>
//   //         <p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p>
//   //         <p><b>TEL:</b> 076 795 7125</p>
//   //         <p><b>EMAIL:</b> etechcarelh@gmail.com</p>
//   //         <p><b>WHATSAPP:</b> 076 795 7125</p>
//   //     </div>
//   //     <div class="logo">
//   //         ${COMPANY_LOGO_BASE64 ? `<img src="${COMPANY_LOGO_BASE64}" alt="TechCare Logo" onerror="this.style.display='none'">` : ''}
//   //     </div>
//   // </div>

//   // <h2>JOB CARD</h2>

//   // <table class="jobcard-details">
//   //     <tr>
//   //         <td><b>DATE :</b> ${new Date(jobCard.createdAt).toLocaleDateString()}</td>
//   //         <td><b>JOB NO :</b> ${jobCard.jobNumber}</td>
//   //         <td><b>STATUS :</b> ${jobCard.status} ${jobCard.oneDayService ? '<span class="status-badge urgent-badge">🚨 ONE DAY</span>' : ''}</td>
//   //     </tr>
//   //     <tr>
//   //         <td><b>CUSTOMER :</b> ${jobCard.customerName}</td>
//   //         <td><b>PHONE :</b> ${jobCard.customerPhone}</td>
//   //         <td><b>DEVICE :</b> ${jobCard.deviceType}</td>
//   //     </tr>
//   //     <tr>
//   //         <td colspan="3"><b>EMAIL :</b> ${jobCard.customerEmail || 'N/A'}</td>
//   //     </tr>
//   // </table>

//   // <!-- DEVICE INFORMATION -->
//   // <div class="section-header">DEVICE INFORMATION</div>
//   // <table class="jobcard-details">
//   //     <tr>
//   //         <td><b>BRAND :</b> ${jobCard.brand?.brandName || 'N/A'}</td>
//   //         <td><b>MODEL :</b> ${jobCard.model?.modelName || 'N/A'}</td>
//   //         <td><b>PROCESSOR :</b> ${jobCard.processor?.processorName || 'N/A'}</td>
//   //     </tr>
//   // </table>

//   // <!-- SERIAL NUMBERS -->
//   // ${serialsHTML ? `
//   // <div class="section-header">SERIAL NUMBERS</div>
//   // <table>
//   //     <thead>
//   //         <tr>
//   //             <th>No</th>
//   //             <th>Type</th>
//   //             <th colspan="2">Serial Value</th>
//   //         </tr>
//   //     </thead>
//   //     <tbody>
//   //         ${serialsHTML}
//   //     </tbody>
//   // </table>
//   // ` : ''}

//   // <!-- DEVICE CONDITIONS -->
//   // ${conditionsHTML ? `
//   // <div class="section-header">DEVICE CONDITIONS</div>
//   // <table>
//   //     <thead>
//   //         <tr>
//   //             <th>No</th>
//   //             <th colspan="3">Condition Description</th>
//   //         </tr>
//   //     </thead>
//   //     <tbody>
//   //         ${conditionsHTML}
//   //     </tbody>
//   // </table>
//   // ` : ''}

//   // <!-- FAULTS -->
//   // ${faultsHTML ? `
//   // <div class="section-header">REPORTED FAULTS</div>
//   // <table>
//   //     <thead>
//   //         <tr>
//   //             <th>No</th>
//   //             <th colspan="3">Fault Description</th>
//   //         </tr>
//   //     </thead>
//   //     <tbody>
//   //         ${faultsHTML}
//   //     </tbody>
//   // </table>
//   // ` : ''}

//   // <!-- FAULT DESCRIPTION -->
//   // ${jobCard.faultDescription ? `
//   // <div class="section-header">FAULT DETAILS</div>
//   // <table>
//   //     <tr>
//   //         <td style="text-align: left; padding: 10px;">${jobCard.faultDescription}</td>
//   //     </tr>
//   // </table>
//   // ` : ''}

//   // <!-- SERVICES -->
//   // ${servicesHTML ? `
//   // <div class="section-header">SERVICES</div>
//   // <table>
//   //     <thead>
//   //         <tr>
//   //             <th>No</th>
//   //             <th>Service Description</th>
//   //             <th>Unit Price</th>
//   //             <th>Amount</th>
//   //         </tr>
//   //     </thead>
//   //     <tbody>
//   //         ${servicesHTML}
//   //     </tbody>
//   // </table>
//   // ` : ''}

//   // <!-- USED ITEMS -->
//   // ${usedItemsHTML ? `
//   // <div class="section-header">USED ITEMS / PARTS</div>
//   // <table>
//   //     <thead>
//   //         <tr>
//   //             <th>No</th>
//   //             <th>Item Name</th>
//   //             <th>SKU</th>
//   //             <th>QTY</th>
//   //             <th>Unit Price</th>
//   //             <th>Amount</th>
//   //         </tr>
//   //     </thead>
//   //     <tbody>
//   //         ${usedItemsHTML}
//   //     </tbody>
//   // </table>
//   // ` : ''}

//   // <!-- PAYMENT SUMMARY -->
//   // <div class="section-header">PAYMENT SUMMARY</div>
//   // <table class="totals">
//   //     <tr>
//   //         <td class="label">Services Total:</td>
//   //         <td class="value">${totalServicePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   //     <tr>
//   //         <td class="label">Parts Total:</td>
//   //         <td class="value">${totalPartsCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   //     <tr>
//   //         <td class="label highlight">GRAND TOTAL:</td>
//   //         <td class="value highlight">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   //     <tr>
//   //         <td class="label">Advance Paid:</td>
//   //         <td class="value">${jobCard.advancePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   //     <tr>
//   //         <td class="label">Balance Due:</td>
//   //         <td class="value">${(grandTotal - jobCard.advancePayment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//   //     </tr>
//   // </table>

//   // <!-- TECHNICIAN NOTES -->
//   // ${jobCard.notes ? `
//   // <div class="section-header">TECHNICIAN NOTES</div>
//   // <table>
//   //     <tr>
//   //         <td style="text-align: left; padding: 10px;">${jobCard.notes}</td>
//   //     </tr>
//   // </table>
//   // ` : ''}

//   // <div class="notice">
//   //     <b>Important Notice</b>
//   //     <ul>
//   //         <li>Warranty period one year less than 14 working days.</li>
//   //         <li>Warranty covers only manufacturer's defects. Damages or defects due to misuse, negligence, or power issues are not covered.</li>
//   //         <li>Repairs or replacements may include labor or material costs.</li>
//   //         <li>No warranty for cartridges, power adaptors, some battery types, and software.</li>
//   //         <li>Device must be collected within 30 days after completion notification.</li>
//   //         <li>Backup your data before service. We are not responsible for data loss.</li>
//   //     </ul>
//   // </div>

//   // <div class="signatures">
//   //     <div>
//   //         <hr>
//   //         <p>Technician Signature</p>
//   //     </div>
//   //     <div>
//   //         <hr>
//   //         <p>Customer Signature</p>
//   //     </div>
//   // </div>

//   // </body>
//   // </html>
//   //     `;
//   // };

//   const handleCancelSuccess = (response) => {
//     setJobCard(response);
//     setShowCancelModal(false);
//     if (onStatusChange) onStatusChange();
//   };

//   const handleInvoiceSuccess = (response) => {
//     // Close the modal
//     setShowCreateInvoiceModal(false);
    
//     // Show success message
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = 'Invoice created successfully!';
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);

//     // Navigate to invoices tab and show the newly created invoice
//     if (onNavigate) {
//       onNavigate('invoices', response.id);
//     }
//   };

//   const handleStatusChange = async (newStatus) => {
//     try {
//       setUpdatingStatus(true);
//       let endpoint = '';
//       let action = '';

//       switch (newStatus) {
//         case 'WAITING_FOR_PARTS':
//           endpoint = `/api/jobcards/${jobCardId}/waiting-for-parts`;
//           action = 'waiting for parts';
//           break;
//         case 'WAITING_FOR_APPROVAL':
//           endpoint = `/api/jobcards/${jobCardId}/waiting-for-approval`;
//           action = 'waiting for approval';
//           break;
//         case 'IN_PROGRESS':
//           endpoint = `/api/jobcards/${jobCardId}/in-progress`;
//           action = 'in progress';
//           break;
//         case 'PENDING':
//           endpoint = `/api/jobcards/${jobCardId}/pending`;
//           action = 'pending';
//           break;
//         default:
//           return;
//       }

//       const response = await apiCall(endpoint, { method: 'POST' });
//       setJobCard(response);
      
//       // Show success message
//       const msg = document.createElement('div');
//       msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//       msg.textContent = `Status updated to ${action}`;
//       document.body.appendChild(msg);
//       setTimeout(() => msg.remove(), 3000);

//       // Refresh parent component if provided
//       if (onStatusChange) onStatusChange();
//     } catch (err) {
//       setError(err.message || 'Failed to update status');
//       console.error(err);
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
//       WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300',
//       WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300',
//       COMPLETED: 'bg-green-100 text-green-800 border-green-300',
//       DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
//       CANCELLED: 'bg-red-100 text-red-800 border-red-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       PENDING: '⏳',
//       IN_PROGRESS: '🔧',
//       WAITING_FOR_PARTS: '📦',
//       WAITING_FOR_APPROVAL: '👥',
//       COMPLETED: '✅',
//       DELIVERED: '🚚',
//       CANCELLED: '❌',
//     };
//     return icons[status] || '📄';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getSerialTypeColor = (type) => {
//     const colors = {
//       'DEVICE_SERIAL': 'bg-blue-600 text-white',
//       'IMEI': 'bg-purple-600 text-white',
//       'SERIAL_NUMBER': 'bg-indigo-600 text-white',
//       'MODEL_NUMBER': 'bg-violet-600 text-white'
//     };
//     return colors[type] || 'bg-gray-600 text-white';
//   };

//   // Calculate total service price
//   const calculateTotalServicePrice = () => {
//     return (jobCard?.serviceCategories || []).reduce((sum, service) => {
//       return sum + (service.servicePrice || 0);
//     }, 0);
//   };

//   // Calculate total used items cost
//   const calculateUsedItemsTotal = () => {
//     return (jobCard?.usedItems || []).reduce((sum, item) => {
//       return sum + (item.quantityUsed * (item.unitPrice || 0));
//     }, 0);
//   };

//   // Calculate grand total at that moment
//   const calculateGrandTotal = () => {
//     const servicePrice = calculateTotalServicePrice();
//     const usedItemsPrice = calculateUsedItemsTotal();
//     return servicePrice + usedItemsPrice;
//   };
  

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !jobCard) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error || 'Job card not found'}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//         >
//           Back to List
//         </button>
//       </div>
//     );
//   }

//   // Separate serials by type
//   const deviceSerials = jobCard.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];
//   const otherSerials = jobCard.serials?.filter(s => s.serialType !== 'DEVICE_SERIAL') || [];

//   const isCompleted = jobCard.status === 'COMPLETED';
//   const isDelivered = jobCard.status === 'DELIVERED';
//   const isCancelled = jobCard.status === 'CANCELLED';
//   const isWaitingForParts = jobCard.status === 'WAITING_FOR_PARTS';
//   const isWaitingForApproval = jobCard.status === 'WAITING_FOR_APPROVAL';
//   const isInProgress = jobCard.status === 'IN_PROGRESS';
//   const isPending = jobCard.status === 'PENDING';

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        
//         {/* Header */}
//         <div className={`p-6 text-white ${
//           jobCard.oneDayService 
//             ? 'bg-gradient-to-r from-red-600 to-red-800'
//             : jobCard.status === 'WAITING_FOR_PARTS'
//             ? 'bg-gradient-to-r from-orange-600 to-orange-800'
//             : jobCard.status === 'WAITING_FOR_APPROVAL'
//             ? 'bg-gradient-to-r from-purple-600 to-purple-800'
//             : 'bg-gradient-to-r from-blue-600 to-indigo-600'
//         }`}>
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{jobCard.jobNumber}</h1>
//               <p className="text-blue-100">Job Card Details</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="mt-4 flex items-center space-x-4">
//             <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(jobCard.status)}`}>
//               <span className="mr-2">{getStatusIcon(jobCard.status)}</span>
//               {jobCard.status.replace(/_/g, ' ')}
//             </span>
//             {jobCard.oneDayService && (
//               <span className="px-3 py-1 bg-white text-red-600 rounded-full text-sm font-bold border-2 border-white">
//                 🚨 ONE DAY SERVICE
//               </span>
//             )}
//             {isCancelled && (
//               <span className="text-red-200 text-sm font-medium">❌ Cancelled</span>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Status Action Buttons */}
//           {!isCancelled && !isDelivered && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Status Actions</h2>
//               <div className="flex flex-wrap gap-3">
//                 {isInProgress && (
//                   <>
//                     <button
//                       onClick={() => handleStatusChange('WAITING_FOR_PARTS')}
//                       disabled={updatingStatus}
//                       className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                     >
//                       <span>📦</span>
//                       <span>Mark as Waiting for Parts</span>
//                     </button>
//                     <button
//                       onClick={() => handleStatusChange('WAITING_FOR_APPROVAL')}
//                       disabled={updatingStatus}
//                       className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                     >
//                       <span>👥</span>
//                       <span>Mark as Waiting for Approval</span>
//                     </button>
//                   </>
//                 )}
//                 {(isWaitingForParts || isWaitingForApproval) && (
//                   <button
//                     onClick={() => handleStatusChange('IN_PROGRESS')}
//                     disabled={updatingStatus}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <span>🔧</span>
//                     <span>Back to In Progress</span>
//                   </button>
//                 )}
//                 {(isPending || isWaitingForParts || isWaitingForApproval) && (
//                   <button
//                     onClick={() => handleStatusChange('IN_PROGRESS')}
//                     disabled={updatingStatus}
//                     className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <span>🚀</span>
//                     <span>Start Work</span>
//                   </button>
//                 )}
//                 {updatingStatus && (
//                   <div className="flex items-center text-gray-600">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
//                     Updating status...
//                   </div>
//                 )}
//               </div>

//               {/* Status Help Text */}
//               {(isWaitingForParts || isWaitingForApproval) && (
//                 <div className={`mt-4 p-3 rounded-lg ${
//                   isWaitingForParts ? 'bg-orange-50 border border-orange-200' : 'bg-purple-50 border border-purple-200'
//                 }`}>
//                   <p className={`text-sm ${isWaitingForParts ? 'text-orange-700' : 'text-purple-700'}`}>
//                     {isWaitingForParts 
//                       ? '⏳ This job is paused waiting for parts. Update inventory or contact supplier.'
//                       : '⏳ This job is paused waiting for customer approval. Contact the customer for confirmation.'
//                     }
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Key Information Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase">Job Number</label>
//               <p className="text-lg font-bold text-gray-900">{jobCard.jobNumber}</p>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
//               <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(jobCard.status)}`}>
//                 {getStatusIcon(jobCard.status)} {jobCard.status.replace(/_/g, ' ')}
//               </span>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase">Created</label>
//               <p className="text-sm text-gray-900">{formatDate(jobCard.createdAt)}</p>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase">Updated</label>
//               <p className="text-sm text-gray-900">{formatDate(jobCard.updatedAt)}</p>
//             </div>
//             {jobCard.completedAt && (
//               <div>
//                 <label className="text-xs font-semibold text-gray-600 uppercase">Completed</label>
//                 <p className="text-sm text-gray-900">{formatDate(jobCard.completedAt)}</p>
//               </div>
//             )}
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase">Device Type</label>
//               <p className="text-sm font-semibold text-gray-900">{jobCard.deviceType}</p>
//             </div>
//           </div>

//           {/* Customer Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Customer Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Customer Name</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Phone</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerPhone}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Email</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.customerEmail || 'N/A'}</p>
//               </div>
//             </div>
//           </div>

//           {/* Device Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               Device Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Device Type</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.deviceType}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Brand</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.brand?.brandName || 'N/A'}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Model</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.model?.modelName || 'N/A'}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Processor</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.processor?.processorName || 'N/A'}</p>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Device Condition</label>
//                 <p className="text-lg font-semibold text-gray-900">{jobCard.deviceCondition?.conditionName || 'N/A'}</p>
//               </div>
//             </div>
//           </div>

//           {/* Device Serials - MOVED HERE (After Device Information) */}
//           {deviceSerials.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 Device Serial (PRIMARY)
//               </h2>
//               <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
//                 <div className="space-y-2">
//                   {deviceSerials.map((serial, index) => (
//                     <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
//                       <div className="flex items-center">
//                         <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-3">DEVICE_SERIAL</span>
//                         <span className="text-gray-700 font-semibold text-lg">{serial.serialValue}</span>
//                       </div>
//                       <span className="text-blue-600 text-sm font-medium">🔹 Primary</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Other Serials - MOVED HERE (After Device Information) */}
//           {otherSerials.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//                 </svg>
//                 Other Serials (IMEI, etc.)
//               </h2>
//               <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
//                 <div className="space-y-2">
//                   {otherSerials.map((serial, index) => (
//                     <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-purple-300">
//                       <div className="flex items-center">
//                         <span className={`px-2 py-1 text-xs font-bold rounded mr-3 ${getSerialTypeColor(serial.serialType)}`}>
//                           {serial.serialType}
//                         </span>
//                         <span className="text-gray-700 font-semibold">{serial.serialValue}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* One Day Service Information */}
//           {jobCard.oneDayService && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Service Priority
//               </h2>
//               <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="flex-shrink-0">
//                     <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-red-900">One Day Service</h3>
//                     <p className="text-red-700">
//                       This job is prioritized for 24-hour completion. Urgent attention required!
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Device Conditions */}
//           {jobCard.deviceConditions && jobCard.deviceConditions.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 Device Conditions ({jobCard.deviceConditions.length})
//               </h2>
//               <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
//                 <div className="flex flex-wrap gap-2">
//                   {jobCard.deviceConditions.map(condition => (
//                     <div key={condition.id} className="flex items-center gap-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
//                       <span className="font-medium">{condition.conditionName}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Fault Information */}
//           {jobCard.faults && jobCard.faults.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Faults ({jobCard.faults.length})
//               </h2>
//               <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {jobCard.faults.map(fault => (
//                     <div key={fault.id} className="flex items-center gap-2 bg-red-200 text-red-800 px-3 py-1 rounded-full">
//                       <span className="font-medium">{fault.faultName}</span>
//                     </div>
//                   ))}
//                 </div>
//                 {jobCard.faultDescription && (
//                   <div className="pt-4 border-t border-red-200">
//                     <p className="text-sm font-medium text-gray-600 mb-2">Fault Description:</p>
//                     <p className="text-gray-900 whitespace-pre-wrap">{jobCard.faultDescription}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Service Categories */}
//           {jobCard.serviceCategories && jobCard.serviceCategories.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Services ({jobCard.serviceCategories.length})
//               </h2>
//               <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {jobCard.serviceCategories.map(service => (
//                     <div key={service.id} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded-full">
//                       <span className="font-medium">
//                         {service.name} - Rs.{service.servicePrice?.toFixed(2) || '0.00'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Total Service Price */}
//                 <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-gray-900">Total Service Price:</span>
//                     <span className="text-2xl font-bold text-green-700">
//                       Rs.{calculateTotalServicePrice().toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Used Items / Parts */}
//           {jobCard.usedItems && jobCard.usedItems.length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//                 Used Items / Parts ({jobCard.usedItems.length})
//               </h2>
//               <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-green-300">
//                         <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
//                         <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-green-200">
//                       {jobCard.usedItems.map((item, index) => {
//                         const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
//                         return (
//                           <tr key={index} className="hover:bg-green-100 transition-colors">
//                             <td className="py-3 px-2">
//                               <div>
//                                 <p className="font-semibold text-gray-900">
//                                   {item.inventoryItem?.name || 'Unknown Item'}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   SKU: {item.inventoryItem?.sku || 'N/A'}
//                                 </p>
//                               </div>
//                             </td>
//                             <td className="text-center py-3 px-2">
//                               <span className="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">
//                                 {item.quantityUsed}
//                               </span>
//                             </td>
//                             <td className="text-right py-3 px-2">
//                               <span className="font-semibold text-gray-900">
//                                 Rs.{(item.unitPrice || 0).toFixed(2)}
//                               </span>
//                             </td>
//                             <td className="text-right py-3 px-2">
//                               <span className="font-bold text-green-700">
//                                 Rs.{itemTotal.toFixed(2)}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Total Parts Cost */}
//                 <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
//                   <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
//                     <div className="flex items-center justify-between gap-8">
//                       <span className="text-lg font-semibold text-gray-900">Total Parts Cost:</span>
//                       <span className="text-2xl font-bold text-green-700">
//                         Rs.{calculateUsedItemsTotal().toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Additional Notes */}
//           {jobCard.notes && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Additional Notes
//               </h2>
//               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
//                 <p className="text-gray-900 whitespace-pre-wrap">{jobCard.notes}</p>
//               </div>
//             </div>
//           )}

//           {/* Payment Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Payment Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-blue-600">Advance Payment</label>
//                 <p className="text-2xl font-bold text-blue-700 mt-1">
//                   Rs.{jobCard.advancePayment?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//               <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-green-600">Estimated Cost</label>
//                 <p className="text-2xl font-bold text-green-700 mt-1">
//                   Rs.{jobCard.estimatedCost?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//               <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
//                 <label className="text-sm font-medium text-purple-600">Total Price at Moment</label>
//                 <p className="text-2xl font-bold text-purple-700 mt-1">
//                   Rs.{calculateGrandTotal().toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Cancellation Details (if cancelled) */}
//           {isCancelled && jobCard.cancelledBy && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 Cancellation Details
//               </h2>

//               <div className="space-y-4">
//                 <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">Cancelled By</p>
//                       <p className="text-lg font-bold text-red-900">
//                         {jobCard.cancelledBy === 'CUSTOMER' ? 'Customer' : 'Technician'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-red-600 font-medium mb-1">User ID</p>
//                       <p className="text-lg font-bold text-red-900">#{jobCard.cancelledByUserId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {jobCard.cancellationReason && (
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                     <p className="text-sm text-gray-600 font-medium mb-2">Reason for Cancellation</p>
//                     <p className="text-gray-900 whitespace-pre-wrap">{jobCard.cancellationReason}</p>
//                   </div>
//                 )}

//                 {jobCard.cancelledBy === 'CUSTOMER' && jobCard.cancellationFee > 0 && (
//                   <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
//                     <p className="text-sm text-orange-600 font-medium mb-1">Cancellation Fee (Invoice Created)</p>
//                     <p className="text-2xl font-bold text-orange-900">Rs.{jobCard.cancellationFee?.toFixed(2)}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Timeline */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Timeline
//             </h2>
//             <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-600">Created:</span>
//                 <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</span>
//               </div>
//               {jobCard.updatedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
//                   <span className="text-sm font-medium text-gray-600">Last Updated:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.updatedAt)}</span>
//                 </div>
//               )}
//               {jobCard.completedAt && (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-3 h-3 bg-green-600 rounded-full"></div>
//                   <span className="text-sm font-medium text-gray-600">Completed:</span>
//                   <span className="text-sm font-semibold text-gray-900">{formatDate(jobCard.completedAt)}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
//             <button
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
//             >
//               Close
//             </button>
//             {!isCancelled && (
//               <>
//                 {/* Generate Invoice Button - Only for COMPLETED status */}
//                 {isCompleted && (
//                   <button
//                     onClick={() => setShowCreateInvoiceModal(true)}
//                     className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <span>Generate Invoice</span>
//                   </button>
//                 )}
//                   {/* Download Job Card Buttons */}
//                   <button
//                     onClick={downloadJobCard}
//                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <span>Print Job Card</span>
//                   </button>

//                   <button
//                     onClick={exportJobCardPDF}
//                     className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <span>Download PDF</span>
//                   </button>
//                 {/* Edit Button */}
//                 {!isDelivered && (
//                   <button
//                     onClick={() => onEdit(jobCardId)}
//                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     <span>Edit Job Card</span>
//                   </button>
//                 )}

//                 {/* Cancel Button */}
//                 <button
//                   onClick={() => setShowCancelModal(true)}
//                   className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   <span>Cancel Job Card</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Cancel Modal */}
//       {showCancelModal && (
//         <CancelOrderModal
//           jobCard={jobCard}
//           onSuccess={handleCancelSuccess}
//           onClose={() => setShowCancelModal(false)}
//         />
//       )}

//       {/* Create Invoice Modal */}
//       {showCreateInvoiceModal && (
//         <CreateInvoiceModal
//           jobCard={jobCard}
//           onSuccess={handleInvoiceSuccess}
//           onClose={() => setShowCreateInvoiceModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default JobCardView;


import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import CancelOrderModal from './CancelOrderModal';
import CreateInvoiceModal from "../invoices/CreateInvoiceModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCABlAKoDASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAAgGBwMEBQECCf/EAEsQAAEDAwMABQIDBQYHAwAAAAERAAMABAUGEQcSIhMUITEyQVFSYXGBkQgWJDVCVJGSk6Gx0hczNlVicnOCssJDV4Oiw9Hh/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAQFAwEGAP/EADgRAAEDAgIHBAkCBwAAAAAAAAIAAQMEEgURMTJBUZEhIjJhkqGx0RRCYXGBweHwFCMkM0NTorL/2gAMAwEAAhEDEQA/AH4f8Ce9WvWw/wCBPerXoQiiihEIvDQhFFe8SH1a8oQiiiihCKKKKEIooooQiiiihCKKKKEHl4aFQh8VCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEX//2Q==';


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
    
    printWindow.document.write(jobCardHTML);
    printWindow.document.close();
    
    // Wait for content to fully load before printing
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
      // Close after print dialog closes
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

  // Helper function to format serial type for display
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

  // Get device serial (primary)
  const deviceSerial = (jobCard.serials || []).find(s => s.serialType === 'DEVICE_SERIAL');
  
  // Get other serials (non-device serials)
  const otherSerials = (jobCard.serials || []).filter(s => s.serialType !== 'DEVICE_SERIAL');
  
  // Get unique serial types from other serials (to avoid duplicates)
  const uniqueSerialTypes = [...new Set(otherSerials.map(s => s.serialType))];

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <title>E-TechCare Job Card (A5)</title>
  <style>
      @page {
          size: A5;
          margin: 10mm;
      }
      body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          margin: 0;
          padding: 0;
          color: #000;
      }

      /* HEADER */
      .header {
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 10px;
      }
      .company-name {
          font-size: 24px;
          font-weight: 900;
          margin: 0;
          padding: 0;
      }
      .company-contact {
          font-size: 9px;
          margin: 2px 0;
          padding: 0;
      }

      /* TITLE */
      .title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 8px 0;
          text-decoration: underline;
      }

      /* JOB DETAILS */
      .job-details {
          margin-bottom: 8px;
          line-height: 1.4;
      }
      .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
      }
      .detail-label {
          font-weight: bold;
          width: 40%;
      }
      .detail-value {
          width: 60%;
      }

      /* SECTION HEADER */
      .section-header {
          background-color: #e8e8e8;
          font-weight: bold;
          padding: 4px 6px;
          margin: 8px 0 4px 0;
          font-size: 10px;
          border-bottom: 1px solid #000;
      }

      /* CONTENT SECTION */
      .section-content {
          margin-bottom: 6px;
          line-height: 1.3;
      }

      .badge {
          display: inline-block;
          background-color: #ffebee;
          color: #c62828;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: bold;
          margin-top: 2px;
      }

      /* SERVICES LIST */
      .services-list {
          margin-bottom: 6px;
      }
      .service-item {
          padding: 3px 0;
          border-bottom: 0.5px solid #ccc;
          font-size: 10px;
      }

      /* DEVICE INFO */
      .device-info {
          background-color: #f9f9f9;
          padding: 4px;
          border: 0.5px solid #ccc;
          margin-bottom: 6px;
          font-size: 10px;
      }

      /* DEVICE SERIAL */
      .serial-box {
          background-color: #e3f2fd;
          border: 1px solid #1976d2;
          padding: 6px;
          margin-bottom: 6px;
          font-size: 10px;
      }
      .serial-label {
          font-weight: bold;
          color: #1565c0;
          margin-bottom: 4px;
          display: block;
      }
      .serial-value {
          font-size: 12px;
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          background: white;
          padding: 4px;
          border-radius: 3px;
          border: 1px solid #bbdefb;
      }

      /* COMPONENT SERIALS */
      .component-serials {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 4px;
          margin-bottom: 6px;
      }
      .component-item {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 4px;
          text-align: center;
          font-size: 9px;
      }
      .component-type {
          font-weight: bold;
          color: #555;
          text-transform: uppercase;
      }

      /* PAYMENT BOX */
      .payment-box {
          background-color: #e8f5e9;
          border: 1px solid #388e3c;
          padding: 4px;
          margin: 6px 0;
          font-size: 10px;
      }
      .payment-row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
      }
      .payment-label {
          font-weight: bold;
      }
      .payment-value {
          text-align: right;
      }

      /* FAULTS/CONDITIONS */
      .fault-item, .condition-item {
          padding: 2px 0;
          font-size: 10px;
          border-bottom: 0.5px solid #eee;
      }

      /* NOTES */
      .notes-box {
          background-color: #fffde7;
          border: 0.5px solid #f9a825;
          padding: 4px;
          font-size: 9px;
          line-height: 1.3;
          max-height: 60px;
          overflow: hidden;
      }
  </style>
  </head>
  <body>

  <!-- HEADER -->
  <div class="header">
      <p class="company-name">E-TECHCARE</p>
      <p class="company-contact"><b>TEL:</b> 076 795 7125 | <b>EMAIL:</b> etechcarelh@gmail.com</p>
  </div>

  <div class="title">JOB CARD</div>

  <!-- JOB DETAILS -->
  <div class="job-details">
      <div class="detail-row">
          <span class="detail-label"><b>JOB #:</b></span>
          <span class="detail-value">${jobCard.jobNumber}</span>
      </div>
      <div class="detail-row">
          <span class="detail-label"><b>DATE:</b></span>
          <span class="detail-value">${new Date(jobCard.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
          <span class="detail-label"><b>STATUS:</b></span>
          <span class="detail-value">${jobCard.status.replace(/_/g, ' ')}</span>
      </div>
      ${jobCard.oneDayService ? `<div class="badge">🚨 ONE DAY SERVICE</div>` : ''}
  </div>

  <!-- CUSTOMER INFO -->
  <div class="section-header">CUSTOMER</div>
  <div class="section-content">
      <div class="detail-row">
          <span class="detail-label"><b>Name:</b></span>
          <span class="detail-value">${jobCard.customerName}</span>
      </div>
      <div class="detail-row">
          <span class="detail-label"><b>Phone:</b></span>
          <span class="detail-value">${jobCard.customerPhone}</span>
      </div>
  </div>

  <!-- DEVICE INFO -->
  <div class="section-header">DEVICE</div>
  <div class="device-info">
      <div style="margin-bottom: 2px;"><b>${jobCard.deviceType}</b></div>
      <div><b>Brand:</b> ${jobCard.brand?.brandName || 'N/A'}</div>
      <div><b>Model:</b> ${jobCard.model?.modelName || 'N/A'}</div>
      ${jobCard.processor ? `<div><b>Processor:</b> ${jobCard.processor.processorName}</div>` : ''}
  </div>

  <!-- DEVICE SERIAL -->
  ${deviceSerial ? `
  <div class="section-header">DEVICE SERIAL NUMBER</div>
  <div class="serial-box">
      <span class="serial-label">${formatSerialType(deviceSerial.serialType)}</span>
      <div class="serial-value">${deviceSerial.serialValue}</div>
  </div>
  ` : ''}

  <!-- OTHER SERIALS (COMPONENTS) - Show only type names -->
  ${uniqueSerialTypes.length > 0 ? `
  <div class="section-header">COMPONENTS</div>
  <div class="component-serials">
      ${uniqueSerialTypes.map(serialType => `
          <div class="component-item">
              <div class="component-type">${formatSerialType(serialType)}</div>
          </div>
      `).join('')}
  </div>
  ` : ''}

  <!-- DEVICE CONDITIONS -->
  ${jobCard.deviceConditions && jobCard.deviceConditions.length > 0 ? `
  <div class="section-header">CONDITION</div>
  <div class="section-content">
      ${jobCard.deviceConditions.map(c => `<div class="condition-item">• ${c.conditionName}</div>`).join('')}
  </div>
  ` : ''}

  <!-- REPORTED FAULTS -->
  ${jobCard.faults && jobCard.faults.length > 0 ? `
  <div class="section-header">REPORTED FAULTS</div>
  <div class="section-content">
      ${jobCard.faults.map(f => `<div class="fault-item">• ${f.faultName}</div>`).join('')}
  </div>
  ` : ''}

  <!-- FAULT DESCRIPTION -->
  ${jobCard.faultDescription ? `
  <div class="section-header">FAULT DETAILS</div>
  <div class="section-content" style="font-size: 9px; line-height: 1.2; max-height: 50px; overflow: hidden;">
      ${jobCard.faultDescription.substring(0, 200)}${jobCard.faultDescription.length > 200 ? '...' : ''}
  </div>
  ` : ''}

  <!-- SERVICES -->
  ${jobCard.serviceCategories && jobCard.serviceCategories.length > 0 ? `
  <div class="section-header">SERVICES</div>
  <div class="services-list">
      ${jobCard.serviceCategories.map(s => `<div class="service-item">• ${s.name}</div>`).join('')}
  </div>
  ` : ''}

  <!-- PAYMENT -->
  <div class="payment-box">
      <div class="payment-row">
          <span class="payment-label">Advance Payment:</span>
          <span class="payment-value"><b>Rs. ${jobCard.advancePayment?.toFixed(2) || '0.00'}</b></span>
      </div>
  </div>

  <!-- NOTES -->
  ${jobCard.notes ? `
  <div class="section-header">NOTES</div>
  <div class="notes-box">
      ${jobCard.notes.substring(0, 200)}${jobCard.notes.length > 200 ? '...' : ''}
  </div>
  ` : ''}

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
    // Close the modal
    setShowCreateInvoiceModal(false);
    
    // Show success message
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = 'Invoice created successfully!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);

    // Navigate to invoices tab and show the newly created invoice
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
      
      // Show success message
      const msg = document.createElement('div');
      msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      msg.textContent = `Status updated to ${action}`;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);

      // Refresh parent component if provided
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

  // Calculate total service price
  const calculateTotalServicePrice = () => {
    return (jobCard?.serviceCategories || []).reduce((sum, service) => {
      return sum + (service.servicePrice || 0);
    }, 0);
  };

  // Calculate total used items cost
  const calculateUsedItemsTotal = () => {
    return (jobCard?.usedItems || []).reduce((sum, item) => {
      return sum + (item.quantityUsed * (item.unitPrice || 0));
    }, 0);
  };

  // Calculate grand total at that moment
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

  // Separate serials by type
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
              {/* <div>
                <label className="text-sm font-medium text-gray-600">Device Condition</label>
                <p className="text-lg font-semibold text-gray-900">{jobCard.deviceCondition?.conditionName || 'N/A'}</p>
              </div> */}
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

          {/* Other Serials - Original UI (unchanged) */}
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
                {/* Generate Invoice Button - Only for COMPLETED status */}
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

                  <button
                    onClick={exportJobCardPDF}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
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