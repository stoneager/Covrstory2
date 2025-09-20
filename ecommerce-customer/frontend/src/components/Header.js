import React, { useState } from 'react';
import { checkoutAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faUser, 
  faSignOutAlt, 
  faBars, 
  faTimes,
  faSearch,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Remove modal state

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleLoginRedirect = () => {
    window.location.href = 'http://localhost:3002';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user ? [
      { to: '/products', label: 'Shop' },
      { to: '/orders', label: 'Orders' },
      { to: '/returns', label: 'Returns' }
    ] : [])
  ];

  return (
    <>
      <header className="header-enhanced">
        <div className="container-custom">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="logo-enhanced">
                {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-enhanced">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link-enhanced"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Icon */}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                <FontAwesomeIcon icon={faSearch} className="text-lg" />
              </button>
              
              {/* Wishlist Icon */}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                <FontAwesomeIcon icon={faHeart} className="text-lg" />
              </button>
              
              {user ? (
                <>
                  {/* Cart */}
                  <Link 
                    to="/cart" 
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faShoppingBag} className="text-xl" />
                    {getCartItemsCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                  
                  {/* User Profile */}
                  <button type="button" onClick={() => navigate('/profile')} className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name}</span>
                  </button>
                  
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoginRedirect}
                  className="btn btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="text-xl font-black text-gray-900">
                {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <nav className="p-6">
              <div className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className="block text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                {user ? (
                  <div className="space-y-6">
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2"
                    >
                      <FontAwesomeIcon icon={faShoppingBag} />
                      <span>Cart ({getCartItemsCount()})</span>
                    </Link>
                    
                    <div className="flex items-center space-x-3 text-lg font-medium text-gray-700 py-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                      </div>
                      <span>{user.name}</span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-200 py-2"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLoginRedirect();
                      closeMobileMenu();
                    }}
                    className="w-full btn btn-primary"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;