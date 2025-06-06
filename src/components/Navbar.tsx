import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LogOut, Menu, User, Shield, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#8928A4] text-white p-4 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Wallet size={24} />
            <span className="text-xl font-bold">Pamomo</span>
          </Link>          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 bg-white text-[#8928A4] px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                <Menu size={20} />
                <span>Menu</span>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-[#8928A4] rounded-lg shadow-lg z-40">
                  <ul className="py-2">
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/security"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                      >
                        <Shield size={16} />
                        <span>Security & Privacy</span>
                      </Link>
                    </li>                    <li>
                      <button
                        onClick={() => navigate('/financial-support')}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                      >
                        <MessageSquare size={16} />
                        <span>Customer Support</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;