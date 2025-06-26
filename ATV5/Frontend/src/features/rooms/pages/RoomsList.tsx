// src/features/rooms/pages/RoomsList.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaBed, FaWifi, FaCar } from 'react-icons/fa';
import { PageHeader, Button, Card, Spinner, Table, Modal, Alert } from '../../../components/ui';
import { acomodacaoService } from '../../../api/services';
import type { Acomodacao } from '../../../types';

const RoomsList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Acomodacao | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // KEEP EXISTING API CALL - NO BACKEND CHANGES
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await acomodacaoService.getAllAcomodacoes();
      return response.data.data || response.data;
    }
  });

  const createDefaultsMutation = useMutation({
    mutationFn: () => acomodacaoService.createDefaultAcomodacoes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
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

  const handleDeleteClick = (room: Acomodacao) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedRoom) {
      deleteMutation.mutate(selectedRoom.id);
    }
  };

  const handleCreateDefaults = () => {
    createDefaultsMutation.mutate();
  };

  // Handle both backend field names (designation/nomeAcomodacao)
  const filteredRooms = Array.isArray(data) ?
    data.filter(room => 
      (room.nomeAcomodacao || room.designation || '').toLowerCase().includes(search.toLowerCase())
    ) : [];

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert 
        type="error" 
        message="Error loading rooms. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Room Management"
        subtitle="Manage hotel rooms and their amenities"
        action={
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={handleCreateDefaults}
              disabled={createDefaultsMutation.isPending}
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
              <Button onClick={handleCreateDefaults}>
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