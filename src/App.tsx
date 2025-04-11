import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import WithdrawMoney from './pages/WithdrawMoney';
import DepositMoney from './pages/DepositMoney';
import TransactionHistory from './pages/TransactionHistory';
import VerifyIdentity from './pages/VerifyIdentity';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyTransaction from './pages/VerifyTransaction';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/Profilepage';
import Security from './pages/Security'; // Import Security page
import OtpVerification from './pages/OtpVerification';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);

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
        const response = await fetch('http://127.0.0.1:8000/callback/check-verification/', {
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
    const otpVerified = localStorage.getItem('otpVerified');
    if (otpVerified === 'true') {
      setIsOtpVerified(true);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, 20 * 60 * 1000); // 20 minutes
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setUsername('');
      setIsVerified(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      window.location.href = '/login'; // Redirect to login
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initialize the timeout
    handleActivity();

    return () => {
      // Cleanup event listeners and timeout on unmount
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  const handleLogin = (user: string, token: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('email', user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setIsVerified(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    window.location.href = '/login'; // Redirect to login
  };

  const handleVerify = () => {
    setIsVerified(true);
  };

  // Handle OTP Success: update state and localStorage
  const handleOtpSuccess = () => {
    setIsOtpVerified(true);
    localStorage.setItem('otpVerified', 'true');
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
    return true; // Modify as needed
  };

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
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
          path="/send"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SendMoney
                username={username}
                balance={balance}
                isVerified={isVerified} // Pass isVerified
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
                isVerified={isVerified} // Pass isVerified
                onWithdraw={handleWithdraw}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deposit"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DepositMoney username={username} onLogout={handleLogout} />
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
        
        <Route path="/otp-verification"
             element={<OtpVerification 
             handleOtpSuccess={handleOtpSuccess} 
         />} 
         />

        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default App;