import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckSquare, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptGenerator from '../components/Receipt';

interface ActiveBooking {
  id: number;
  guest_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date?: string;
  total_amount: number;
  payment_status: 'paid' | 'unpaid';
}

interface PaymentData {
  method: 'cash' | 'mpesa';
  transaction_id?: string;
  amount: number;
}

interface DamageReport {
  description: string;
  severity: 'low' | 'medium' | 'high';
  repair_cost?: number;
}

const CheckOut = () => {
  const [selectedBooking, setSelectedBooking] = useState<ActiveBooking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentData | null>(null);
  const [damageReport, setDamageReport] = useState<DamageReport>({
    description: '',
    severity: 'low',
    repair_cost: 0
  });
  const queryClient = useQueryClient();

  // Fetch active bookings
  const { data: activeBookings, isLoading: isLoadingBookings } = useQuery<ActiveBooking[]>({
    queryKey: ['active-bookings'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/bookings/active');
      return data;
    },
  });

  const resetState = () => {
    setSelectedBooking(null);
    setShowPaymentModal(false);
    setShowConfirmModal(false);
    setShowDamageModal(false);
    setShowReceipt(false);
    setPaymentDetails(null);
    setDamageReport({
      description: '',
      severity: 'low',
      repair_cost: 0
    });
  };

  // Check-out mutation
  const processCheckOut = useMutation({
    mutationFn: (data: { 
      booking_id: number; 
      payment?: PaymentData;
      damage_report?: DamageReport;
    }) => {
      return axios.post('http://localhost:3000/api/check-out', data);
    },
    onSuccess: (_, variables) => {
      // Only show receipt if payment was processed now
      if (variables.payment) {
        setShowReceipt(true);
      } else {
        // For paid bookings or damage reports without payment
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        resetState();
      }
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  });

  const handleCheckOut = (booking: ActiveBooking) => {
    setSelectedBooking(booking);
    if (booking.payment_status.toLowerCase() === 'unpaid') {
      setShowPaymentModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleDamageReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckOut.mutate({
      booking_id: selectedBooking!.id,
      damage_report: damageReport
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Guest Check-out</h1>

      {isLoadingBookings ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : activeBookings?.length === 0 ? (
        <p className="text-center text-gray-500">No active bookings found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBookings?.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Room {booking.room_number}</h3>
                {booking.payment_status.toLowerCase() === 'unpaid' ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Payment Required
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">Guest: {booking.guest_name}</p>
                <p className="text-gray-600">
                  Check-in: {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-600">
                  Total: Kshs {Number(booking.total_amount).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleCheckOut(booking)}
                disabled={processCheckOut.isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center disabled:bg-blue-400"
              >
                {processCheckOut.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckSquare className="h-4 w-4 mr-2" />
                )}
                Process Check-out
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal (for unpaid bookings) */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold">Outstanding Payment</h2>
            </div>
            <p className="mb-4">
              Please collect payment of <span className="font-bold">Kshs {Number(selectedBooking.total_amount).toFixed(2)}</span> before check-out.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const paymentData = {
                  method: formData.get('payment_method') as 'cash' | 'mpesa',
                  transaction_id: formData.get('transaction_id') as string,
                  amount: selectedBooking.total_amount
                };
                setPaymentDetails(paymentData);
                processCheckOut.mutate({
                  booking_id: selectedBooking.id,
                  payment: paymentData
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                <select
                  name="payment_method"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="mpesa">MPesa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Required for MPesa payments</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processCheckOut.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400 flex items-center"
                >
                  {processCheckOut.isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Complete Payment & Check-out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal (for paid bookings) */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Check-out</h2>
            <p className="mb-6">Are you sure you want to check out <span className="font-semibold">{selectedBooking.guest_name}</span> from <span className="font-semibold">Room {selectedBooking.room_number}</span>?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowDamageModal(true);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center justify-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Damage/Incident
              </button>
              
              <button
                onClick={() => {
                  processCheckOut.mutate({ booking_id: selectedBooking.id });
                  setShowConfirmModal(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Complete Check-out
              </button>
              
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Damage Report Modal */}
      {showDamageModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Damage/Incident Report</h2>
            <form onSubmit={handleDamageReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  value={damageReport.description}
                  onChange={(e) => setDamageReport({...damageReport, description: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity*</label>
                <select
                  value={damageReport.severity}
                  onChange={(e) => setDamageReport({...damageReport, severity: e.target.value as any})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repair Cost (Kshs)</label>
                <input
                  type="number"
                  value={damageReport.repair_cost || ''}
                  onChange={(e) => setDamageReport({...damageReport, repair_cost: Number(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDamageModal(false);
                    setShowConfirmModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={processCheckOut.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-400 flex items-center"
                >
                  {processCheckOut.isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Submit Report & Check-out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal (only shows after processing unpaid bookings) */}
      {showReceipt && selectedBooking && paymentDetails && (
        <ReceiptGenerator
          data={{
            guest_name: selectedBooking.guest_name,
            room_number: selectedBooking.room_number,
            check_in_date: selectedBooking.check_in_date,
            check_out_date: new Date().toISOString(),
            total_amount: selectedBooking.total_amount,
            payment_status: 'paid',
            payment_method: paymentDetails.method,
            transaction_id: paymentDetails.transaction_id,
          }}
          onClose={() => {
            queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
            resetState();
          }}
        />
      )}
    </div>
  );
};

export default CheckOut;