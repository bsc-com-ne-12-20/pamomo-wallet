import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  const [requiresOtp, setRequiresOtp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only check if the user is authenticated
    if (isAuthenticated) {
      // Check if user has completed OTP verification if required
      const otpVerified = localStorage.getItem('otpVerified') === 'true';
      const pre2faUserId = localStorage.getItem('pre_2fa_user_id');
      
      // If pre_2fa_user_id exists, this user requires OTP verification
      // If otpVerified is true, they've already completed it
      if (pre2faUserId && !otpVerified) {
        setRequiresOtp(true);
      } else {
        setRequiresOtp(false);
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Show nothing while determining authentication state
  if (isLoading) {
    return null; // Or return a loading spinner
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user requires OTP verification and hasn't completed it yet,
  // redirect to OTP verification page
  if (requiresOtp && window.location.pathname !== '/otp-verification') {
    return <Navigate to="/otp-verification" />;
  }

  // User is authenticated and has completed OTP if required
  return <>{children}</>;
};

export default ProtectedRoute;