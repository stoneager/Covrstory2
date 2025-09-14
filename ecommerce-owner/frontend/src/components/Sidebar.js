import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBoxes, 
  faLayerGroup, 
  faPercent, 
  faTicketAlt,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // If you have an AuthContext

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: faHome },
    { path: '/products', label: 'Product Management', icon: faBoxes },
    { path: '/collections', label: 'Collections', icon: faLayerGroup },
    { path: '/discounts', label: 'Discounts', icon: faPercent },
    { path: '/coupons', label: 'Coupons', icon: faTicketAlt },
    { path: '/order-tracking', label: 'Order Tracking', icon: faBoxes }
  ];

  const handleLogout = () => {
    // If you use AuthContext
    if (logout) {
      logout();
    } else {
      // Fallback: clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="sidebar flex flex-col h-screen justify-between bg-gray-900 text-white">
      {/* Menu Items */}
      <ul className="sidebar-menu space-y-2 p-4">
        {menuItems.map((item) => (
          <li 
            key={item.path} 
            className={`sidebar-item ${location.pathname === item.path ? 'bg-gray-800 rounded' : ''}`}
          >
            <Link to={item.path} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded">
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
