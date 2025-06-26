// src/features/rooms/pages/RoomsList.tsx - WITH MOCK DATA FALLBACK
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaBed, FaWifi, FaCar, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Button, Card, Spinner, Table, Modal, Alert } from '../../../components/ui';
import { acomodacaoService } from '../../../api/services';

// Mock rooms data
const mockRooms = [
  {
    id: 'mock-room-1',
    designation: 'Premium Individual Suite',
    singleBeds: 1,
    doubleBeds: 0,
    bathrooms: 1,
    hasAirControl: true,
    parkingSpaces: 0,
    isActive: true,
    // Legacy field support
    nomeAcomodacao: 'Premium Individual Suite',
    camaSolteiro: 1,
    camaCasal: 0,
    suite: 1,
    climatizacao: true,
    garagem: 0
  },
  {
    id: 'mock-room-2',
    designation: 'Romantic Couple Suite',
    singleBeds: 0,
    doubleBeds: 1,
    bathrooms: 1,
    hasAirControl: true,
    parkingSpaces: 1,
    isActive: true,
    nomeAcomodacao: 'Romantic Couple Suite',
    camaSolteiro: 0,
    camaCasal: 1,
    suite: 1,
    climatizacao: true,
    garagem: 1
  },
  {
    id: 'mock-room-3',
    designation: 'Family Suite for up to 2 children',
    singleBeds: 2,
    doubleBeds: 1,
    bathrooms: 1,
    hasAirControl: true,
    parkingSpaces: 1,
    isActive: true,
    nomeAcomodacao: 'Family Suite for up to 2 children',
    camaSolteiro: 2,
    camaCasal: 1,
    suite: 1,
    climatizacao: true,
    garagem: 1
  },
  {
    id: 'mock-room-4',
    designation: 'Deluxe Family Suite for up to 5 children',
    singleBeds: 5,
    doubleBeds: 1,
    bathrooms: 2,
    hasAirControl: true,
    parkingSpaces: 2,
    isActive: true,
    nomeAcomodacao: 'Deluxe Family Suite for up to 5 children',
    camaSolteiro: 5,
    camaCasal: 1,
    suite: 2,
    climatizacao: true,
    garagem: 2
  },
  {
    id: 'mock-room-5',
    designation: 'Premium Family Suite for 2 families',
    singleBeds: 6,
    doubleBeds: 2,
    bathrooms: 3,
    hasAirControl: true,
    parkingSpaces: 2,
    isActive: true,
    nomeAcomodacao: 'Premium Family Suite for 2 families',
    camaSolteiro: 6,
    camaCasal: 2,
    suite: 3,
    climatizacao: true,
    garagem: 2
  }
];

const RoomsList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // TRY TO FETCH FROM BACKEND, FALLBACK TO MOCK DATA
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await acomodacaoService.getAllAcomodacoes();
      return response.data.data || response.data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Use mock data if backend is down
  const rooms = isError ? mockRooms : data;
  const isUsingMockData = isError;

  const createDefaultsMutation = useMutation({
    mutationFn: () => acomodacaoService.createDefaultAcomodacoes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: () => {
      if (isUsingMockData) {
        alert('⚠️ Demo Mode: Backend is offline. Cannot create default rooms.');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => acomodacaoService.deleteAcomodacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setDeleteStatus('success');
      setTimeout(() => {
        setShowDeleteModal(false);
        setSelectedRoom(null);
        setDeleteStatus('idle');
      }, 1500);
    },
    onError: () => {
      setDeleteStatus('error');
      setErrorMessage('Error deleting room.');
    }
  });

  const handleDeleteClick = (room: any) => {
    if (isUsingMockData) {
      alert('⚠️ Demo Mode: Backend is offline. Delete operations are disabled.');
      return;
    }
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedRoom && !isUsingMockData) {
      deleteMutation.mutate(selectedRoom.id);
    }
  };

  const handleCreateDefaults = () => {
    if (isUsingMockData) {
      alert('⚠️ Demo Mode: Backend is offline. Cannot create default rooms.');
      return;
    }
    createDefaultsMutation.mutate();
  };

  // Handle both backend field names (designation/nomeAcomodacao)
  const filteredRooms = Array.isArray(rooms) ?
    rooms.filter(room => 
      (room.nomeAcomodacao || room.designation || '').toLowerCase().includes(search.toLowerCase())
    ) : [];

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      {/* Offline Banner */}
      {isUsingMockData && (
        <Alert 
          type="warning" 
          message={
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>
                <strong>Demo Mode:</strong> Backend is offline. Showing sample rooms. 
                Forms are functional but changes won't be saved.
              </span>
            </div>
          }
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Room Management"
        subtitle="Manage hotel rooms and their amenities"
        action={
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={handleCreateDefaults}
              disabled={createDefaultsMutation.isPending || isUsingMockData}
              className={isUsingMockData ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {createDefaultsMutation.isPending ? 'Creating...' : 'Create Default Rooms'}
            </Button>
            <Link to="/rooms/new">
              <Button className="flex items-center space-x-2">
                <FaPlus />
                <span>Add New Room</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
              <FaBed className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{filteredRooms.length}</p>
              {isUsingMockData && <p className="text-xs text-orange-600">Demo data</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FaBed className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Single Beds</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRooms.reduce((total, room) => total + (room.camaSolteiro || room.singleBeds || 0), 0)}
              </p>
              {isUsingMockData && <p className="text-xs text-orange-600">Demo data</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FaBed className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Double Beds</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRooms.reduce((total, room) => total + (room.camaCasal || room.doubleBeds || 0), 0)}
              </p>
              {isUsingMockData && <p className="text-xs text-orange-600">Demo data</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <FaCar className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Parking Spaces</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredRooms.reduce((total, room) => total + (room.garagem || room.parkingSpaces || 0), 0)}
              </p>
              {isUsingMockData && <p className="text-xs text-orange-600">Demo data</p>}
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
              placeholder="Search rooms by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* Rooms Table */}
      <Card>
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <FaBed className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
            <p className="text-gray-500 mb-6">Start by adding your first room to the system.</p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleCreateDefaults}
                disabled={isUsingMockData}
                className={isUsingMockData ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Create Default Rooms
              </Button>
              <Link to="/rooms/new">
                <Button variant="secondary">
                  <FaPlus className="mr-2" />
                  Add Custom Room
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Table headers={['Room Name', 'Single Beds', 'Double Beds', 'Bathrooms', 'AC', 'Parking', 'Actions']}>
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-pink-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-pink-100 rounded-lg mr-3">
                      <FaBed className="text-pink-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {room.nomeAcomodacao || room.designation}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-600">{room.camaSolteiro || room.singleBeds || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-600">{room.camaCasal || room.doubleBeds || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-600">{room.suite || room.bathrooms || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (room.climatizacao || room.hasAirControl) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(room.climatizacao || room.hasAirControl) ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-600">{room.garagem || room.parkingSpaces || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link to={`/rooms/${room.id}`}>
                    <Button variant="secondary" size="sm">
                      <FaEye className="mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/rooms/${room.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <FaEdit className="mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(room)}
                    disabled={isUsingMockData}
                    className={isUsingMockData ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        {deleteStatus === 'success' && (
          <Alert type="success" message="Room deleted successfully!" />
        )}
        {deleteStatus === 'error' && (
          <Alert type="error" message={errorMessage} />
        )}
        {deleteStatus === 'idle' && selectedRoom && (
          <p className="text-gray-600">
            Are you sure you want to delete room <strong>{selectedRoom.nomeAcomodacao || selectedRoom.designation}</strong>? 
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default RoomsList;