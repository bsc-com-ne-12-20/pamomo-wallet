// components/BottomNavbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavbarProps {
  isAuthenticated: boolean;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  
  // Don't show navbar on login, register, forgot password, reset password, and OTP verification pages
  const hideNavbarPages = ['/login', '/register', '/forgot-password', '/reset-password', '/otp-verification'];
  
  if (!isAuthenticated || hideNavbarPages.includes(location.pathname)) {
    return null;
  }

  // Define the active color for the selected tab
  const activeColor = '#a33bb8';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-lg z-50">
      <Link 
        to="/dashboard" 
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ color: location.pathname === '/dashboard' ? activeColor : '#6b7280' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        to="/send" 
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ color: location.pathname === '/send' ? activeColor : '#6b7280' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="text-xs mt-1">Send</span>
      </Link>
      
      <Link 
        to="/deposit" 
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ color: location.pathname === '/deposit' ? activeColor : '#6b7280' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-xs mt-1">Deposit</span>
      </Link>
      
      <Link 
        to="/withdraw" 
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ color: location.pathname === '/withdraw' ? activeColor : '#6b7280' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-xs mt-1">Withdraw</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;