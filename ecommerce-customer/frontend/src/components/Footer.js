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
    <footer className="footer-enhanced">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="footer-content">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-section space-y-6">
              <h3 className="text-2xl font-black tracking-tight text-white">{companyName}</h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                Premium quality clothing designed for the modern lifestyle. 
                Crafted with attention to detail and built to last.
              </p>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center rounded-lg hover:scale-110"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center rounded-lg hover:scale-110"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center rounded-lg hover:scale-110"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center rounded-lg hover:scale-110"
                >
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <Link to="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=m">
                    Men's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=f">
                    Women's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/orders">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-section">
              <h3>Customer Service</h3>
              <ul>
                <li>
                  <a href="#">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a href="#">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#">
                    Track Your Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3>Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  <span className="text-gray-300">support@store.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  <span className="text-gray-300">+91 12345 67890</span>
                </div>
                <div className="flex items-start space-x-3 text-sm">
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
        <div className="border-t border-gray-800 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:border-white rounded-lg"
              />
              <button className="bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors duration-200 rounded-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm font-medium">
              © {currentYear} {companyName}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">
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