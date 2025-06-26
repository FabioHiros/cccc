// src/features/bookings/pages/BookingDetail.tsx - FIXED STATUS LOGIC
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaUser, FaBed, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { PageHeader, Card, Button, Spinner, Alert } from '../../../components/ui';
import { estadiaService } from '../../../api/services';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BookingDetail = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await estadiaService.getEstadiaById(id);
      return response.data;
    }
  });

  const booking = response?.data || response;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !booking) {
    return (
      <Alert 
        type="error" 
        message="Error loading booking information. Please try again." 
      />
    );
  }

  const checkIn = new Date(booking.arrivalDate);
  const checkOut = new Date(booking.departDate);
  const duration = differenceInDays(checkOut, checkIn);

  // FIXED: Same status logic as BookingsList
  const calculateStatus = () => {
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

      console.log('📅 BookingDetail status calculation:', {
        checkInDateStr,
        checkOutDateStr, 
        todayDateStr,
        'checkIn <= today': checkInDateStr <= todayDateStr,
        'checkOut >= today': checkOutDateStr >= todayDateStr,
        'checkOut < today': checkOutDateStr < todayDateStr
      });

      // Use same logic as BookingsList
      if (checkInDateStr <= todayDateStr && checkOutDateStr >= todayDateStr) {
        return { status: 'active', color: 'bg-green-100 text-green-800' };
      } else if (checkOutDateStr < todayDateStr) {
        return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
      } else {
        return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
      }
    } catch (error) {
      console.error('Status calculation error:', error);
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const { status, color } = calculateStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Booking #${booking.id.slice(-8).toUpperCase()}`}
        subtitle={`${booking.primary?.fullName || 'Unknown Guest'} • ${duration + 1} ${duration === 0 ? 'day' : 'days'}`}
        action={
          <Link to={`/bookings/${id}/edit`}>
            <Button className="flex items-center space-x-2">
              <FaEdit />
              <span>Edit Booking</span>
            </Button>
          </Link>
        }
      />

      {/* Status Banner */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full capitalize ${color}`}>
              {status}
            </span>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {format(checkIn, 'dd/MM/yyyy')} - {format(checkOut, 'dd/MM/yyyy')}
              </p>
              <p className="text-gray-600">
                {duration + 1} {duration === 0 ? 'day' : 'days'} • Check-in at 14:00, Check-out at 12:00
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Booking Status</p>
            <p className="text-2xl font-bold text-pink-600 capitalize">{status}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUser className="mr-2 text-pink-500" />
              Guest Information
            </h3>
            <Link to={`/guests/${booking.primaryId}`}>
              <Button variant="secondary" size="sm">
                View Profile
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-pink-50 rounded-lg">
              <div className="p-3 bg-pink-500 rounded-full mr-4">
                <FaUser className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.primary?.fullName || 'Unknown Guest'}
                </p>
                {booking.primary?.displayName && (
                  <p className="text-gray-600">Display: {booking.primary.displayName}</p>
                )}
                <p className="text-sm text-gray-500">Primary Guest</p>
              </div>
            </div>

            {booking.primary?.address && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-gray-600">{booking.primary.address.street}</p>
                    {booking.primary.address.city && (
                      <p className="text-gray-600">
                        {booking.primary.address.city}, {booking.primary.address.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {booking.primary?.contacts && booking.primary.contacts.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Contact</p>
                {booking.primary.contacts.map((contact: any) => (
                  <p key={contact.id} className="text-gray-600">
                    ({contact.areaCode}) {contact.number}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Room Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaBed className="mr-2 text-pink-500" />
              Room Information
            </h3>
            <Link to={`/rooms/${booking.roomId}`}>
              <Button variant="secondary" size="sm">
                View Room
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="p-3 bg-blue-500 rounded-full mr-4">
                <FaBed className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.room?.designation || 'Unknown Room'}
                </p>
                <p className="text-sm text-gray-500">Room Assignment</p>
              </div>
            </div>

            {booking.room && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {(booking.room.singleBeds || 0) + (booking.room.doubleBeds || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Beds</p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {(booking.room.singleBeds || 0) + ((booking.room.doubleBeds || 0) * 2)}
                  </p>
                  <p className="text-sm text-gray-500">Max Guests</p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.room.bathrooms || 0}
                  </p>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">
                    {booking.room.hasAirControl ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-500">A/C</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Check-in Details */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCalendarAlt className="mr-2 text-pink-500" />
              Check-in Details
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="text-green-500 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {format(checkIn, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600">Check-in Date</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="text-red-500 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {format(checkOut, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600">Check-out Date</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FaClock className="text-blue-500 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">{duration + 1} Days</p>
                  <p className="text-sm text-gray-600">Total Duration</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaClock className="mr-2 text-pink-500" />
              Booking Timeline
            </h3>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-pink-200"></div>
              
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Booking Created</p>
                  <p className="text-sm text-gray-600">Reservation confirmed</p>
                </div>
              </div>

              <div className="relative flex items-start mt-6">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'active' || status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Check-in</p>
                  <p className="text-sm text-gray-600">
                    {format(checkIn, 'dd/MM/yyyy')} at 14:00
                  </p>
                </div>
              </div>

              <div className="relative flex items-start mt-6">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Check-out</p>
                  <p className="text-sm text-gray-600">
                    {format(checkOut, 'dd/MM/yyyy')} at 12:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Booking Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg border-2 border-pink-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">{duration + 1}</p>
              <p className="text-sm text-gray-600">Days</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600 capitalize">{status}</p>
              <p className="text-sm text-gray-600">Status</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">
                {booking.room ? 
                  ((booking.room.singleBeds || 0) + ((booking.room.doubleBeds || 0) * 2)) : 
                  'N/A'}
              </p>
              <p className="text-sm text-gray-600">Room Capacity</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingDetail;