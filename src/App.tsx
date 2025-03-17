import React, { useState } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(5000); // Default balance
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', amount: 2500, date: '2025-04-01', description: 'Initial deposit' },
    { id: 2, type: 'credit', amount: 1500, date: '2025-04-02', description: 'Salary' },
    { id: 3, type: 'debit', amount: 500, date: '2025-04-03', description: 'Withdrawal' },
    { id: 4, type: 'debit', amount: 500, date: '2025-04-04', description: 'Sent to john@example.com' },
  ]);

  const handleLogin = (user: string, token: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('authToken', token); // Store token for persistence
  };
  
  const handleRegister = (name: string, email: string, phone: string, password: string) => {
    // In a real application, this would make an API call to create the user
    console.log('Registering user:', { name, email, phone });
    return true;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setIsVerified(false);
  };

  const handleVerify = () => {
    setIsVerified(true);
  };

  const handleSendMoney = (receiver: string, amount: number) => {
    if (!isVerified) {
      return false;
    }
    if (amount <= balance) {
      setBalance(prevBalance => prevBalance - amount);
      setTransactions(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'debit',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          description: `Sent to ${receiver}`
        }
      ]);
      return true;
    }
    return false;
  };

  const handleWithdraw = (amount: number, code: string) => {
    if (!isVerified) {
      return false;
    }
    if (amount <= balance && code === '1234') {
      setBalance(prevBalance => prevBalance - amount);
      setTransactions(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'debit',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          description: 'Withdrawal'
        }
      ]);
      return true;
    }
    return false;
  };

  const handleDeposit = (recipient: string, amount: number) => {
    if (!isVerified) {
      return false;
    }
    setBalance(prevBalance => prevBalance + amount);
    setTransactions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'credit',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        description: `Deposit for ${recipient}`
      }
    ]);
    return true;
  };

  const RequireVerification = ({ children }: { children: React.ReactNode }) => {
    if (!isVerified) {
      return <Navigate to="/verify" />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/verify" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <VerifyIdentity 
              username={username}
              onLogout={handleLogout}
              onVerify={handleVerify}
            />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard 
              username={username} 
              balance={balance} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } />
        <Route path="/send" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {/* <RequireVerification> */}
              <SendMoney 
                balance={balance} 
                onSend={handleSendMoney} 
                username={username}
                onLogout={handleLogout}
              />
            {/* </RequireVerification> */}
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <RequireVerification>
              <WithdrawMoney 
                balance={balance} 
                onWithdraw={handleWithdraw} 
                username={username}
                onLogout={handleLogout}
              />
            </RequireVerification>
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <RequireVerification>
              <DepositMoney 
                onDeposit={handleDeposit} 
                username={username}
                onLogout={handleLogout}
              />
            </RequireVerification>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <RequireVerification>
              <TransactionHistory 
                transactions={transactions} 
                username={username}
                onLogout={handleLogout}
              />
            </RequireVerification>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;