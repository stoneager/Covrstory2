import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBoxes, 
  faLayerGroup, 
  faPercent, 
  faTicketAlt,
  faUndo,
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
    { path: '/order-tracking', label: 'Order Tracking', icon: faBoxes },
    { path: '/returns', label: 'Returns Management', icon: faUndo }
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
    <div className="sidebar">
      {/* Menu Items */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li 
            key={item.path} 
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <Link to={item.path}>
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="px-6 py-8 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 font-semibold"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
