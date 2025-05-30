import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import WithdrawMoney from './pages/WithdrawMoney';
import DepositMoney from './pages/DepositMoney';
import ExternalWalletTransfer from './pages/ExternalWalletTransfer';
import TransactionHistory from './pages/TransactionHistory';
import VerifyIdentity from './pages/VerifyIdentity';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyTransaction from './pages/VerifyTransaction';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/Profilepage';
import Security from './pages/Security';
import OtpVerification from './pages/OtpVerification';
import Subscription from './pages/Subscription';
import TransferComplete from './pages/TransferComplete';
import AutoPayments from './pages/AutoPayments';
import BillPayment from './pages/BillPayment';
import FinancialSupport from './pages/FinancialSupport';

// Layout wrapper component to handle proper padding
const MainLayout: React.FC<{ children: React.ReactNode, isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const hideNavbarPages = ['/login', '/register', '/forgot-password', '/reset-password', '/otp-verification'];
  const shouldShowNavbar = isAuthenticated && !hideNavbarPages.includes(location.pathname);
  
  return (
    <div className={`min-h-screen bg-white ${shouldShowNavbar ? 'pt-16' : ''}`}>
      {children}
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('authToken') || localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(
    localStorage.getItem('otpVerified') === 'true'
  );

  useEffect(() => {
    const checkAuthStatus = () => {
      const hasAuthToken = !!localStorage.getItem('authToken');
      if (hasAuthToken !== isAuthenticated) {
        setIsAuthenticated(hasAuthToken);
      }
    };
    
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Failed to fetch balance');

        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchUsername = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-username/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Failed to fetch username');

        const data = await response.json();
        setUsername(data.username);
        localStorage.setItem('username', data.username);
      } catch (error) {
        console.error(error);
      }
    };

    const checkVerification = async (email: string) => {
      try {
        const response = await fetch('https://mtima.onrender.com/callback/check-verification/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Failed to check verification status');

        const data = await response.json();
        setIsVerified(data.is_verified);
      } catch (error) {
        console.error('Verification check failed:', error);
      }
    };

    if (isAuthenticated) {
      fetchBalance();
      fetchUsername();
      const email = localStorage.getItem('email');
      if (email) {
        checkVerification(email);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setUsername('');
      setIsVerified(false);
      setIsOtpVerified(false);
      
      // Clear all authentication data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      localStorage.removeItem('otpVerified');
      localStorage.removeItem('isAuthenticated');
      
      // Clear all OTP-related cache data
      clearOtpCache();
      
      window.location.href = '/login'; // Redirect to login
    };

    if (isAuthenticated) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keypress', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('scroll', handleActivity);

      handleActivity();

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keypress', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    }
  }, [isAuthenticated]);
  // Utility function to clear all OTP/2FA related caches
  const clearOtpCache = () => {
    // Clear all 2FA/OTP related data from localStorage
    localStorage.removeItem('is2FAEnabled');
    localStorage.removeItem('pre_2fa_user_id');
    localStorage.removeItem('otpVerified');
    
    // Also clear from sessionStorage
    sessionStorage.removeItem('is2FAEnabled');
    sessionStorage.removeItem('pre_2fa_user_id');
    sessionStorage.removeItem('otpVerified');
    
    // Clear any cookies that might be related to OTP
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  const handleLogin = (user: string, token: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('email', user);
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setIsVerified(false);
    setIsOtpVerified(false);
    
    // Clear all authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('otpVerified');
    localStorage.removeItem('isAuthenticated');
    
    // Clear all OTP-related cache data
    clearOtpCache();
    
    window.location.href = '/login'; // Redirect to login
  };

  const handleVerify = () => {
    setIsVerified(true);
  };
  const handleOtpSuccess = () => {
    setIsOtpVerified(true);
    setIsAuthenticated(true);
    
    // Use sessionStorage for OTP verification to prevent persistent caching issues
    // This ensures OTP verification state is cleared when browser is closed
    sessionStorage.setItem('otpVerified', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    
    // Since OTP was successfully verified, 2FA must be enabled
    // Ensure this is reflected in both storage mechanisms
    localStorage.setItem('is2FAEnabled', 'true');
    sessionStorage.setItem('is2FAEnabled', 'true');
  };

  const handleSendMoney = (receiver: string, amount: number) => {
    if (!isVerified || amount > balance) return false;
    setBalance(prev => prev - amount);
    setTransactions(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'debit',
        amount,
        date: new Date().toLocaleDateString(),
        description: `Sent to ${receiver}`,
      },
    ]);
    return true;
  };

  const handleWithdraw = (amount: number, code: string) => {
    if (!isVerified || amount > balance || code !== '1234') return false;
    setBalance(prev => prev - amount);
    setTransactions(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'debit',
        amount,
        date: new Date().toLocaleDateString(),
        description: 'Withdrawal',
      },
    ]);
    return true;
  };

  const handleRegister = (username: string, email: string, phone: string, password: string) => {
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    return true;
  };

  return (
    <>
      <MainLayout isAuthenticated={isAuthenticated}>
        <div className="w-full h-full overflow-y-auto">          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
            />
            
            <Route
              path="/otp-fix"
              element={<Navigate to="/otp-fix.html" />}
            />

            <Route path="/register" element={<Register onRegister={handleRegister} />} />

            <Route
              path="/verify"
              element={<VerifyIdentity username={username} onLogout={handleLogout} onVerify={handleVerify} />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard username={username} balance={balance} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
            path="/subscription"
            element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Subscription username={username} onLogout={handleLogout} />
              </ProtectedRoute>
              }
            />  

            <Route
              path="/send"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <SendMoney
                    username={username}
                    balance={balance}
                    isVerified={isVerified}
                    onSend={handleSendMoney}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/withdraw"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <WithdrawMoney
                    username={username}
                    balance={balance}
                    isVerified={isVerified}
                    onWithdraw={handleWithdraw}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />            <Route
              path="/deposit"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DepositMoney username={username} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />            <Route
              path="/external-transfer"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ExternalWalletTransfer onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verifytrans"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <VerifyTransaction username={username} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TransactionHistory username={username} transactions={transactions} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProfilePage username={username} transactions={transactions} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/security"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Security />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/otp-verification"
              element={
                <OtpVerification handleOtpSuccess={handleOtpSuccess} />
              } 
            />

            <Route 
              path="/transfer/complete" 
              element={
                <ProtectedRoute isVerified={isVerified}>
                  <TransferComplete username={username} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            <Route path="/auto-payments" element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isVerified={isVerified}>
                <AutoPayments username={username} onLogout={handleLogout} />
              </ProtectedRoute>
            } />            <Route path="/bill-payment" element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isVerified={isVerified}>
                <BillPayment username={username} onLogout={handleLogout} />
              </ProtectedRoute>
            } />

            <Route path="/financial-support" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <FinancialSupport username={username} onLogout={handleLogout} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />          </Routes>
        </div>      </MainLayout>
    </>
  );
};

export default App;