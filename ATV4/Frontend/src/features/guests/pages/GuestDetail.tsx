// src/features/guests/pages/GuestDetail.tsx - FIXED FOR BACKEND API
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaPlus, FaUser, FaHome, FaPhone, FaIdCard, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import { PageHeader, Card, Button, Spinner, Alert } from '../../../components/ui';
import { clienteService } from '../../../api/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// SAFE DATE FORMATTING HELPER FUNCTION
const formatSafeDate = (dateString: string | null | undefined, formatString: string = 'dd/MM/yyyy'): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, formatString, { locale: ptBR });
  } catch (error) {
    return 'Invalid Date';
  }
};

const GuestDetail = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const response = await clienteService.getClienteById(id);
      return response.data;
    }
  });

  // Extract guest data from response - handle backend structure
  const guest = response?.data || response;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !guest) {
    return (
      <Alert 
        type="error" 
        message="Error loading guest information. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={guest.fullName || 'Unknown Guest'}
        subtitle={guest.displayName ? `Display Name: ${guest.displayName}` : undefined}
        action={
          <Link to={`/guests/${id}/edit`}>
            <Button className="flex items-center space-x-2">
              <FaEdit />
              <span>Edit Guest</span>
            </Button>
          </Link>
        }
      />

      {/* Guest Type Banner */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${guest.primaryGuestId ? 'bg-blue-500' : 'bg-pink-500'}`}>
              <FaUser className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {guest.primaryGuestId ? 'Companion Guest' : 'Primary Guest'}
              </h3>
              <p className="text-gray-600">
                {guest.primaryGuestId ? 
                  `Companion of primary guest` : 
                  'Main account holder'
                }
              </p>
            </div>
          </div>
          <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
            guest.primaryGuestId ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
          }`}>
            {guest.primaryGuestId ? 'Companion' : 'Primary'}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUser className="mr-2 text-pink-500" />
              Personal Information
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Full Name</span>
                  <p className="text-lg font-semibold text-gray-900">{guest.fullName || 'N/A'}</p>
                </div>
                {guest.displayName && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Display Name</span>
                    <p className="text-gray-700">{guest.displayName}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Birth Date</span>
                  <p className="text-gray-700">
                    {formatSafeDate(guest.birthDate, 'dd MMMM yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Registration Date</span>
                  <p className="text-gray-700">
                    {formatSafeDate(guest.registrationDate, 'dd MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaHome className="mr-2 text-pink-500" />
              Address
            </h3>
            <Link to={`/guests/${id}/address/edit`}>
              <Button variant="secondary" size="sm">
                <FaEdit className="mr-1" />
                Edit
              </Button>
            </Link>
          </div>
          {guest.address ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Street Address</span>
                  <p className="text-gray-900">{guest.address.street || 'N/A'}</p>
                </div>
                {guest.address.district && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">District</span>
                    <p className="text-gray-700">{guest.address.district}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {guest.address.city && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">City</span>
                      <p className="text-gray-700">{guest.address.city}</p>
                    </div>
                  )}
                  {guest.address.region && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Region</span>
                      <p className="text-gray-700">{guest.address.region}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {guest.address.country && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Country</span>
                      <p className="text-gray-700">{guest.address.country}</p>
                    </div>
                  )}
                  {guest.address.postalCode && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Postal Code</span>
                      <p className="text-gray-700">{guest.address.postalCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 mb-3">No address information available</p>
              <Link to={`/guests/${id}/address/edit`}>
                <Button variant="secondary" size="sm">
                  <FaPlus className="mr-1" />
                  Add Address
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaPhone className="mr-2 text-pink-500" />
              Contact Information
            </h3>
            <Link to={`/guests/${id}/contact/new`}>
              <Button variant="secondary" size="sm">
                <FaPlus className="mr-1" />
                Add
              </Button>
            </Link>
          </div>
          {guest.contacts && guest.contacts.length > 0 ? (
            <div className="space-y-3">
              {guest.contacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FaPhone className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      ({contact.areaCode || 'N/A'}) {contact.number || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 mb-3">No contact information available</p>
              <Link to={`/guests/${id}/contact/new`}>
                <Button variant="secondary" size="sm">
                  <FaPlus className="mr-1" />
                  Add Contact
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Document Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaIdCard className="mr-2 text-pink-500" />
              Documents
            </h3>
            <Link to={`/guests/${id}/document/new`}>
              <Button variant="secondary" size="sm">
                <FaPlus className="mr-1" />
                Add
              </Button>
            </Link>
          </div>
          {guest.documents && guest.documents.length > 0 ? (
            <div className="space-y-3">
              {guest.documents.map((document: any) => (
                <div key={document.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-pink-400">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FaIdCard className="text-pink-500 mr-2" />
                        <span className="font-medium text-gray-900">{document.category || 'N/A'}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{document.identifier || 'N/A'}</p>
                      {document.issuedDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Issued: {formatSafeDate(document.issuedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 mb-3">No documents available</p>
              <Link to={`/guests/${id}/document/new`}>
                <Button variant="secondary" size="sm">
                  <FaPlus className="mr-1" />
                  Add Document
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Companions Section - Only for primary guests */}
      {!guest.primaryGuestId && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUserFriends className="mr-2 text-pink-500" />
              Companions
            </h3>
            <Link to={`/guests/${id}/companion/new`}>
              <Button>
                <FaPlus className="mr-2" />
                Add Companion
              </Button>
            </Link>
          </div>
          {guest.companions && guest.companions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guest.companions.map((companion: any) => (
                <div key={companion.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-full">
                        <FaUser className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{companion.fullName || 'N/A'}</h4>
                        {companion.displayName && (
                          <p className="text-sm text-gray-600">{companion.displayName}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Born: {formatSafeDate(companion.birthDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link to={`/guests/${companion.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <FaUserFriends className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No companions registered</p>
              <Link to={`/guests/${id}/companion/new`}>
                <Button>
                  <FaPlus className="mr-2" />
                  Add First Companion
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GuestDetail;