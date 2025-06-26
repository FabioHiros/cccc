// src/features/bookings/pages/BookingsList.tsx - CLEAN VERSION
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaEdit, FaCalendarAlt, FaUser, FaBed } from 'react-icons/fa';
import { PageHeader, Button, Card, Spinner, Table, Alert } from '../../../components/ui';
import { estadiaService } from '../../../api/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BookingsList = () => {
  const [search, setSearch] = useState('');

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await estadiaService.getAllEstadias();
      return response.data;
    }
  });

  // Extract bookings with multiple fallbacks
  const bookings = response?.data || response || [];
  
  const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (!booking) return false;
    
    // FIXED: Use correct field name from your backend - it's "primary", not "primaryGuest" or "titular"
    const guestName = booking.primary?.fullName || 
                     booking.primary?.displayName || '';
                     
    // FIXED: Use correct field name from your backend - it's "room", not "acomodacao"
    const roomName = booking.room?.designation || '';
                     
    const searchTerm = search.toLowerCase();
    
    return guestName.toLowerCase().includes(searchTerm) || 
           roomName.toLowerCase().includes(searchTerm);
  }) : [];

  const today = new Date();
  const activeBookings = filteredBookings.filter(booking => {
    try {
      // FIXED: Use correct field names - arrivalDate and departDate
      const checkIn = new Date(booking.arrivalDate);
      const checkOut = new Date(booking.departDate);
      return checkIn <= today && checkOut >= today;
    } catch {
      return false;
    }
  });

  const upcomingBookings = filteredBookings.filter(booking => {
    try {
      const checkIn = new Date(booking.arrivalDate);
      return checkIn > today;
    } catch {
      return false;
    }
  });

  const pastBookings = filteredBookings.filter(booking => {
    try {
      const checkOut = new Date(booking.departDate);
      return checkOut < today;
    } catch {
      return false;
    }
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert 
        type="error" 
        message="Error loading bookings. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Booking Management"
        subtitle="Manage all hotel reservations and stays"
        action={
          <Link to="/bookings/new">
            <Button className="flex items-center space-x-2">
              <FaPlus />
              <span>New Booking</span>
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{filteredBookings.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FaUser className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Active Stays</p>
              <p className="text-3xl font-bold text-gray-900">{activeBookings.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{pastBookings.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings by guest name or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">Start by creating your first booking.</p>
            <Link to="/bookings/new">
              <Button>
                <FaPlus className="mr-2" />
                Create First Booking
              </Button>
            </Link>
          </div>
        ) : (
          <Table headers={['Guest', 'Room', 'Check-in', 'Check-out', 'Status', 'Duration', 'Actions']}>
            {filteredBookings.map((booking) => {
              try {
                // FIXED: Use exact field names from your backend data
                const checkIn = new Date(booking.arrivalDate);
                const checkOut = new Date(booking.departDate);
                const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                
                let status = 'upcoming';
                let statusColor = 'bg-blue-100 text-blue-800';
                
                if (checkIn <= today && checkOut >= today) {
                  status = 'active';
                  statusColor = 'bg-green-100 text-green-800';
                } else if (checkOut < today) {
                  status = 'completed';
                  statusColor = 'bg-gray-100 text-gray-800';
                }

                // FIXED: Use correct field names from your actual backend response
                const guestName = booking.primary?.fullName || 'Unknown Guest';
                const roomName = booking.room?.designation || 'Unknown Room';

                return (
                  <tr key={booking.id} className="hover:bg-pink-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-pink-100 rounded-lg mr-3">
                          <FaUser className="text-pink-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {guestName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FaBed className="text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-600">
                          {roomName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {format(checkIn, 'dd/MM/yyyy')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(checkIn, 'EEEE', { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {format(checkOut, 'dd/MM/yyyy')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(checkOut, 'EEEE', { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link to={`/bookings/${booking.id}`}>
                        <Button variant="secondary" size="sm">
                          <FaEye className="mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/bookings/${booking.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <FaEdit className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              } catch (error) {
                return (
                  <tr key={booking.id || Math.random()}>
                    <td colSpan={7} className="px-6 py-4 text-red-500 text-sm">
                      Error displaying booking data
                    </td>
                  </tr>
                );
              }
            })}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default BookingsList;