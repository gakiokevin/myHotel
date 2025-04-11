import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import EmployeeManagement from './pages/EmployeeManagement';
import { AuthProvider } from './context/AuthContext';
import CheckIn from './pages/CheckIn';
import CheckOut from './pages/CheckOut';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="guests" element={<Guests />} />
              <Route path="payments" element={<Payments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path='check-in' element={<CheckIn/>}/>
              <Route path='check-out' element={<CheckOut/>}/>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;