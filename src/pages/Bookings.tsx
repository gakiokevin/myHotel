import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import EmptyState from '../components/emptyState';

interface Booking {
  id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  status: 'confirmed' | 'canceled';
  guest_name: string;
  room_number: string;
}

interface Guest {
  id: number;
  name: string;
}

interface Room {
  id: number;
  room_number: string;
  status: string;
}

const Bookings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/bookings');
      return data;
    },
  });

  const { data: guests } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data } = await axios.get('/api/guests');
      return data;
    },
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['available-rooms'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rooms?status=available');
      return data;
    },
  });

  const createBooking = useMutation({
    mutationFn: (newBooking: Omit<Booking, 'id' | 'guest_name' | 'room_number'>) => {
      return axios.post('/api/bookings', newBooking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      setIsModalOpen(false);
    },
  });

  const updateBooking = useMutation({
    mutationFn: (updatedBooking: Partial<Booking> & { id: number }) => {
      return axios.put(`/api/bookings/${updatedBooking.id}`, updatedBooking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      setIsModalOpen(false);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bookings?.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No bookings yet"
        description="Start by creating your first booking to track guest stays."
        action={{
          label: "Create Booking",
          onClick: () => setIsModalOpen(true)
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <button
          onClick={() => {
            setSelectedBooking(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings?.map((booking) => (
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
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-xl font-bold mb-4">
              {selectedBooking ? 'Edit Booking' : 'New Booking'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const bookingData = {
                  guest_id: Number(formData.get('guest_id')),
                  room_id: Number(formData.get('room_id')),
                  check_in_date: formData.get('check_in_date') as string,
                  check_out_date: formData.get('check_out_date') as string,
                  status: (formData.get('status') || 'confirmed') as 'confirmed' | 'canceled',
                };

                if (selectedBooking) {
                  updateBooking.mutate({ ...bookingData, id: selectedBooking.id });
                } else {
                  createBooking.mutate(bookingData);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Guest
                </label>
                <select
                  name="guest_id"
                  defaultValue={selectedBooking?.guest_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a guest</option>
                  {guests?.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                  name="room_id"
                  defaultValue={selectedBooking?.room_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms?.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Check In Date
                </label>
                <input
                  type="date"
                  name="check_in_date"
                  defaultValue={selectedBooking?.check_in_date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Check Out Date
                </label>
                <input
                  type="date"
                  name="check_out_date"
                  defaultValue={selectedBooking?.check_out_date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {selectedBooking && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedBooking.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {selectedBooking ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;