import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Hotel, Users, CreditCard, AlertTriangle ,CalendarCheck,Home,User } from 'lucide-react';

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalGuests: number;
  pendingPayments: number;
  recentBookings:Booking[];
}
interface Booking {
  id: number;
  check_in_date: string;
  status: string;
  guest_name: string;
  room_number: string;
  room_type: string;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/dashboard/stats');
  
      const totalRooms = Object.values(data.roomStats)
        .map((room) => room.count ) 
        .reduce((sum, count) => sum + count, 0);
  
      return {
        totalRooms,
        occupiedRooms: data.roomStats.Occupied?.count || 0,
        availableRooms: data.roomStats.Available?.count || 0,
        maintenanceRooms: data.roomStats.Maintenance?.count || 0,
        totalGuests: data.totalCustomers || 0,
        pendingPayments: data.pendingPayments || 0,
        recentBookings:data.recentBookings
      };
    },
  });
  
 

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Room Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Hotel className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Rooms</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Total: {stats?.totalRooms}</p>
                <p className="text-sm text-green-600">Available: {stats?.availableRooms}</p>
                <p className="text-sm text-orange-600">Occupied: {stats?.occupiedRooms}</p>
                <p className="text-sm text-red-600">Maintenance: {stats?.maintenanceRooms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Guests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Current Guests</h2>
              <p className="text-2xl font-bold mt-2">{stats?.totalGuests}</p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-10 w-10 text-yellow-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Pending Payments</h2>
              <p className="text-2xl font-bold mt-2">{stats?.pendingPayments}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-red-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Alerts</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-red-600">
                  {stats?.maintenanceRooms} rooms need maintenance
                </p>
                { stats && stats.pendingPayments > 0 && (
                  <p className="text-sm text-yellow-600">
                    {stats?.pendingPayments} pending payments
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CalendarCheck className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
        </div>
        
        {stats?.recentBookings && stats.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{booking.guest_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Home className="h-5 w-5 text-gray-400 mr-2" />
                        <span>
                          {booking.room_number} ({booking.room_type})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'Checked-in' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent bookings found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;