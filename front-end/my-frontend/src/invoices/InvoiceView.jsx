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

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 41);

    // Customer Info
    doc.text('Customer Information:', 20, 52);
    doc.setFontSize(9);
    doc.text(`Name: ${invoice.customerName}`, 20, 58);
    doc.text(`Phone: ${invoice.customerPhone}`, 20, 64);

    // Items Table
    const itemsData = invoice.items.map(item => [
      item.itemName,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 72,
      head: [['Item', 'Qty', 'Rate', 'Total']],
      body: itemsData,
      margin: { left: 20, right: 20 }
    });

    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 20, finalY);
    doc.text(`Discount: -$${invoice.discount.toFixed(2)}`, 20, finalY + 6);
    doc.text(`Tax: +$${invoice.tax.toFixed(2)}`, 20, finalY + 12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 20, finalY + 20);
    doc.setFont(undefined, 'normal');
    doc.text(`Paid: $${invoice.paidAmount.toFixed(2)}`, 20, finalY + 26);
    doc.text(`Balance: $${invoice.balance.toFixed(2)}`, 20, finalY + 32);

    // Special Notes & Warranty
    if (invoice.specialNotes) {
      doc.text(`Notes: ${invoice.specialNotes}`, 20, finalY + 42);
    }
    if (invoice.warranty) {
      doc.text(`Warranty: ${invoice.warranty}`, 20, finalY + 48);
    }

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 border-green-300',
      PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      UNPAID: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

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
              className="text-white hover:bg-white/20 p-2 rounded-lg"
            >
              ✕
            </button>
          </div>
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getPaymentStatusColor(invoice.paymentStatus)}`}>
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{invoice.customerPhone}</p>
              </div>
              {invoice.jobCard && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Job Card</p>
                  <p className="font-semibold text-gray-900">{invoice.jobCard.jobNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">+${invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-700">${invoice.paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-yellow-700">${invoice.balance.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Payment Method</p>
              <p className="text-lg font-bold text-blue-700">{invoice.paymentMethod}</p>
            </div>
          </div>

          {/* Special Notes & Warranty */}
          {(invoice.warranty || invoice.specialNotes) && (
            <div className="border-t pt-6 space-y-4">
              {invoice.warranty && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">Warranty</p>
                  <p className="text-gray-900">{invoice.warranty}</p>
                </div>
              )}
              {invoice.specialNotes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Special Notes</p>
                  <p className="text-gray-900">{invoice.specialNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
            >
              Print
            </button>
            <button
              onClick={exportPDF}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
            >
              Download PDF
            </button>
            {invoice.paymentStatus !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
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