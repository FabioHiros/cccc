// src/features/guests/pages/GuestForm.tsx - FIXED EDIT LOGIC
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { clienteService } from '../../../api/services';

const GuestForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    displayName: '',
    birthDate: '',
    // Address Information
    address: {
      street: '',
      district: '',
      city: '',
      region: '',
      country: '',
      postalCode: ''
    },
    // Contact Information
    contact: {
      areaCode: '',
      number: ''
    },
    // Document Information
    document: {
      category: 'CPF' as 'CPF' | 'RG' | 'Passaporte',
      identifier: '',
      issuedDate: ''
    }
  });

  // Track original data to prevent duplicates
  const [originalData, setOriginalData] = useState<any>(null);

  // Fetch existing guest data if editing
  const { data: response, isLoading } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await clienteService.getClienteById(id);
      return response.data;
    },
    enabled: isEditing
  });

  const existingGuest = response?.data || response;

  useEffect(() => {
    if (existingGuest && isEditing) {
      // Store original data to compare changes
      setOriginalData(existingGuest);
      
      setFormData({
        fullName: existingGuest.fullName || '',
        displayName: existingGuest.displayName || '',
        birthDate: existingGuest.birthDate ? existingGuest.birthDate.split('T')[0] : '',
        address: {
          street: existingGuest.address?.street || '',
          district: existingGuest.address?.district || '',
          city: existingGuest.address?.city || '',
          region: existingGuest.address?.region || '',
          country: existingGuest.address?.country || '',
          postalCode: existingGuest.address?.postalCode || ''
        },
        contact: {
          areaCode: existingGuest.contacts?.[0]?.areaCode || '',
          number: existingGuest.contacts?.[0]?.number || ''
        },
        document: {
          category: existingGuest.documents?.[0]?.category || 'CPF',
          identifier: existingGuest.documents?.[0]?.identifier || '',
          issuedDate: existingGuest.documents?.[0]?.issuedDate ? existingGuest.documents[0].issuedDate.split('T')[0] : ''
        }
      });
    }
  }, [existingGuest, isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        address: {
          ...prevData.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        contact: {
          ...prevData.contact,
          [field]: value
        }
      }));
    } else if (name.startsWith('document.')) {
      const field = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        document: {
          ...prevData.document,
          [field]: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required');
      return false;
    }
    if (!formData.birthDate) {
      setErrorMessage('Birth date is required');
      return false;
    }
    return true;
  };

  // Helper function to check if data has changed
  const hasDataChanged = (newData: any, originalData: any): boolean => {
    return JSON.stringify(newData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      if (isEditing && id && originalData) {
        // EDITING MODE - Only update what has changed
        
        // 1. Always update basic guest information
        await clienteService.updateCliente(id, {
          fullName: formData.fullName,
          displayName: formData.displayName,
          birthDate: formData.birthDate
        });

        // 2. Only update address if it has changed and has data
        const addressChanged = hasDataChanged(formData.address, {
          street: originalData.address?.street || '',
          district: originalData.address?.district || '',
          city: originalData.address?.city || '',
          region: originalData.address?.region || '',
          country: originalData.address?.country || '',
          postalCode: originalData.address?.postalCode || ''
        });

        if (addressChanged && Object.values(formData.address).some(value => value.trim() !== '')) {
          try {
            await clienteService.updateClienteEndereco(id, formData.address);
          } catch (error) {
            console.warn('Address update failed:', error);
          }
        }

        // 3. Only add contact if it's new/changed and has data
        const originalContact = {
          areaCode: originalData.contacts?.[0]?.areaCode || '',
          number: originalData.contacts?.[0]?.number || ''
        };
        
        const contactChanged = hasDataChanged(formData.contact, originalContact);
        
        if (contactChanged && formData.contact.areaCode.trim() && formData.contact.number.trim()) {
          try {
            await clienteService.addTelefoneToCliente(id, formData.contact);
          } catch (error) {
            console.warn('Contact add failed:', error);
          }
        }

        // 4. Only add document if it's new/changed and has data
        const originalDocument = {
          category: originalData.documents?.[0]?.category || 'CPF',
          identifier: originalData.documents?.[0]?.identifier || '',
          issuedDate: originalData.documents?.[0]?.issuedDate ? originalData.documents[0].issuedDate.split('T')[0] : ''
        };
        
        const documentChanged = hasDataChanged(formData.document, originalDocument);
        
        if (documentChanged && formData.document.identifier.trim()) {
          try {
            await clienteService.addDocumentoToCliente(id, formData.document);
          } catch (error) {
            console.warn('Document add failed:', error);
          }
        }
        
      } else {
        // CREATING MODE - Send all data together
        await clienteService.createTitular({
          fullName: formData.fullName,
          displayName: formData.displayName,
          birthDate: formData.birthDate,
          address: Object.values(formData.address).some(value => value.trim()) ? formData.address : undefined,
          contact: (formData.contact.areaCode.trim() && formData.contact.number.trim()) ? formData.contact : undefined,
          document: formData.document.identifier.trim() ? formData.document : undefined
        });
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/guests');
      }, 1500);
      
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error saving guest. Please try again.');
      console.error('Save error:', error);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Guest' : 'Add New Guest'}
        subtitle={isEditing ? 'Update guest information' : 'Create a new guest profile'}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter display name (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date *
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label htmlFor="address.district" className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  id="address.district"
                  name="address.district"
                  value={formData.address.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="address.region" className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  id="address.region"
                  name="address.region"
                  value={formData.address.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter region"
                />
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact.areaCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Area Code
                </label>
                <input
                  type="text"
                  id="contact.areaCode"
                  name="contact.areaCode"
                  value={formData.contact.areaCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="11"
                  maxLength={3}
                />
              </div>

              <div>
                <label htmlFor="contact.number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="contact.number"
                  name="contact.number"
                  value={formData.contact.number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="999999999"
                />
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Document Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="document.category" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  id="document.category"
                  name="document.category"
                  value={formData.document.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                >
                  <option value="CPF">CPF</option>
                  <option value="RG">RG</option>
                  <option value="Passaporte">Passport</option>
                </select>
              </div>

              <div>
                <label htmlFor="document.identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  id="document.identifier"
                  name="document.identifier"
                  value={formData.document.identifier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter document number"
                />
              </div>

              <div>
                <label htmlFor="document.issuedDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="document.issuedDate"
                  name="document.issuedDate"
                  value={formData.document.issuedDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert type="success" message={`Guest ${isEditing ? 'updated' : 'created'} successfully!`} />
          )}
          
          {submitStatus === 'error' && (
            <Alert type="error" message={errorMessage} />
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-pink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/guests')}
              disabled={submitStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="min-w-[120px]"
            >
              {submitStatus === 'loading' ? 'Saving...' : (isEditing ? 'Update Guest' : 'Create Guest')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GuestForm;