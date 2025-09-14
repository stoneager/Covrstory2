import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faTwitter, 
  faInstagram, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = process.env.REACT_APP_COMPANY_NAME || 'STORE';

  return (
    <footer className="bg-black text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight">{companyName}</h3>
              <p className="text-gray-300 leading-relaxed">
                Premium quality clothing designed for the modern lifestyle. 
                Crafted with attention to detail and built to last.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=m" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Men's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=f" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Women's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-200">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Track Your Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  <span className="text-gray-300">support@store.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  <span className="text-gray-300">+91 12345 67890</span>
                </div>
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                  <span className="text-gray-300">
                    123 Fashion Street,<br />
                    Mumbai, India 400001
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
              />
              <button className="bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} {companyName}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;