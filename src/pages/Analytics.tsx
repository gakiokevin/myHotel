import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api'
import { BarChart2, TrendingUp, DollarSign, Users } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ChartBar } from '../components/chartBar';

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

const formatKES = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({ 
  icon, 
  title, 
  value,
  loading = false,
  color = 'blue',
  subtitle = ''
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  loading?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center">
        <div className={`h-12 w-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-600">{title}</h2>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded mt-1 animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold mt-1 text-gray-900">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};



const Analytics = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [startDate, setStartDate] = useState(
    dateRange === 'week' ? subDays(new Date(), 7) : startOfMonth(new Date())
  );
  const [endDate, setEndDate] = useState(
    dateRange === 'week' ? new Date() : endOfMonth(new Date())
  );

  const { data: analytics, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/api/analytics', {
        params: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        },
      });
      return data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 3,
  });

  const handleDateRangeChange = (range: 'week' | 'month') => {
    setDateRange(range);
    setStartDate(range === 'week' ? subDays(new Date(), 7) : startOfMonth(new Date()));
    setEndDate(range === 'week' ? new Date() : endOfMonth(new Date()));
  };

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
              <p className="mt-1 text-sm text-red-700">Unable to fetch analytics data. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BarChart2 className="h-6 w-6" />}
            title="Occupancy Rate"
            value={`${analytics?.occupancyRate || 0}%`}
            loading={isLoading}
            color="blue"
            subtitle="Room utilization"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            title="Total Revenue"
            value={formatKES(analytics?.totalRevenue || 0)}
            loading={isLoading}
            color="green"
            subtitle="Period earnings"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Average Rate"
            value={formatKES(analytics?.averageRate || 0)}
            loading={isLoading}
            color="yellow"
            subtitle="Per night"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Most Popular Room"
            value={analytics?.popularRooms[0]?.type || 'N/A'}
            loading={isLoading}
            color="purple"
            subtitle={`${analytics?.popularRooms[0]?.bookings || 0} bookings`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Revenue Chart */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h2>
    <div className="h-64">
      <ChartBar
        isLoading={isLoading}
        data={analytics?.revenueByDate.map(d => ({
          date: d.date,
          value: d.amount,
          displayValue: formatKES(d.amount)
        })) || []}
        color="rgba(59, 130, 246, 0.5)" // blue-200 equivalent
      />
    </div>
  </div>

  {/* Guest Trend */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">Guest Trend</h2>
    <div className="h-64">
      <ChartBar
        isLoading={isLoading}
        data={analytics?.guestsByDate.map(d => ({
          date: d.date,
          value: d.count,
          displayValue: `${d.count} guests`
        })) || []}
        color="rgba(74, 222, 128, 0.5)" // green-200 equivalent
      />
    </div>
  </div>
</div>

        {/* Popular Rooms */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Room Types</h2>
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              analytics?.popularRooms.map((room, index) => (
                <div
                  key={room.type}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-purple-50 text-purple-600' :
                      index === 1 ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="ml-3 text-gray-900 font-medium">{room.type}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {room.bookings} {room.bookings === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;