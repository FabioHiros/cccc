// src/features/dashboard/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaUsers, FaBed, FaCalendarAlt, FaPlus, FaArrowUp, FaEye } from 'react-icons/fa';
import { Card, Spinner } from '../../../components/ui';
import { clienteService, acomodacaoService, estadiaService } from '../../../api/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  // KEEP ALL EXISTING API CALLS - NO BACKEND CHANGES
  const { data: guests, isLoading: loadingGuests } = useQuery({
    queryKey: ['guestsSummary'],
    queryFn: async () => {
      const response = await clienteService.getAllClientes();
      return response.data.data || response.data;
    }
  });

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['roomsSummary'],
    queryFn: async () => {
      const response = await acomodacaoService.getAllAcomodacoes();
      return response.data.data || response.data;
    }
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['bookingsSummary'],
    queryFn: async () => {
      const response = await estadiaService.getAllEstadias();
      return response.data.data || response.data;
    }
  });

  const totalGuests = guests?.length || 0;
  const totalRooms = rooms?.length || 0;
  const totalBookings = bookings?.length || 0;
  
  const today = new Date();
  const activeBookings = bookings?.filter(booking => {
    const checkIn = new Date(booking.checkIn || booking.arrivalDate);
    const checkOut = new Date(booking.checkOut || booking.departDate);
    return checkIn <= today && checkOut >= today;
  }) || [];

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
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
          </div>
        </Card>

        {/* Active Bookings */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeBookings.length}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-purple-600 font-medium">Current</span>
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

        {/* System Overview */}
        <Card className="p-6 border-2 border-pink-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Guest Occupancy</span>
              <span className="text-2xl font-bold text-pink-600">
                {totalGuests > 0 ? Math.round((activeBookings.length / totalGuests) * 100) : 0}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalGuests > 0 ? Math.round((activeBookings.length / totalGuests) * 100) : 0}%` 
                }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <p className="text-2xl font-bold text-pink-600">{totalRooms}</p>
                <p className="text-gray-600 text-sm">Rooms Available</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{activeBookings.length}</p>
                <p className="text-gray-600 text-sm">Active Stays</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;