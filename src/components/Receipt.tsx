import React, { useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import ReactToPrint from 'react-to-print';

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
    receiptNumber: string;
  };
  onClose?: () => void;
}

const PrintableReceipt = React.forwardRef<HTMLDivElement, { data: ReceiptProps['data']; user: any }>(
  ({ data, user }, ref) => {
    return (
      <div
        ref={ref}
        className="p-8 max-w-md mx-auto bg-white text-black text-sm font-sans print:block hidden"
      >
        <div className="text-center mb-4">
         
          <p className="text-gray-500 text-sm">Receipt No: {data.receiptNumber}</p>
          <p className="text-xs mt-1">Served by: <strong>{user?.name || 'Hotel Staff'}</strong></p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between"><span className="font-medium">Guest:</span> <span>{data.guest_name}</span></div>
          <div className="flex justify-between"><span className="font-medium">Room:</span> <span>{data.room_number}</span></div>
          <div className="flex justify-between"><span className="font-medium">Check-in:</span> <span>{format(new Date(data.check_in_date), 'PPpp')}</span></div>
          <div className="flex justify-between"><span className="font-medium">Check-out:</span> <span>{data.check_out_date ? format(new Date(data.check_out_date), 'PPpp') : format(new Date(), 'PPpp')}</span></div>

          <hr className="my-3 border-gray-300" />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>Kshs {Number(data.total_amount).toFixed(2)}</span>
          </div>

          {data.payment_status === 'paid' && (
            <>
              <div className="flex justify-between"><span className="font-medium">Payment:</span> <span className="text-green-600">PAID</span></div>
              {data.payment_method && (
                <div className="flex justify-between"><span className="font-medium">Method:</span> <span>{data.payment_method}</span></div>
              )}
              {data.transaction_id && (
                <div className="flex justify-between"><span className="font-medium">Transaction ID:</span> <span>{data.transaction_id}</span></div>
              )}
            </>
          )}
        </div>

        <hr className="my-4 border-gray-300" />

        <p className="text-center text-gray-600 text-xs">Thank you for choosing use. We look forward to hosting you again.</p>
      </div>
    );
  }
);
PrintableReceipt.displayName = 'PrintableReceipt';

const ReceiptGenerator: React.FC<ReceiptProps> = ({ data, onClose }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl print:shadow-none print:border-none print:rounded-none print:p-0">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-xl font-bold">Receipt Preview</h2>
          {onClose && (
            <button onClick={onClose} className="text-red-600 hover:text-red-800">
              Close
            </button>
          )}
        </div>

        {/* Preview (Minimal) */}
        <div className="space-y-3 print:hidden text-sm text-gray-700">
          <p><strong>Guest:</strong> {data.guest_name}</p>
          <p><strong>Room:</strong> {data.room_number}</p>
          <p><strong>Total:</strong> Kshs {Number(data.total_amount).toFixed(2)}</p>
          <p><strong>Payment:</strong> {data.payment_status === 'paid' ? 'PAID' : 'UNPAID'}</p>
        </div>

        {/* Print-only full receipt */}
        <PrintableReceipt ref={componentRef} data={data} user={user} />

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-3 print:hidden">
          <ReactToPrint
            trigger={() => (
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Print Receipt
              </button>
            )}
            content={() => componentRef.current}
            documentTitle={`${data.receiptNumber}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
