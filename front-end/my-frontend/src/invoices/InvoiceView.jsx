
import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import PaymentModal from './PaymentModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Items Table
    const itemsData = (invoice.items || []).map(item => [
      item.itemName || 'Item',
      item.quantity || 0,
      `Rs.${(item.unitPrice || 0).toFixed(2)}`,
      `Rs.${(item.total || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Description', 'Qty', 'Rate', 'Total']],
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{invoice.customerPhone}</p>
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

              {/* Used Items / Parts */}
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
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {invoice.jobCard.usedItems.map((item, index) => {
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
                            Rs.{usedItemsTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Invoice Items Table - FIXED */}
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.itemName || 'Item'}</p>
                            {item.warranty && item.warranty !== 'No Warranty' && (
                              <p className="text-xs text-gray-500">Warranty: {item.warranty}</p>
                            )}
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
                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          Rs.{(item.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
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
              onClick={exportPDF}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
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