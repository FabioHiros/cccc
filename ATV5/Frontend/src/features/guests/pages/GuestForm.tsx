// src/features/guests/pages/GuestForm.tsx - FIXED FOR BACKEND API
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
    contacts: [
      {
        areaCode: '',
        number: ''
      }
    ],
    // Document Information
    documents: [
      {
        category: 'CPF' as 'CPF' | 'RG' | 'Passaporte',
        identifier: '',
        issuedDate: ''
      }
    ]
  });

  // Keep track of what existed before editing
  const [originalData, setOriginalData] = useState({
    hasAddress: false,
    originalContactCount: 0,
    originalDocumentCount: 0
  });

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
        contacts: existingGuest.contacts && existingGuest.contacts.length > 0 
          ? existingGuest.contacts.map((contact: any) => ({
              areaCode: contact.areaCode || '',
              number: contact.number || ''
            }))
          : [{ areaCode: '', number: '' }],
        documents: existingGuest.documents && existingGuest.documents.length > 0
          ? existingGuest.documents.map((doc: any) => ({
              category: doc.category || 'CPF',
              identifier: doc.identifier || '',
              issuedDate: doc.issuedDate ? doc.issuedDate.split('T')[0] : ''
            }))
          : [{ category: 'CPF' as const, identifier: '', issuedDate: '' }]
      });

      // Track original data structure
      setOriginalData({
        hasAddress: !!existingGuest.address,
        originalContactCount: existingGuest.contacts?.length || 0,
        originalDocumentCount: existingGuest.documents?.length || 0
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
    } else if (name.startsWith('contacts.')) {
      const [, indexStr, field] = name.split('.');
      const index = parseInt(indexStr);
      setFormData(prevData => ({
        ...prevData,
        contacts: prevData.contacts.map((contact, i) => 
          i === index ? { ...contact, [field]: value } : contact
        )
      }));
    } else if (name.startsWith('documents.')) {
      const [, indexStr, field] = name.split('.');
      const index = parseInt(indexStr);
      setFormData(prevData => ({
        ...prevData,
        documents: prevData.documents.map((doc, i) => 
          i === index ? { ...doc, [field]: value } : doc
        )
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const addContact = () => {
    setFormData(prevData => ({
      ...prevData,
      contacts: [...prevData.contacts, { areaCode: '', number: '' }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      contacts: prevData.contacts.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    setFormData(prevData => ({
      ...prevData,
      documents: [...prevData.documents, { category: 'CPF' as const, identifier: '', issuedDate: '' }]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      documents: prevData.documents.filter((_, i) => i !== index)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      if (isEditing && id) {
        // EDITING MODE - Update each section separately
        
        // 1. Update basic guest information
        await clienteService.updateCliente(id, {
          fullName: formData.fullName,
          displayName: formData.displayName,
          birthDate: formData.birthDate
        });
        
        // 2. Update address if it has data
        const hasAddressData = Object.values(formData.address).some(value => value.trim() !== '');
        if (hasAddressData) {
          try {
            await clienteService.updateClienteEndereco(id, formData.address);
          } catch (error) {
            console.warn('Address update failed:', error);
            // Don't fail the whole operation if address update fails
          }
        }
        
        // 3. Handle contacts - only add new contacts that have been modified/added
        for (let i = 0; i < formData.contacts.length; i++) {
          const contact = formData.contacts[i];
          if (contact.areaCode.trim() && contact.number.trim()) {
            if (i >= originalData.originalContactCount) {
              // This is a new contact - add it
              try {
                await clienteService.addTelefoneToCliente(id, {
                  areaCode: contact.areaCode,
                  number: contact.number
                });
              } catch (error) {
                console.warn('Contact add failed:', error);
              }
            } else {
              // This is an existing contact that was modified - add as new contact
              const originalContact = existingGuest.contacts?.[i];
              if (originalContact && 
                  (originalContact.areaCode !== contact.areaCode || originalContact.number !== contact.number)) {
                try {
                  await clienteService.addTelefoneToCliente(id, {
                    areaCode: contact.areaCode,
                    number: contact.number
                  });
                } catch (error) {
                  console.warn('Modified contact add failed:', error);
                }
              }
            }
          }
        }
        
        // 4. Handle documents - only add new documents that have been modified/added
        for (let i = 0; i < formData.documents.length; i++) {
          const document = formData.documents[i];
          if (document.identifier.trim()) {
            if (i >= originalData.originalDocumentCount) {
              // This is a new document - add it
              try {
                await clienteService.addDocumentoToCliente(id, {
                  category: document.category,
                  identifier: document.identifier,
                  issuedDate: document.issuedDate
                });
              } catch (error) {
                console.warn('Document add failed:', error);
              }
            } else {
              // This is an existing document that was modified - add as new document
              const originalDocument = existingGuest.documents?.[i];
              if (originalDocument && 
                  (originalDocument.category !== document.category || 
                   originalDocument.identifier !== document.identifier ||
                   originalDocument.issuedDate?.split('T')[0] !== document.issuedDate)) {
                try {
                  await clienteService.addDocumentoToCliente(id, {
                    category: document.category,
                    identifier: document.identifier,
                    issuedDate: document.issuedDate
                  });
                } catch (error) {
                  console.warn('Modified document add failed:', error);
                }
              }
            }
          }
        }
        
      } else {
        // CREATING MODE - Send all data together
        const createData = {
          fullName: formData.fullName,
          displayName: formData.displayName,
          birthDate: formData.birthDate,
          address: formData.address,
          contact: formData.contacts[0], // First contact for primary creation
          document: {
            category: formData.documents[0].category,
            identifier: formData.documents[0].identifier,
            issuedDate: formData.documents[0].issuedDate
          }
        };
        
        await clienteService.createTitular(createData);
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b-2 border-pink-100">
                Contact Information
              </h3>
              <Button type="button" variant="secondary" onClick={addContact}>
                Add Contact
              </Button>
            </div>

            {formData.contacts.map((contact, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor={`contacts.${index}.areaCode`} className="block text-sm font-medium text-gray-700 mb-2">
                    Area Code
                  </label>
                  <input
                    type="text"
                    id={`contacts.${index}.areaCode`}
                    name={`contacts.${index}.areaCode`}
                    value={contact.areaCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="11"
                    maxLength={3}
                  />
                </div>

                <div>
                  <label htmlFor={`contacts.${index}.number`} className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id={`contacts.${index}.number`}
                    name={`contacts.${index}.number`}
                    value={contact.number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="999999999"
                  />
                </div>

                <div className="flex items-end">
                  {formData.contacts.length > 1 && (
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={() => removeContact(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Document Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b-2 border-pink-100">
                Document Information
              </h3>
              <Button type="button" variant="secondary" onClick={addDocument}>
                Add Document
              </Button>
            </div>

            {formData.documents.map((document, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor={`documents.${index}.category`} className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    id={`documents.${index}.category`}
                    name={`documents.${index}.category`}
                    value={document.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  >
                    <option value="CPF">CPF</option>
                    <option value="RG">RG</option>
                    <option value="Passaporte">Passport</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`documents.${index}.identifier`} className="block text-sm font-medium text-gray-700 mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    id={`documents.${index}.identifier`}
                    name={`documents.${index}.identifier`}
                    value={document.identifier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="Enter document number"
                  />
                </div>

                <div>
                  <label htmlFor={`documents.${index}.issuedDate`} className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    id={`documents.${index}.issuedDate`}
                    name={`documents.${index}.issuedDate`}
                    value={document.issuedDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  />
                </div>

                <div className="flex items-end">
                  {formData.documents.length > 1 && (
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={() => removeDocument(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
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