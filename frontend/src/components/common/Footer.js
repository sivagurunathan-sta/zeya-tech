import React from 'react';
import { Link } from 'react-router-dom';
import { FiLinkedin, FiTwitter, FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {/* ZEYA-TECH Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">Z</span>
                </div>
              </div>
              <span className="font-bold text-xl">ZEYA-TECH</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Building the future through innovative solutions and exceptional teamwork. 
              We're dedicated to creating meaningful impact in everything we do.
            </p>
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="text-gray-300 hover:text-white transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-300 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/family" className="text-gray-300 hover:text-white transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <FiMapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Northern Bank of Coovum River,<br />
                  Egmore, Chennai 600008
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <a
                  href="tel:+919150587418"
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  +91 9150587418
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-gray-400" />
                <a 
                  href="mailto:rctfzzbsiva@gmail.com" 
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  rctfzzbsiva@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 ZEYA-TECH. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button type="button" className="text-gray-400 hover:text-white text-sm transition-colors" aria-label="Privacy Policy">
              Privacy Policy
            </button>
            <button type="button" className="text-gray-400 hover:text-white text-sm transition-colors" aria-label="Terms of Service">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
