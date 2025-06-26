// src/features/bookings/pages/BookingForm.tsx - FIXED DATE HANDLING
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card, Button, Alert, Spinner } from '../../../components/ui';
import { estadiaService, clienteService, acomodacaoService } from '../../../api/services';
import type { CreateEstadiaInput, UpdateEstadiaInput } from '../../../types';

const BookingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    titularId: '',
    acomodacaoId: '',
    checkIn: '',
    checkOut: ''
  });

  // Fetch existing booking data if editing
  const { data: bookingResponse, isLoading: loadingBooking } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await estadiaService.getEstadiaById(id);
      return response.data;
    },
    enabled: isEditing
  });

  // Fetch primary guests for dropdown
  const { data: guestsResponse, isLoading: loadingGuests } = useQuery({
    queryKey: ['primaryGuests'],
    queryFn: async () => {
      const response = await clienteService.getAllTitulares();
      return response.data;
    }
  });

  // Fetch rooms for dropdown
  const { data: roomsResponse, isLoading: loadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await acomodacaoService.getAllAcomodacoes();
      return response.data;
    }
  });

  // FIXED: Safe date formatting function
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Date formatting error:', error);
      return '';
    }
  };

  // Extract data safely
  const existingBooking = bookingResponse?.data || bookingResponse;
  const primaryGuests = guestsResponse?.data || guestsResponse || [];
  const rooms = roomsResponse?.data || roomsResponse || [];

  useEffect(() => {
    if (existingBooking && isEditing) {
      setFormData({
        titularId: existingBooking.primaryId || '',
        acomodacaoId: existingBooking.roomId || '',
        checkIn: formatDateForInput(existingBooking.arrivalDate),
        checkOut: formatDateForInput(existingBooking.departDate)
      });
    }
  }, [existingBooking, isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.titularId) {
      setErrorMessage('Please select a primary guest');
      return false;
    }
    if (!formData.acomodacaoId) {
      setErrorMessage('Please select a room');
      return false;
    }
    if (!formData.checkIn) {
      setErrorMessage('Check-in date is required');
      return false;
    }
    if (!formData.checkOut) {
      setErrorMessage('Check-out date is required');
      return false;
    }
    
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      setErrorMessage('Please enter valid dates');
      return false;
    }
    
    if (checkInDate >= checkOutDate) {
      setErrorMessage('Check-out date must be after check-in date');
      return false;
    }
    
    // Check if check-in is not in the past (only for new bookings)
    if (!isEditing && checkInDate < new Date()) {
      setErrorMessage('Check-in date cannot be in the past');
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
        // Update existing booking
        const updateData: UpdateEstadiaInput = {
          acomodacaoId: formData.acomodacaoId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        };
        await estadiaService.updateEstadia(id, updateData);
      } else {
        // Create new booking
        const createData: CreateEstadiaInput = {
          titularId: formData.titularId,
          acomodacaoId: formData.acomodacaoId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        };
        await estadiaService.createEstadia(createData);
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error saving booking. Please try again.');
      console.error('Booking save error:', error);
    }
  };

  // Calculate duration safely
  const calculateDuration = () => {
    if (formData.checkIn && formData.checkOut) {
      try {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          return 0;
        }
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  };

  const duration = calculateDuration();

  if (loadingBooking || loadingGuests || loadingRooms) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Booking' : 'New Booking'}
        subtitle={isEditing ? 'Update booking information' : 'Create a new reservation'}
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Guest Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label htmlFor="titularId" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Guest *
                </label>
                <select
                  id="titularId"
                  name="titularId"
                  value={formData.titularId}
                  onChange={handleInputChange}
                  disabled={isEditing} // Can't change guest for existing booking
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select a primary guest</option>
                  {Array.isArray(primaryGuests) && primaryGuests.map((guest: any) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.fullName || guest.nome} {guest.displayName || guest.nomeSocial ? `(${guest.displayName || guest.nomeSocial})` : ''}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <p className="mt-1 text-sm text-gray-500">
                    Guest cannot be changed for existing bookings
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Room Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label htmlFor="acomodacaoId" className="block text-sm font-medium text-gray-700 mb-2">
                  Room *
                </label>
                <select
                  id="acomodacaoId"
                  name="acomodacaoId"
                  value={formData.acomodacaoId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                >
                  <option value="">Select a room</option>
                  {Array.isArray(rooms) && rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.designation || room.nomeAcomodacao} - 
                      {((room.singleBeds || room.camaSolteiro || 0) + 
                        ((room.doubleBeds || room.camaCasal || 0) * 2))} guests max
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-pink-100">
              Stay Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {duration > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg border-2 border-pink-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">{duration}</p>
                  <p className="text-sm text-gray-600">{duration === 1 ? 'Day' : 'Days'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">14:00</p>
                  <p className="text-sm text-gray-600">Check-in Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">12:00</p>
                  <p className="text-sm text-gray-600">Check-out Time</p>
                </div>
              </div>
              {formData.checkIn && formData.checkOut && (
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-center text-gray-700">
                    <strong>Stay Period:</strong> {new Date(formData.checkIn).toLocaleDateString()} - {new Date(formData.checkOut).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert type="success" message={`Booking ${isEditing ? 'updated' : 'created'} successfully!`} />
          )}
          
          {submitStatus === 'error' && (
            <Alert type="error" message={errorMessage} />
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-pink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/bookings')}
              disabled={submitStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="min-w-[120px]"
            >
              {submitStatus === 'loading' ? 'Saving...' : (isEditing ? 'Update Booking' : 'Create Booking')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookingForm;