// src/features/dashboard/pages/Dashboard.tsx - FIXED STATUS LOGIC
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaUsers, FaBed, FaCalendarAlt, FaPlus, FaArrowUp, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { Card, Spinner, Alert } from '../../../components/ui';
import { clienteService, acomodacaoService, estadiaService } from '../../../api/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  // KEEP ALL EXISTING API CALLS - WITH FALLBACK TO MOCK DATA
  const { data: guests, isLoading: loadingGuests, isError: guestsError } = useQuery({
    queryKey: ['guestsSummary'],
    queryFn: async () => {
      const response = await clienteService.getAllClientes();
      return response.data.data || response.data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: rooms, isLoading: loadingRooms, isError: roomsError } = useQuery({
    queryKey: ['roomsSummary'],
    queryFn: async () => {
      const response = await acomodacaoService.getAllAcomodacoes();
      return response.data.data || response.data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: bookings, isLoading: loadingBookings, isError: bookingsError } = useQuery({
    queryKey: ['bookingsSummary'],
    queryFn: async () => {
      const response = await estadiaService.getAllEstadias();
      return response.data.data || response.data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Mock data fallbacks
  const mockGuestsData = [{ id: '1' }, { id: '2' }, { id: '3' }];
  const mockRoomsData = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  const mockBookingsData = [
    {
      id: '1',
      arrivalDate: '2025-06-25T00:00:00.000Z',
      departDate: '2025-06-27T00:00:00.000Z'
    },
    {
      id: '2', 
      arrivalDate: '2025-06-28T00:00:00.000Z',
      departDate: '2025-06-30T00:00:00.000Z'
    }
  ];

  // Use real data or fallback to mock
  const guestsData = guestsError ? mockGuestsData : guests;
  const roomsData = roomsError ? mockRoomsData : rooms;
  const bookingsData = bookingsError ? mockBookingsData : bookings;
  
  const isUsingMockData = guestsError || roomsError || bookingsError;

  // FIXED: Status calculation function (same as BookingsList)
  const calculateBookingStatus = (booking: any) => {
    try {
      // Parse dates as date strings to avoid timezone issues
      const arrivalDateStr = booking.arrivalDate.split('T')[0]; // Get just YYYY-MM-DD part
      const departDateStr = booking.departDate.split('T')[0];   // Get just YYYY-MM-DD part
      
      // Get today as YYYY-MM-DD string
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');

      const checkInDateStr = arrivalDateStr;  
      const checkOutDateStr = departDateStr;  
      const todayDateStr = todayStr;         

      // Same logic as BookingsList: checkout day is still considered active
      if (checkInDateStr <= todayDateStr && checkOutDateStr >= todayDateStr) {
        return 'active';
      } else if (checkOutDateStr < todayDateStr) {
        return 'completed';
      } else {
        return 'upcoming';
      }
    } catch (error) {
      console.warn('Dashboard status calculation error:', error);
      return 'upcoming';
    }
  };

  const totalGuests = guestsData?.length || 0;
  const totalRooms = roomsData?.length || 0;
  const totalBookings = bookingsData?.length || 0;
  
  // FIXED: Use new status calculation
  const activeBookings = bookingsData?.filter(booking => calculateBookingStatus(booking) === 'active') || [];

  const isLoading = loadingGuests || loadingRooms || loadingBookings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Offline Banner */}
      {isUsingMockData && (
        <Alert 
          type="warning" 
          message={
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>
                <strong>Demo Mode:</strong> Backend is offline. Dashboard showing sample data.
              </span>
            </div>
          }
        />
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Welcome Back! 🏨</h1>
            <p className="text-pink-100 text-lg font-medium">
              {format(new Date(), "PPPP", { locale: ptBR })}
            </p>
            <p className="text-pink-200 mt-2">
              Your hotel management dashboard is ready
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link to="/guests/new">
              <button className="w-full sm:w-auto bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl">
                <FaPlus className="mr-2" />
                New Guest
              </button>
            </Link>
            <Link to="/bookings/new">
              <button className="w-full sm:w-auto bg-pink-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-500 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl">
                <FaCalendarAlt className="mr-2" />
                New Booking
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Guests */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Guests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalGuests}</p>
              <div className="flex items-center mt-2 text-sm">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Active</span>
                {isUsingMockData && <span className="ml-2 text-xs text-orange-600">Demo</span>}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl">
              <FaUsers className="text-white text-2xl" />
            </div>
          </div>
        </Card>

        {/* Total Rooms */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRooms}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-blue-600 font-medium">Available</span>
                {isUsingMockData && <span className="ml-2 text-xs text-orange-600">Demo</span>}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FaBed className="text-white text-2xl" />
            </div>
          </div>
        </Card>

        {/* Total Bookings */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-green-600 font-medium">All Time</span>
                {isUsingMockData && <span className="ml-2 text-xs text-orange-600">Demo</span>}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
          </div>
        </Card>

        {/* Active Bookings - FIXED */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeBookings.length}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-purple-600 font-medium">Current Stays</span>
                {isUsingMockData && <span className="ml-2 text-xs text-orange-600">Demo</span>}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-6 border-2 border-pink-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-4">
            <Link to="/guests" className="block">
              <div className="flex items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors duration-200">
                <div className="p-2 bg-pink-500 rounded-lg">
                  <FaUsers className="text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">Manage Guests</p>
                  <p className="text-gray-600 text-sm">View and edit guest information</p>
                </div>
                <FaEye className="text-pink-500" />
              </div>
            </Link>

            <Link to="/rooms" className="block">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FaBed className="text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">Room Management</p>
                  <p className="text-gray-600 text-sm">Configure rooms and amenities</p>
                </div>
                <FaEye className="text-blue-500" />
              </div>
            </Link>

            <Link to="/bookings" className="block">
              <div className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FaCalendarAlt className="text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">Booking System</p>
                  <p className="text-gray-600 text-sm">Handle reservations and check-ins</p>
                </div>
                <FaEye className="text-green-500" />
              </div>
            </Link>
          </div>
        </Card>

        {/* System Overview - FIXED */}
        <Card className="p-6 border-2 border-pink-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Occupancy</span>
              <span className="text-2xl font-bold text-pink-600">
                {totalRooms > 0 ? Math.round((activeBookings.length / totalRooms) * 100) : 0}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalRooms > 0 ? Math.round((activeBookings.length / totalRooms) * 100) : 0}%` 
                }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <p className="text-2xl font-bold text-pink-600">{totalRooms}</p>
                <p className="text-gray-600 text-sm">Total Rooms</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{activeBookings.length}</p>
                <p className="text-gray-600 text-sm">Active Stays</p>
              </div>
            </div>

            {/* Debug info for dashboard - remove in production */}
            {!isUsingMockData && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p><strong>Debug:</strong> Found {activeBookings.length} active bookings out of {totalBookings} total</p>
                {bookingsData && bookingsData.length > 0 && (
                  <p><strong>Sample booking status:</strong> {calculateBookingStatus(bookingsData[0])}</p>
                )}
              </div>
            )}
            {isUsingMockData && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg text-xs text-orange-600">
                <p><strong>Demo Mode:</strong> Backend offline - showing sample statistics</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;