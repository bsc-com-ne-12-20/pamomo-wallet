import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';

interface NavbarProps {
  username: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  return (
    <nav className="bg-[#8928A4] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Wallet size={24} />
          <span className="text-xl font-bold">Pamomo</span>
        </Link>
        <div className="flex items-center space-x-4">
          <span>Welcome, {username}</span>
          <button 
            onClick={onLogout} 
            className="flex items-center space-x-1 bg-white text-[#8928A4] px-3 py-1 rounded-md hover:bg-gray-100 transition"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;