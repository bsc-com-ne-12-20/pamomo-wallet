import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  time_stamp: string;
  description: string;
}

interface TransactionHistoryProps {
  username: string;
  onLogout: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ username, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {

      const email = localStorage.getItem('email');

      if (!email) {
        setError('You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }
  
      try {
        const [transferRes, depositRes, withdrawRes] = await Promise.all([
          axios.get(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`),
          axios.get(`https://mtima.onrender.com/api/v1/dpst/history?email=${email}`),
          axios.get(`https://mtima.onrender.com/api/v1/wtdr/history?email=${email}`)
        ]);

        const transferTransactions = transferRes.data.map((tx: any) => ({
          ...tx,
          description: 'Transfer Funds'
        }));

        const depositTransactions = depositRes.data.map((tx: any) => ({
          ...tx,
          description: 'Deposit Funds'
        }));

        const withdrawTransactions = withdrawRes.data.map((tx: any) => ({
          ...tx,
          description: 'Withdraw Funds'
        }));

        const allTransactions = [
          ...transferTransactions,
          ...depositTransactions,
          ...withdrawTransactions
        ];

        // Sort transactions by time_stamp (latest first)
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime());

        setTransactions(allTransactions);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-[#8928A4] mb-6 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

          {loading && <p className="text-gray-500 text-center">Loading transactions...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.time_stamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.description === 'Deposit Funds' ? 'text-green-600' : transaction.description === 'Withdraw Funds' ? 'text-red-600' : 'text-blue-600'}>
                          {(() => {
                            let symbol: string;
                            if (transaction.description === 'Deposit Funds') {
                              symbol = '+';
                            } else if (transaction.description === 'Withdraw Funds') {
                              symbol = '-';
                            } else {
                              symbol = '+/-';
                            }
                            return `${symbol}Mk${transaction.amount}`;
                          })()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {transaction.description === 'Deposit Funds' ? (
                            <div className="bg-green-100 p-1 rounded-full mr-2">
                              <ArrowDownLeft size={16} className="text-green-600" />
                            </div>
                          ) : transaction.description === 'Withdraw Funds' ? (
                            <div className="bg-red-100 p-1 rounded-full mr-2">
                              <ArrowUpRight size={16} className="text-red-600" />
                            </div>
                          ) : (
                            <div className={`p-1 rounded-full mr-2 bg-blue-100`}>
                              <ArrowLeft size={16} className="text-green-600" />
                              <ArrowRight size={16} className="text-red-600" />
                            </div>
                          
                          )}
                          {transaction.description === 'Deposit Funds' ? 'Received' : transaction.description === 'Withdraw Funds' ? 'Withdrawn' : 'Transferred'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;