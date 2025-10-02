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
  faSignOutAlt,
  faComments
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
    { path: '/returns', label: 'Returns Management', icon: faUndo },
    { path: '/stories', label: 'Stories Management', icon: faComments }
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
      <div className="logout-section">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
