// src/features/guests/pages/AddressForm.tsx - FIXED FOR BACKEND API
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { clienteService } from '../../../api/services';

const AddressForm = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    street: '',
    district: '',
    city: '',
    region: '',
    country: '',
    postalCode: ''
  });

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        setIsLoading(true);
        const response = await clienteService.getClienteById(id);
        const guestData = response.data.data || response.data;
        setGuest(guestData);
        
        if (guestData.address) {
          setFormData({
            street: guestData.address.street || '',
            district: guestData.address.district || '',
            city: guestData.address.city || '',
            region: guestData.address.region || '',
            country: guestData.address.country || '',
            postalCode: guestData.address.postalCode || ''
          });
        }
        
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
    
    if (!formData.street.trim()) {
      setErrorMessage('Street address is required');
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      await clienteService.updateClienteEndereco(id, formData);
      setSubmitStatus('success');
      setTimeout(() => {
        navigate(`/guests/${id}`);
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error updating address. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Address"
        subtitle={`Update address for ${guest?.fullName || 'Guest'}`}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter street address"
                required
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter district"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter region"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <Alert type="success" message="Address updated successfully!" />
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
              {submitStatus === 'loading' ? 'Updating...' : 'Update Address'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddressForm;