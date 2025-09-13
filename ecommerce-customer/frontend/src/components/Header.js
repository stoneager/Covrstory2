import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLoginRedirect = () => {
    window.location.href = 'http://localhost:3002'; // Login app URL
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              {process.env.REACT_APP_COMPANY_NAME || 'E-Store'}
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            {user && (
              <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                Products
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/cart" 
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemsCount()}
                    </span>
                  )}
                </Link>
                
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faUser} className="text-gray-700" />
                  <span className="text-gray-700">{user.name}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="btn btn-primary"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;