// src/components/layout/Sidebar.tsx - FIXED NESTED LINK ISSUE
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBed, 
  FaCalendarAlt, 
  FaPlus
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: FaTachometerAlt,
      current: location.pathname === '/',
    },
    {
      name: 'Guests',
      href: '/guests',
      icon: FaUsers,
      current: location.pathname.startsWith('/guests'),
      addLink: '/guests/new'
    },
    {
      name: 'Rooms',
      href: '/rooms',
      icon: FaBed,
      current: location.pathname.startsWith('/rooms'),
      addLink: '/rooms/new'
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: FaCalendarAlt,
      current: location.pathname.startsWith('/bookings'),
      addLink: '/bookings/new'
    },
  ];

  const handleQuickAdd = (e: React.MouseEvent, addLink: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(addLink);
  };

  return (
    <aside className="fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-64 bg-white shadow-xl border-r-2 border-pink-100 z-40 overflow-y-auto transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <div key={item.name} className="space-y-1">
              {/* Main navigation item */}
              <div
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  item.current
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                }`}
                onClick={() => navigate(item.href)}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'
                    }`}
                  />
                  {item.name}
                </div>
                
                {/* Quick add button for non-dashboard items */}
                {item.addLink && (
                  <button
                    onClick={(e) => handleQuickAdd(e, item.addLink)}
                    className={`p-1 rounded-md transition-all duration-200 ${
                      item.current 
                        ? 'text-white hover:bg-white hover:bg-opacity-20' 
                        : 'text-gray-400 hover:text-pink-500 hover:bg-pink-100'
                    }`}
                    aria-label={`Add new ${item.name.toLowerCase()}`}
                  >
                    <FaPlus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Actions Section */}
        {/* <div className="mt-8 pt-6 border-t border-pink-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              to="/guests/new"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
            >
              <FaPlus className="mr-2 h-3 w-3" />
              New Guest
            </Link>
            <Link
              to="/bookings/new"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
            >
              <FaPlus className="mr-2 h-3 w-3" />
              New Booking
            </Link>
          </div>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;