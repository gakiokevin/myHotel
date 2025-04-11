import React from 'react';
import { Outlet, Navigate, Link ,useLocation} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Calendar, Users, CreditCard, BarChart2, LogOut,UserPlus,  Settings,
  CheckSquare,
  DoorOpen, } from 'lucide-react';

const Layout = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Hotel className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Hotel Manager</span>
          </div>
        </div>
        <nav className="mt-6">
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Calendar className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link
        to="/check-in"
        className={`flex items-center px-6 py-3 text-gray-700 ${
          isActive('/check-in') ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <DoorOpen className="h-5 w-5 mr-3" />
        Check-in
      </Link>
      <Link
        to="/check-out"
        className={`flex items-center px-6 py-3 text-gray-700 ${
          isActive('/check-out') ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <CheckSquare className="h-5 w-5 mr-3" />
        Check-out
      </Link>
          <Link
            to="/bookings"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Calendar className="h-5 w-5 mr-3" />
            Bookings
          </Link>
         
          <Link
            to="/guests"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Users className="h-5 w-5 mr-3" />
            Guests
          </Link>
          <Link
            to="/payments"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <CreditCard className="h-5 w-5 mr-3" />
            Payments
          </Link>
          {user.role === 'owner' && (
            <> <Link
            to="/rooms"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Hotel className="h-5 w-5 mr-3" />
            Rooms
          </Link>
          <Link
              to="/analytics"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </Link>
            <Link
                to="/employees"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <UserPlus className="h-5 w-5 mr-3" />
                Employees
              </Link>
              <Link
        to="/settings"
        className={`flex items-center px-6 py-3 text-gray-700 ${
          isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <Settings className="h-5 w-5 mr-3" />
        Settings
      </Link>
            </>
          )}
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;