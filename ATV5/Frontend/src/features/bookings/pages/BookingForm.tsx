// src/features/bookings/pages/BookingForm.tsx - COMPLETE FIXED VERSION
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

  // Helper function to format dates safely
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Get local date in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Date formatting error:', error);
      return '';
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // Extract data safely
  const existingBooking = bookingResponse?.data || bookingResponse;
  const primaryGuests = guestsResponse?.data || guestsResponse || [];
  const rooms = roomsResponse?.data || roomsResponse || [];

  useEffect(() => {
    if (existingBooking && isEditing) {
      console.log('📋 Loading existing booking:', existingBooking);
      
      setFormData({
        titularId: existingBooking.primaryId || existingBooking.titularId || '',
        acomodacaoId: existingBooking.roomId || existingBooking.acomodacaoId || '',
        checkIn: formatDateForInput(existingBooking.arrivalDate || existingBooking.checkIn),
        checkOut: formatDateForInput(existingBooking.departDate || existingBooking.checkOut)
      });
    }
  }, [existingBooking, isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    
    console.log(`📝 Form field changed: ${name} = ${value}`);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    console.log('🔍 Validating form:', formData);
    
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
    
    const checkInDate = new Date(formData.checkIn + 'T00:00:00');
    const checkOutDate = new Date(formData.checkOut + 'T00:00:00');
    
    console.log('📅 Date validation:', {
      checkInString: formData.checkIn,
      checkOutString: formData.checkOut,
      checkInDate,
      checkOutDate,
      checkInTime: checkInDate.getTime(),
      checkOutTime: checkOutDate.getTime()
    });
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      setErrorMessage('Please enter valid dates');
      return false;
    }
    
    if (checkInDate >= checkOutDate) {
      setErrorMessage('Check-out date must be after check-in date');
      return false;
    }
    
    // Only check for past dates if creating new booking
    if (!isEditing) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        setErrorMessage('Check-in date cannot be in the past');
        return false;
      }
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting form submission');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setErrorMessage('');
    
    try {
      if (isEditing && id) {
        console.log('📝 Updating existing booking...');
        
        // Update existing booking
        const updateData: UpdateEstadiaInput = {
          acomodacaoId: formData.acomodacaoId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        };
        
        console.log('📤 Sending update data:', updateData);
        await estadiaService.updateEstadia(id, updateData);
        console.log('✅ Booking updated successfully');
      } else {
        console.log('➕ Creating new booking...');
        
        // Create new booking
        const createData: CreateEstadiaInput = {
          titularId: formData.titularId,
          acomodacaoId: formData.acomodacaoId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        };
        
        console.log('📤 Sending create data:', createData);
        await estadiaService.createEstadia(createData);
        console.log('✅ Booking created successfully');
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Booking save error:', error);
      
      setSubmitStatus('error');
      
      // Extract error message from response
      let errorMsg = 'Error saving booking. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    }
  };

  // Calculate duration safely
  const calculateDuration = () => {
    if (formData.checkIn && formData.checkOut) {
      try {
        const checkInDate = new Date(formData.checkIn + 'T00:00:00');
        const checkOutDate = new Date(formData.checkOut + 'T00:00:00');
        
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          return 0;
        }
        
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
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

  const todayDate = getTodayDate();

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
                  min={isEditing ? undefined : todayDate}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {isEditing ? 'Edit mode: past dates allowed' : `Minimum date: ${todayDate}`}
                </p>
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
                  min={formData.checkIn || todayDate}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be after check-in date
                </p>
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
                    <strong>Stay Period:</strong> {formData.checkIn} to {formData.checkOut}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Debug Information (remove in production) */}
          <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
            <h5 className="font-semibold mb-2">Debug Info:</h5>
            <p><strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}</p>
            <p><strong>Today:</strong> {todayDate}</p>
            <p><strong>Duration:</strong> {duration} days</p>
            <p><strong>Is Editing:</strong> {isEditing ? 'Yes' : 'No'}</p>
          </div>

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