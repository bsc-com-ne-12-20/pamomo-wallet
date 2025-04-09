import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState<{message: string, needsVerification?: boolean, isNotFound?: boolean}>({message: ''});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setError({
          message: 'Authentication required: Please log in to view your transactions'
        });
        setLoading(false);
        return;
      }

      try {
        const [transferRes, depositRes, withdrawRes] = await Promise.all([
          axios.get(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`),
          axios.get(`https://mtima.onrender.com/api/v1/dpst/history?email=${email}`),
          axios.get(`https://mtima.onrender.com/api/v1/wtdr/history?email=${email}`)
        ]);

        // Check if any response indicates verification is needed
        if (transferRes.status === 403 || depositRes.status === 403 || withdrawRes.status === 403) {
          setError({
            message: 'Verification Required: Your account needs to be verified to access transaction history',
            needsVerification: true
          });
          return;
        }

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
        if (err.response?.status === 403) {
          setError({
            message: 'Account Verification Required: Please verify your account to view transaction history',
            needsVerification: true
          });
        } else if (err.response?.status === 404) {
          setError({
            message: 'Please complete verification to see transaction history',
            needsVerification: true,
            isNotFound: true
          });
        } else {
          setError({
            message: err.response?.data?.message || "Failed to fetch transactions. Please try again later."
          });
        }
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

          {error.message && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error.isNotFound ? 'No Transactions Found' : 'Action Required'}
              </h3>
              <p className="text-gray-600 mb-6">{error.message}</p>
              
              {error.needsVerification && (
                <div className="space-y-4">
                  <Link 
                    to="/verify" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8928A4] hover:bg-[#6a1f7a] transition-colors"
                  >
                    Complete Verification
                  </Link>
                </div>
              )}
            </div>
          )}

          {!loading && !error.message && transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}

          {!loading && !error.message && transactions.length > 0 && (
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