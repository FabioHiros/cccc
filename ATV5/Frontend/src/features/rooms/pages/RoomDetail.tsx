// src/features/rooms/pages/RoomDetail.tsx - FIXED FOR BACKEND API
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaBed, FaBath, FaSnowflake, FaCar, FaRulerCombined } from 'react-icons/fa';
import { PageHeader, Card, Button, Spinner, Alert } from '../../../components/ui';
import { acomodacaoService } from '../../../api/services';

const RoomDetail = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await acomodacaoService.getAcomodacaoById(id);
      return response.data;
    }
  });

  // FIXED: Handle the actual response structure from your backend
  const room = response?.data || response;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !room) {
    return (
      <Alert 
        type="error" 
        message="Error loading room information. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={room.designation || 'Room Details'}
        subtitle="Room information and amenities"
        action={
          <Link to={`/rooms/${id}/edit`}>
            <Button className="flex items-center space-x-2">
              <FaEdit />
              <span>Edit Room</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaBed className="mr-2 text-pink-500" />
              Room Details
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaBed className="text-pink-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Single Beds</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {room.singleBeds || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaBed className="text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Double Beds</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {room.doubleBeds || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaBath className="text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {room.bathrooms || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCar className="text-purple-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Parking Spaces</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {room.parkingSpaces || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Amenities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaSnowflake className="mr-2 text-pink-500" />
              Amenities
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaSnowflake className="text-blue-500 mr-3" />
                <span className="font-medium text-gray-900">Air Conditioning</span>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                room.hasAirControl
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {room.hasAirControl ? 'Available' : 'Not Available'}
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaRulerCombined className="text-gray-500 mr-3" />
                <span className="font-medium text-gray-900">Room Capacity</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Total beds: {(room.singleBeds || 0) + (room.doubleBeds || 0)}</p>
                <p>Maximum guests: {(room.singleBeds || 0) + ((room.doubleBeds || 0) * 2)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Room Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Summary</h3>
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg border-2 border-pink-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-pink-600">
                {(room.singleBeds || 0) + (room.doubleBeds || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Beds</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">
                {room.bathrooms || 0}
              </p>
              <p className="text-sm text-gray-600">Bathrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">
                {room.parkingSpaces || 0}
              </p>
              <p className="text-sm text-gray-600">Parking</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">
                {room.hasAirControl ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-600">Air Conditioning</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoomDetail;