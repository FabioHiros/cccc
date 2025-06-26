// src/features/guests/pages/CompanionForm.tsx - FIXED TO INHERIT PRIMARY GUEST DATA
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { clienteService } from '../../../api/services';

const CompanionForm = () => {
  const { id: primaryGuestId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [primaryGuest, setPrimaryGuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    nomeSocial: '',
    dataNascimento: '',
    documento: {
      tipo: 'CPF' as 'CPF' | 'RG' | 'Passaporte',
      numero: '',
      dataExpedicao: ''
    }
  });

  useEffect(() => {
    const fetchPrimaryGuest = async () => {
      try {
        setIsLoading(true);
        const response = await clienteService.getClienteById(primaryGuestId);
        const guestData = response.data.data || response.data;
        setPrimaryGuest(guestData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching primary guest:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    if (primaryGuestId) {
      fetchPrimaryGuest();
    }
  }, [primaryGuestId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [section]: {
          ...prevData[section as keyof typeof prevData] as any,
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
    if (!formData.nome.trim()) {
      setErrorMessage('Name is required');
      return false;
    }
    if (!formData.dataNascimento) {
      setErrorMessage('Birth date is required');
      return false;
    }
    if (!formData.documento.numero.trim()) {
      setErrorMessage('Document number is required');
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
      // Create companion using the proper companion endpoint
      const companionData = {
        nome: formData.nome,
        nomeSocial: formData.nomeSocial,
        dataNascimento: formData.dataNascimento,
        documento: {
          tipo: formData.documento.tipo,
          numero: formData.documento.numero,
          dataExpedicao: formData.documento.dataExpedicao
        }
      };

      // Use the createDependente method which properly sets primaryGuestId
      await clienteService.createDependente(primaryGuestId, companionData);
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate(`/guests/${primaryGuestId}`);
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error creating companion. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert 
        type="error" 
        message="Error loading primary guest information. Please try again." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Companion"
        subtitle={`Adding companion for ${primaryGuest?.fullName || 'Unknown Guest'}`}
      />

      {/* Primary Guest Info with Inherited Data Preview */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-pink-500 rounded-full">
            <span className="text-white text-xl font-bold">👤</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Primary Guest</h3>
            <p className="text-gray-600">{primaryGuest?.fullName}</p>
            {primaryGuest?.displayName && (
              <p className="text-gray-500 text-sm">Display Name: {primaryGuest.displayName}</p>
            )}
          </div>
        </div>

        {/* Show what will be inherited */}
        <div className="bg-white p-4 rounded-lg border border-pink-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">🔗 Data that will be inherited by the companion:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Address */}
            <div>
              <p className="font-medium text-gray-600 mb-1">📍 Address:</p>
              {primaryGuest?.address ? (
                <div className="text-gray-500">
                  <p>{primaryGuest.address.street}</p>
                  <p>{primaryGuest.address.city}, {primaryGuest.address.region}</p>
                  <p>{primaryGuest.address.country} - {primaryGuest.address.postalCode}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">No address to inherit</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <p className="font-medium text-gray-600 mb-1">📞 Contact:</p>
              {primaryGuest?.contacts?.[0] ? (
                <p className="text-gray-500">
                  ({primaryGuest.contacts[0].areaCode}) {primaryGuest.contacts[0].number}
                </p>
              ) : (
                <p className="text-gray-400 italic">No contact to inherit</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Companion Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter companion's full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="nomeSocial" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="nomeSocial"
                  name="nomeSocial"
                  value={formData.nomeSocial}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter display name (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date *
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
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
                <label htmlFor="documento.tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  id="documento.tipo"
                  name="documento.tipo"
                  value={formData.documento.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                >
                  <option value="CPF">CPF</option>
                  <option value="RG">RG</option>
                  <option value="Passaporte">Passport</option>
                </select>
              </div>

              <div>
                <label htmlFor="documento.numero" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number *
                </label>
                <input
                  type="text"
                  id="documento.numero"
                  name="documento.numero"
                  value={formData.documento.numero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter document number"
                  required
                />
              </div>

              <div>
                <label htmlFor="documento.dataExpedicao" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="documento.dataExpedicao"
                  name="documento.dataExpedicao"
                  value={formData.documento.dataExpedicao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Note about inherited data */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-500 text-xl mr-3">ℹ️</span>
              <div>
                <p className="text-blue-800 font-medium mb-1">Automatic Data Inheritance</p>
                <p className="text-blue-700 text-sm">
                  This companion will automatically inherit the address and contact information from the primary guest. 
                  Only the personal information and document details need to be provided.
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert type="success" message="Companion added successfully!" />
          )}
          
          {submitStatus === 'error' && (
            <Alert type="error" message={errorMessage} />
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-pink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/guests/${primaryGuestId}`)}
              disabled={submitStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="min-w-[120px]"
            >
              {submitStatus === 'loading' ? 'Adding...' : 'Add Companion'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanionForm;