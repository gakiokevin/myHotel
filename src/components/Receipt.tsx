import React from 'react';
import { format } from 'date-fns';

interface ReceiptProps {
  data: {
    guest_name: string;
    room_number: string;
    check_in_date: string;
    check_out_date?: string;
    total_amount: number;
    payment_status: 'paid' | 'unpaid';
    payment_method?: string;
    transaction_id?: string;
  };
  onClose?: () => void;
  onPrint?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptProps> = ({ data, onClose, onPrint }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Receipt</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Hotel Receipt</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold">Guest:</span>
              <span>{data.guest_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Room:</span>
              <span>{data.room_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Check-in:</span>
              <span>{format(new Date(data.check_in_date), 'PPp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Check-out:</span>
              <span>{data.check_out_date ? format(new Date(data.check_out_date), 'PPp') : format(new Date(), 'PPp')}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>Kshs {Number(data.total_amount).toFixed(2)}</span>
            </div>
            {data.payment_status === 'paid' && (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold">Payment Status:</span>
                  <span className="text-green-600">Paid</span>
                </div>
                {data.payment_method && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Payment Method:</span>
                    <span>{data.payment_method}</span>
                  </div>
                )}
                {data.transaction_id && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Transaction ID:</span>
                    <span>{data.transaction_id}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <button
            onClick={onPrint || (() => window.print())}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;