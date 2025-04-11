import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoorOpen, CreditCard } from 'lucide-react';
import ReceiptGenerator from '../components/Receipt';
import api from '../api/api'
interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price_per_night: number;
  status: string;
  max_occupancy: number;
  floor_number: number;
}

interface Guest {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  id_type: string;
  id_number: string;
}

interface CheckInData {
  guest: Guest;
  room_id: number;
  amount: number;
  payment_type: 'now' | 'later';
  payment_method?: 'cash' | 'mpesa';
  transaction_id?: string;
  check_in_date:string;
  check_out_date:string

}

const CheckIn = () => {
  const [step, setStep] = useState(1);
  const [checkInData, setCheckInData] = useState<Partial<CheckInData>>({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: availableRooms } = useQuery<Room[]>({
    queryKey: ['available-rooms'],
    queryFn: async () => {
      const { data } = await api.get('/api/rooms/available');
      return data;
    },
  });

  const checkIn = useMutation({
    mutationFn: (data: CheckInData) => api.post('/api/check-in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });

      if(checkInData.payment_type==='now'){
        const selectedRoom = availableRooms?.find(r => r.id === checkInData.room_id);
      setReceiptData({
        guest_name: `${checkInData.guest?.first_name} ${checkInData.guest?.last_name}`,
        room_number: selectedRoom?.room_number,
        check_in_date: new Date().toISOString(),
        total_amount: checkInData.amount || 0,
        payment_status: checkInData.payment_type === 'now' ? 'paid' : 'unpaid',
        payment_method: checkInData.payment_method,
        transaction_id: checkInData.transaction_id
      });
        setShowReceipt(true)
      }else{
        alert('checking succesful without payment')}
      
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  });

  const renderStep = () => {
    switch (step) {
      case 1: // Room Selection
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Room</h2>
            {availableRooms?.length === 0 ? (
              <p className="text-red-500">No available rooms found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms?.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setCheckInData({ ...checkInData, room_id: room.id, amount: room.price_per_night });
                      setStep(2);
                    }}
                    className="p-4 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <h3 className="font-semibold">Room {room.room_number}</h3>
                    <p className="text-gray-600 capitalize">{room.room_type}</p>
                    <p className="text-gray-600 capitalize">{`floor: ${room.room_number}`}</p>
                    <p className="text-gray-600 capitalize">{`floor:${room.floor_number}`}</p>
                    <p className="text-gray-600 capitalize">{`occupancy:${room.max_occupancy}`}</p>
                    <p className="text-blue-600 font-semibold">{room.price_per_night}/night</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2: // Guest Information
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Guest Information</h2>
            <form
  onSubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setCheckInData({
      ...checkInData,
      guest: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string || undefined,
        id_type: formData.get('id_type') as string,
        id_number: formData.get('id_number') as string,
      },
      check_in_date: formData.get('check_in_date') as string,
      check_out_date: formData.get('check_out_date') as string,
    });
    setStep(3);
  }}
  className="space-y-4"
>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">First Name*</label>
      <input
        type="text"
        name="first_name"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Last Name*</label>
      <input
        type="text"
        name="last_name"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
    <input
      type="tel"
      name="phone"
      required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      name="email"
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">ID Type*</label>
      <select
        name="id_type"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">Select ID Type</option>
        <option value="Passport">Passport</option>
        <option value="National ID">National ID</option>
        <option value="Driver License">Driver License</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">ID Number*</label>
      <input
        type="text"
        name="id_number"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">Check-in Date*</label>
      <input
        type="date"
        name="check_in_date"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Check-out Date*</label>
      <input
        type="date"
        name="check_out_date"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>

  <div className="flex justify-between pt-4">
    <button
      type="button"
      onClick={() => setStep(1)}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
    >
      Back
    </button>
    <button
      type="submit"
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
    >
      Next
    </button>
  </div>
</form>

          </div>
        );

      case 3: // Payment Options
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment Options</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setCheckInData({ ...checkInData, payment_type: 'now' });
                  setStep(4);
                }}
                className="w-full p-4 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col items-center"
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <h3 className="font-semibold">Pay Now</h3>
                <p className="text-sm text-gray-600">Process payment immediately</p>
              </button>

              <button
                onClick={() => {
                  const updatedData = { ...checkInData, payment_type: 'later' };
                  setCheckInData(updatedData as CheckInData);
                  checkIn.mutate(updatedData as CheckInData);
                }}
                className="w-full p-4 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col items-center"
              >
                <DoorOpen className="h-6 w-6 mb-2" />
                <h3 className="font-semibold">Pay at Check-out</h3>
                <p className="text-sm text-gray-600">Collect payment during check-out</p>
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 4: // Process Payment
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Process Payment</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const finalData = {
                  ...checkInData,
                  payment_method: formData.get('payment_method') as 'cash' | 'mpesa',
                  transaction_id: formData.get('transaction_id') as string,
                };
                checkIn.mutate(finalData as CheckInData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method*</label>
                <select
                  name="payment_method"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="mpesa">MPesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Required for MPesa payments</p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Complete Check-in
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Guest Check-in</h1>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              {stepNumber > 1 && <div className={`h-1 w-8 ${step >= stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step > stepNumber
                    ? 'bg-blue-600 text-white'
                    : step === stepNumber
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStep()}
      </div>

      {showReceipt && receiptData && (
        <ReceiptGenerator
          data={receiptData}
          onClose={() => {
            setShowReceipt(false);
            setStep(1);
            setCheckInData({});
          }}
        />
      )}
    </div>
  );
};

export default CheckIn;