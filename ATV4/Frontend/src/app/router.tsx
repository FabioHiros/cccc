// src/app/router.tsx 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';


import { Dashboard } from '../features/dashboard';
import { 
  GuestsList, 
  GuestDetail, 
  GuestForm, 
  CompanionForm, 
  AddressForm, 
  DocumentForm, 
  ContactForm 
} from '../features/guests';
import { 
  RoomsList, 
  RoomDetail, 
  RoomForm 
} from '../features/rooms';
import { 
  BookingsList, 
  BookingDetail, 
  BookingForm 
} from '../features/bookings';

// NotFound component
const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Guest Management Routes */}
          <Route path="guests">
            <Route index element={<GuestsList />} />
            <Route path="new" element={<GuestForm />} />
            <Route path=":id" element={<GuestDetail />} />
            <Route path=":id/edit" element={<GuestForm />} />
            <Route path=":id/companion/new" element={<CompanionForm />} />
            <Route path=":id/address/edit" element={<AddressForm />} />
            <Route path=":id/document/new" element={<DocumentForm />} />
            <Route path=":id/contact/new" element={<ContactForm />} />
          </Route>
          
          {/* Room Management Routes */}
          <Route path="rooms">
            <Route index element={<RoomsList />} />
            <Route path="new" element={<RoomForm />} />
            <Route path=":id" element={<RoomDetail />} />
            <Route path=":id/edit" element={<RoomForm />} />
          </Route>
          
          {/* Booking Management Routes */}
          <Route path="bookings">
            <Route index element={<BookingsList />} />
            <Route path="new" element={<BookingForm />} />
            <Route path=":id" element={<BookingDetail />} />
            <Route path=":id/edit" element={<BookingForm />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;