import React from 'react';
import { Order } from '../../services/api';
import { X, User, MapPin, Package, CreditCard, Calendar, Clock, Check, XCircle, ArrowRight, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { jsPDF } from 'jspdf';

interface OrderViewModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: Order['status']) => void;
  isAdmin?: boolean;
}

const STATUS_STEPS: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, onClose, onUpdateStatus, isAdmin }) => {
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const nextStatus = currentStepIndex !== -1 && currentStepIndex < STATUS_STEPS.length - 1 
    ? STATUS_STEPS[currentStepIndex + 1] 
    : null;

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('DataLens Invoice', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Order ID: ${order.id}`, 20, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 38);
    doc.text(`Status: ${order.status}`, 20, 46);

    // Customer Details
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('Bill To:', 20, 60);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`${order.firstName} ${order.lastName}`, 20, 68);
    doc.text(order.email, 20, 76);
    doc.text(order.phone, 20, 84);
    doc.text(order.streetAddress, 20, 92);
    doc.text(`${order.city}, ${order.state} ${order.postalCode}`, 20, 100);
    doc.text(order.country, 20, 108);

    // Product Details Table Header
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(20, 120, 170, 10, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text('Product', 25, 127);
    doc.text('Qty', 110, 127);
    doc.text('Unit Price', 130, 127);
    doc.text('Total', 165, 127);

    // Product Details Row
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(order.product, 25, 140);
    doc.text(order.quantity.toString(), 110, 140);
    doc.text(`$${order.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 130, 140);
    doc.text(`$${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 165, 140);

    // Total Amount
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(110, 150, 190, 150);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 110, 160);
    doc.text(`$${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 165, 160);

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    doc.save(`Invoice_${order.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg leading-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Order Details
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">#{order.id}</span>
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-8">
            
            {/* Status Banner */}
            <div className={cn(
              "rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between border gap-4",
              order.status === 'Delivered' && 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50',
              order.status === 'Processing' && 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50',
              order.status === 'Pending' && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50',
              order.status === 'Shipped' && 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-900/50',
              order.status === 'Cancelled' && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50'
            )}>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    order.status === 'Delivered' && 'bg-green-500',
                    order.status === 'Processing' && 'bg-blue-500',
                    order.status === 'Pending' && 'bg-yellow-500',
                    order.status === 'Shipped' && 'bg-indigo-500',
                    order.status === 'Cancelled' && 'bg-red-500'
                  )}></span>
                  <span className={cn(
                    "text-lg font-bold",
                    order.status === 'Delivered' && 'text-green-700 dark:text-green-400',
                    order.status === 'Processing' && 'text-blue-700 dark:text-blue-400',
                    order.status === 'Pending' && 'text-yellow-700 dark:text-yellow-400',
                    order.status === 'Shipped' && 'text-indigo-700 dark:text-indigo-400',
                    order.status === 'Cancelled' && 'text-red-700 dark:text-red-400'
                  )}>{order.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {isAdmin && nextStatus && onUpdateStatus && (
                  <button
                    onClick={() => onUpdateStatus(order.id, nextStatus)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    Mark as {nextStatus}
                    <ArrowRight size={16} />
                  </button>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {order.status !== 'Cancelled' ? (
              <div className="py-6 px-4 sm:px-8">
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -mt-px w-full h-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
                  <ul className="relative flex justify-between w-full">
                    {STATUS_STEPS.map((step, stepIdx) => {
                      const isCompleted = currentStepIndex >= stepIdx;
                      const isCurrent = order.status === step;
                      return (
                        <li key={step} className="flex flex-col items-center relative">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white dark:bg-slate-800 transition-colors",
                            isCompleted ? "border-indigo-600 bg-indigo-600 dark:bg-indigo-500 dark:border-indigo-500" : "border-slate-300 dark:border-slate-600",
                            isCurrent && "ring-4 ring-indigo-100 dark:ring-indigo-900/50"
                          )}>
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </div>
                          <span className={cn(
                            "mt-3 text-xs sm:text-sm font-medium absolute top-10 whitespace-nowrap",
                            isCompleted ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                          )}>
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="h-8"></div> {/* Spacer for absolute text */}
              </div>
            ) : (
              <div className="py-4 flex items-center justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-red-200 dark:border-red-900/50">
                  <XCircle className="w-5 h-5" />
                  Order Cancelled
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <User size={16} className="text-slate-400" />
                  Customer Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{order.firstName} {order.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-white">{order.phone}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <MapPin size={16} className="text-slate-400" />
                  Shipping Address
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">{order.streetAddress}</p>
                  <p className="text-slate-600 dark:text-slate-300">{order.city}, {order.state} {order.postalCode}</p>
                  <p className="text-slate-600 dark:text-slate-300">{order.country}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <Package size={16} className="text-slate-400" />
                  Order Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Product</p>
                    <p className="font-medium text-slate-900 dark:text-white">{order.product}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                      <p className="font-medium text-slate-900 dark:text-white">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Unit Price</p>
                      <p className="font-medium text-slate-900 dark:text-white">${order.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <Clock size={16} className="text-slate-400" />
                  System Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Created At</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Created By</p>
                    <p className="font-medium text-slate-900 dark:text-white capitalize">{order.createdBy}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Download size={16} />
              Download Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
