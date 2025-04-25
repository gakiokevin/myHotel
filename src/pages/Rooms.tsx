import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Room {
  id: number;
  room_number: string;
  room_type: 'Single' | 'Double' | 'Suite';
  price_per_night: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  max_occupancy: number;
  floor_number: number;
}

const Rooms = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | Room['status']>('All');
  const queryClient = useQueryClient();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/rooms/');
      return data;
    },
  });

  const createRoom = useMutation({
     
    mutationFn: (newRoom: Omit<Room, 'id'>) => {
   
      return axios.post('http://localhost:3000/api/rooms/', newRoom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsModalOpen(false);
    },
  });

  const updateRoom = useMutation({
    mutationFn: async (updatedRoom: Room) => {

      const response = await axios.put(`http://localhost:3000/api/rooms/${updatedRoom.id}`, updatedRoom);
  
      return  response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
    
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsModalOpen(false);
    },
  });

  // const deleteRoom = useMutation({
  //   mutationFn: (roomId: number) => {
  //     return axios.delete(`http://localhost:3000/api/rooms/${roomId}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['rooms'] });
  //   },
  // });

  const filteredRooms = rooms?.filter(room => 
    statusFilter === 'All' || room.status === statusFilter
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button
          onClick={() => {
            setSelectedRoom(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3 py-1 rounded-md ${statusFilter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('Available')}
          className={`px-3 py-1 rounded-md ${statusFilter === 'Available' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Available
        </button>
        <button
          onClick={() => setStatusFilter('Occupied')}
          className={`px-3 py-1 rounded-md ${statusFilter === 'Occupied' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Occupied
        </button>
        <button
          onClick={() => setStatusFilter('Maintenance')}
          className={`px-3 py-1 rounded-md ${statusFilter === 'Maintenance' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Maintenance
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Floor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Occupancy
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
            {filteredRooms?.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap">{room.floor_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{room.room_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{room.room_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">Kshs {room.price_per_night}</td>
                <td className="px-6 py-4 whitespace-nowrap">{room.max_occupancy}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      room.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : room.status === 'Occupied'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
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

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-xl font-bold mb-4">
              {selectedRoom ? 'Edit Room' : 'Add Room'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const roomData = {
                  room_number: formData.get('room_number') as string,
                  room_type: formData.get('room_type') as Room['room_type'],
                  price_per_night: Number(formData.get('price_per_night')),
                  status: formData.get('status') as Room['status'],
                  floor_number: Number(formData.get('floor_number')),
                  max_occupancy: Number(formData.get('max_occupancy'))
                };

                if (selectedRoom) {
                  updateRoom.mutate({ ...roomData, id: selectedRoom.id });
                } else {
                  createRoom.mutate(roomData);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Floor number
                </label>
                <input
                  type="number"
                  name="floor_number"
                  defaultValue={selectedRoom?.floor_number}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  name="room_number"
                  defaultValue={selectedRoom?.room_number}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="room_type"
                  defaultValue={selectedRoom?.room_type}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Price per night
                </label>
                <input
                  type="number"
                  name="price_per_night"
                  defaultValue={selectedRoom?.price_per_night}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Max Occupancy
                </label>
                <input
                  type="number"
                  name="max_occupancy"
                  defaultValue={selectedRoom?.max_occupancy}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={selectedRoom?.status || 'Available'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex justify-between">
              
                <div className="flex justify-between ">
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
                    {selectedRoom ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;