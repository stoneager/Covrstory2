import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faUser, 
  faSignOutAlt, 
  faBars, 
  faTimes,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 tracking-wide uppercase"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Link 
                    to="/cart" 
                    className="relative p-2 text-gray-700 hover:text-black transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faShoppingBag} className="text-xl" />
                    {getCartItemsCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                  
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faUser} className="text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-700 hover:text-black transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
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
              className="md:hidden p-2 text-gray-700 hover:text-black transition-colors duration-200"
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="text-xl font-bold text-black">
                {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-700 hover:text-black"
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
                    className="block text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                {user ? (
                  <div className="space-y-6">
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faShoppingBag} />
                      <span>Cart ({getCartItemsCount()})</span>
                    </Link>
                    
                    <div className="flex items-center space-x-3 text-lg font-medium text-gray-700">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{user.name}</span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200"
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