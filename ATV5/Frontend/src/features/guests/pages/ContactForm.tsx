// src/features/guests/pages/ContactForm.tsx - FIXED FOR BACKEND API
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { clienteService } from '../../../api/services';

const ContactForm = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    areaCode: '',
    number: ''
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.areaCode.trim() || !formData.number.trim()) {
      setErrorMessage('Both area code and phone number are required');
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      await clienteService.addTelefoneToCliente(id, formData);
      setSubmitStatus('success');
      setTimeout(() => {
        navigate(`/guests/${id}`);
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error adding contact. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Contact"
        subtitle={`Add phone number for ${guest?.fullName || 'Guest'}`}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="areaCode" className="block text-sm font-medium text-gray-700 mb-2">
                Area Code *
              </label>
              <input
                type="text"
                id="areaCode"
                name="areaCode"
                value={formData.areaCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="11"
                maxLength={3}
                required
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="999999999"
                required
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <Alert type="success" message="Contact added successfully!" />
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
              {submitStatus === 'loading' ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ContactForm;