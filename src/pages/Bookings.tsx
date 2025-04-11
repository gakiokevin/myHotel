import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import EmptyState from '../components/emptyState';
import  api from '../api/api'

interface Booking {
  id: number;
  guest_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
}

type FilterStatus = 'all' | 'Checked-in' | 'Checked-out';

const Bookings = () => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/api/bookings');
      return data;
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bookings?.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No bookings found"
        description="There are currently no bookings to display."
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('Checked-in')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === 'Checked-in'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Checked-in
          </button>
          <button
            onClick={() => setStatusFilter('Checked-out')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              statusFilter === 'Checked-out'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Checked-out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings?.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">{booking.guest_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.room_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Kshs {Number(booking.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.payment_status === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Checked-in' 
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'Checked-out'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;