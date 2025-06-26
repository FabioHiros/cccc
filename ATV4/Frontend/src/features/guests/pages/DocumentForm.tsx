// src/features/guests/pages/DocumentForm.tsx - FIXED FOR BACKEND API
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { clienteService } from '../../../api/services';

const DocumentForm = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    category: 'CPF' as 'CPF' | 'RG' | 'Passaporte',
    identifier: '',
    issuedDate: ''
  });

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        setIsLoading(true);
        const response = await clienteService.getClienteById(id);
        const guestData = response.data.data || response.data;
        setGuest(guestData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching guest:', error);
        setIsLoading(false);
      }
    };

    fetchGuest();
  }, [id]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier.trim()) {
      setErrorMessage('Document number is required');
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      await clienteService.addDocumentoToCliente(id, formData);
      setSubmitStatus('success');
      setTimeout(() => {
        navigate(`/guests/${id}`);
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error adding document. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Document"
        subtitle={`Add document for ${guest?.fullName || 'Guest'}`}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
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
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Document Number *
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter document number"
                required
              />
            </div>

            <div>
              <label htmlFor="issuedDate" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                id="issuedDate"
                name="issuedDate"
                value={formData.issuedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <Alert type="success" message="Document added successfully!" />
          )}
          
          {submitStatus === 'error' && (
            <Alert type="error" message={errorMessage} />
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-pink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/guests/${id}`)}
              disabled={submitStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitStatus === 'loading'}
            >
              {submitStatus === 'loading' ? 'Adding...' : 'Add Document'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DocumentForm;