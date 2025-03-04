import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import WithdrawMoney from './pages/WithdrawMoney';
import TransactionHistory from './pages/TransactionHistory';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(5000); // Default balance
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', amount: 2500, date: '2025-04-01', description: 'Initial deposit' },
    { id: 2, type: 'credit', amount: 1500, date: '2025-04-02', description: 'Salary' },
    { id: 3, type: 'debit', amount: 500, date: '2025-04-03', description: 'Withdrawal' },
    { id: 4, type: 'debit', amount: 500, date: '2025-04-04', description: 'Sent to john@example.com' },
  ]);

  const handleLogin = (user, pass) => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      setUsername('Admin User');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  const handleSendMoney = (receiver, amount) => {
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

  const handleWithdraw = (amount, code) => {
    if (amount <= balance && code === '1234') { // Simple validation code
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

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
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
            <SendMoney 
              balance={balance} 
              onSend={handleSendMoney} 
              username={username}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <WithdrawMoney 
              balance={balance} 
              onWithdraw={handleWithdraw} 
              username={username}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <TransactionHistory 
              transactions={transactions} 
              username={username}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;