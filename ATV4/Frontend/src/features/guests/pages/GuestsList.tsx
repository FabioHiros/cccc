// src/features/guests/pages/GuestsList.tsx - FIXED FOR ACTUAL API
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaTrash, FaUsers, FaUserFriends } from 'react-icons/fa';
import { PageHeader, Button, Card, Spinner, Table, Modal, Alert } from '../../../components/ui';
import { clienteService } from '../../../api/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// SAFE DATE FORMATTING HELPER FUNCTION
const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

const GuestsList = () => {
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deleteError, setDeleteError] = useState('');

  // KEEP EXISTING API CALL - NO CHANGES TO BACKEND INTEGRATION
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await clienteService.getAllClientes();
      console.log('🔍 Guests API Response:', response);
      return response.data;
    }
  });

  // Extract guests data from response - handle both data.data and data structures
  const guests = response?.data || response || [];

  const handleDeleteClick = (guest: any) => {
    setSelectedGuest(guest);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedGuest) return;
    
    setDeleteStatus('loading');
    try {
      await clienteService.deleteCliente(selectedGuest.id);
      setDeleteStatus('success');
      refetch();
      setTimeout(() => {
        setShowDeleteModal(false);
        setSelectedGuest(null);
        setDeleteStatus('idle');
      }, 1500);
    } catch (error) {
      setDeleteStatus('error');
      setDeleteError('Error deleting guest.');
    }
  };

  // FIXED FILTER LOGIC - Using correct field names
  const filteredGuests = Array.isArray(guests) ?
    guests.filter(guest => {
      const fullName = guest.fullName || '';
      const displayName = guest.displayName || '';
      const searchTerm = search.toLowerCase();
      
      return fullName.toLowerCase().includes(searchTerm) || 
             displayName.toLowerCase().includes(searchTerm);
    }) : [];

  // FIXED CATEGORIZATION - Using correct field names
  const primaryGuests = filteredGuests.filter(guest => !guest.primaryGuestId);
  const companions = filteredGuests.filter(guest => guest.primaryGuestId);

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert 
        type="error" 
        message="Error loading guests. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Guest Management"
        subtitle="Manage all hotel guests and their companions"
        action={
          <Link to="/guests/new">
            <Button className="flex items-center space-x-2">
              <FaPlus />
              <span>Add New Guest</span>
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-gray-900">{filteredGuests.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FaUserFriends className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Primary Guests</p>
              <p className="text-3xl font-bold text-gray-900">{primaryGuests.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Companions</p>
              <p className="text-3xl font-bold text-gray-900">{companions.length}</p>
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
              placeholder="Search guests by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* Guests Table */}
      <Card>
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No guests found</h3>
            <p className="text-gray-500 mb-6">Start by adding your first guest to the system.</p>
            <Link to="/guests/new">
              <Button>
                <FaPlus className="mr-2" />
                Add First Guest
              </Button>
            </Link>
          </div>
        ) : (
          <Table headers={['Name', 'Display Name', 'Birth Date', 'Type', 'Registered', 'Actions']}>
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="hover:bg-pink-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{guest.fullName || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{guest.displayName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {formatSafeDate(guest.birthDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    guest.primaryGuestId 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {guest.primaryGuestId ? 'Companion' : 'Primary'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {formatSafeDate(guest.registrationDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link to={`/guests/${guest.id}`}>
                    <Button variant="secondary" size="sm">
                      <FaEye className="mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(guest)}
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
              disabled={deleteStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={deleteStatus === 'loading'}
            >
              {deleteStatus === 'loading' ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        {deleteStatus === 'success' && (
          <Alert type="success" message="Guest deleted successfully!" />
        )}
        {deleteStatus === 'error' && (
          <Alert type="error" message={deleteError} />
        )}
        {deleteStatus === 'idle' && selectedGuest && (
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedGuest.fullName}</strong>? 
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default GuestsList;