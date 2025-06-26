// src/components/layout/Navbar.tsx - UPDATED WITH ATLANTIS BRANDING
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHotel } from 'react-icons/fa';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-pink-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg group-hover:from-pink-600 group-hover:to-pink-700 transition-all duration-200">
                <FaHotel className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                Atlantis
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          {/* <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/guests" 
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-pink-50"
            >
              Guests
            </Link>
            <Link 
              to="/rooms" 
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-pink-50"
            >
              Rooms
            </Link>
            <Link 
              to="/bookings" 
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-pink-50"
            >
              Bookings
            </Link>
          </div> */}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-pink-600 focus:outline-none focus:text-pink-600 p-2 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/guests"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition-colors duration-200"
            >
              Guests
            </Link>
            <Link
              to="/rooms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition-colors duration-200"
            >
              Rooms
            </Link>
            <Link
              to="/bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition-colors duration-200"
            >
              Bookings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;