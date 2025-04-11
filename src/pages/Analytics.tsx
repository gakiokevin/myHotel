import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart2, TrendingUp, DollarSign, Users } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsData {
  occupancyRate: number;
  totalRevenue: number;
  averageRate: number;
  popularRooms: {
    type: string;
    bookings: number;
  }[];
  revenueByDate: {
    date: string;
    amount: number;
  }[];
  guestsByDate: {
    date: string;
    count: number;
  }[];
}

const Analytics = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [startDate, setStartDate] = useState(
    dateRange === 'week' ? subDays(new Date(), 7) : startOfMonth(new Date())
  );
  const [endDate, setEndDate] = useState(
    dateRange === 'week' ? new Date() : endOfMonth(new Date())
  );

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const { data } = await axios.get('/api/analytics', {
        params: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        },
      });
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setDateRange('week');
              setStartDate(subDays(new Date(), 7));
              setEndDate(new Date());
            }}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              setDateRange('month');
              setStartDate(startOfMonth(new Date()));
              setEndDate(endOfMonth(new Date()));
            }}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart2 className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Occupancy Rate</h2>
              <p className="text-2xl font-bold mt-2">
                {analytics?.occupancyRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Total Revenue</h2>
              <p className="text-2xl font-bold mt-2">
                ${analytics?.totalRevenue}
              </p>
            </div>
          </div>
        </div>

        {/* Average Daily Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-10 w-10 text-yellow-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Average Daily Rate</h2>
              <p className="text-2xl font-bold mt-2">
                ${analytics?.averageRate}
              </p>
            </div>
          </div>
        </div>

        {/* Popular Room Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-10 w-10 text-purple-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Popular Room Types</h2>
            </div>
          </div>
          <div className="space-y-2">
            {analytics?.popularRooms.map((room) => (
              <div
                key={room.type}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-600">{room.type}</span>
                <span className="text-sm font-semibold">
                  {room.bookings} bookings
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
        <div className="h-64">
          {/* Add your preferred charting library here */}
          <div className="flex h-full items-end space-x-2">
            {analytics?.revenueByDate.map((data) => (
              <div
                key={data.date}
                className="flex-1 bg-blue-200 hover:bg-blue-300 transition-colors rounded-t"
                style={{
                  height: `${
                    (data.amount / Math.max(...analytics.revenueByDate.map((d) => d.amount))) * 100
                  }%`,
                }}
                title={`${format(new Date(data.date), 'MMM dd')}: $${data.amount}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guest Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Guest Trend</h2>
        <div className="h-64">
          {/* Add your preferred charting library here */}
          <div className="flex h-full items-end space-x-2">
            {analytics?.guestsByDate.map((data) => (
              <div
                key={data.date}
                className="flex-1 bg-green-200 hover:bg-green-300 transition-colors rounded-t"
                style={{
                  height: `${
                    (data.count / Math.max(...analytics.guestsByDate.map((d) => d.count))) * 100
                  }%`,
                }}
                title={`${format(new Date(data.date), 'MMM dd')}: ${data.count} guests`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;