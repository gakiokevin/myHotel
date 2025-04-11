import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users } from 'lucide-react';
import EmptyState from '../components/emptyState';
import api from '../api/api';

interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  id_number: string;
  id_type: string;
  created_at: string;
}

const Guests = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: guests, isLoading, isError } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data } = await api.get('/api/guests');
      return data;
    },
  });

  const filteredGuests = guests?.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-4">Loading guests...</div>;

  if (isError) {
    return <div className="text-red-500 p-4">Failed to load guests. Please try again later.</div>;
  }

  if (!filteredGuests?.length) {
    return (
      <EmptyState
        icon={Users}
        title="No guests found"
        description="Try searching for a guest by name."
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Guests</h1>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Number
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGuests.map((guest) => (
              <tr key={guest.id}>
                <td className="px-6 py-4 whitespace-nowrap">{guest.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{guest.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{guest.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{guest.id_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{guest.id_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guests;
