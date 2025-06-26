// src/features/rooms/pages/RoomForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { acomodacaoService } from '../../../api/services';
import type { CreateAcomodacaoInput, UpdateAcomodacaoInput } from '../../../types';

const RoomForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    nomeAcomodacao: '',
    camaSolteiro: 0,
    camaCasal: 0,
    suite: 0,
    climatizacao: false,
    garagem: 0
  });

  // Fetch existing room data if editing
  const { data: existingRoom, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await acomodacaoService.getAcomodacaoById(id);
      return response.data;
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (existingRoom && isEditing) {
      setFormData({
        nomeAcomodacao: existingRoom.nomeAcomodacao || existingRoom.designation || '',
        camaSolteiro: existingRoom.camaSolteiro || existingRoom.singleBeds || 0,
        camaCasal: existingRoom.camaCasal || existingRoom.doubleBeds || 0,
        suite: existingRoom.suite || existingRoom.bathrooms || 0,
        climatizacao: existingRoom.climatizacao || existingRoom.hasAirControl || false,
        garagem: existingRoom.garagem || existingRoom.parkingSpaces || 0
      });
    }
  }, [existingRoom, isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const validateForm = () => {
    if (!formData.nomeAcomodacao.trim()) {
      setErrorMessage('Room name is required');
      return false;
    }
    if (formData.camaSolteiro < 0 || formData.camaCasal < 0 || formData.suite < 0 || formData.garagem < 0) {
      setErrorMessage('Values cannot be negative');
      return false;
    }
    if (formData.camaSolteiro === 0 && formData.camaCasal === 0) {
      setErrorMessage('Room must have at least one bed');
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
        // Update existing room
        const updateData: UpdateAcomodacaoInput = formData;
        await acomodacaoService.updateAcomodacao(id, updateData);
      } else {
        // Create new room
        const createData: CreateAcomodacaoInput = formData;
        await acomodacaoService.createCustomAcomodacao(createData);
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/rooms');
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error saving room. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Room' : 'Add New Room'}
        subtitle={isEditing ? 'Update room information and amenities' : 'Create a new room with custom settings'}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="nomeAcomodacao" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="nomeAcomodacao"
                  name="nomeAcomodacao"
                  value={formData.nomeAcomodacao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="Enter room name (e.g., Deluxe Suite, Standard Room)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bed Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Bed Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="camaSolteiro" className="block text-sm font-medium text-gray-700 mb-2">
                  Single Beds
                </label>
                <input
                  type="number"
                  id="camaSolteiro"
                  name="camaSolteiro"
                  value={formData.camaSolteiro}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="camaCasal" className="block text-sm font-medium text-gray-700 mb-2">
                  Double Beds
                </label>
                <input
                  type="number"
                  id="camaCasal"
                  name="camaCasal"
                  value={formData.camaCasal}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700">
                <strong>Capacity:</strong> {formData.camaSolteiro + (formData.camaCasal * 2)} guests maximum
              </p>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Facilities & Amenities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="suite" className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="suite"
                  name="suite"
                  value={formData.suite}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="garagem" className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  id="garagem"
                  name="garagem"
                  value={formData.garagem}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="climatizacao"
                    name="climatizacao"
                    checked={formData.climatizacao}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-pink-600 border-2 border-pink-200 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  <label htmlFor="climatizacao" className="ml-3 block text-sm font-medium text-gray-700">
                    Air Conditioning Available
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Check this box if the room has air conditioning
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg border-2 border-pink-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Room Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formData.camaSolteiro + formData.camaCasal}
                </p>
                <p className="text-sm text-gray-600">Total Beds</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formData.camaSolteiro + (formData.camaCasal * 2)}
                </p>
                <p className="text-sm text-gray-600">Max Guests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formData.suite}
                </p>
                <p className="text-sm text-gray-600">Bathrooms</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formData.climatizacao ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600">A/C</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert type="success" message={`Room ${isEditing ? 'updated' : 'created'} successfully!`} />
          )}
          
          {submitStatus === 'error' && (
            <Alert type="error" message={errorMessage} />
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-pink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/rooms')}
              disabled={submitStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="min-w-[120px]"
            >
              {submitStatus === 'loading' ? 'Saving...' : (isEditing ? 'Update Room' : 'Create Room')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RoomForm;