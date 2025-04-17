import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  time_stamp: string;
}

interface TransactionHistoryProps {
  username: string;
  onLogout: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ username, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; needsVerification?: boolean }>({ message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setError({
          message: 'Authentication required: Please log in to view your transactions',
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`);

        if (response.status === 403) {
          setError({
            message: 'Verification Required: Your account needs to be verified to access transaction history',
            needsVerification: true,
          });
          return;
        }

        const transactionsData = response.data.map((tx: any) => ({
          id: tx.trans_id,
          sender: tx.sender,
          receiver: tx.receiver,
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
        }));

        // Sort transactions by time_stamp (latest first)
        transactionsData.sort((a: any, b: any) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime());

        setTransactions(transactionsData);
        setVisibleTransactions(transactionsData.slice(0, 5)); // Show only the first 5 transactions initially
      } catch (err: any) {
        setError({
          message: err.response?.data?.message || 'Failed to fetch transactions. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [username]);

  // Prepare data for the graph (current month only)
  const email = localStorage.getItem('email');
  const currentMonth = new Date().getMonth();
  const graphData = {
    labels: transactions
      .filter((tx) => new Date(tx.time_stamp).getMonth() === currentMonth)
      .map((tx) => new Date(tx.time_stamp).toLocaleString()),
    datasets: [
      {
        label: 'Sent Transactions',
        data: transactions
          .filter((tx) => tx.sender === email && new Date(tx.time_stamp).getMonth() === currentMonth)
          .map((tx) => tx.amount),
        borderColor: 'rgba(255, 99, 132, 1)', // Red for sent
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Received Transactions',
        data: transactions
          .filter((tx) => tx.receiver === email && new Date(tx.time_stamp).getMonth() === currentMonth)
          .map((tx) => tx.amount),
        borderColor: 'rgba(75, 192, 192, 1)', // Green for received
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const loadMoreTransactions = () => {
    const nextVisibleCount = visibleTransactions.length + 5;
    setVisibleTransactions(transactions.slice(0, nextVisibleCount));
  };

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
              <p className="text-gray-600">{error.message}</p>
            </div>
          )}

          {!loading && !error.message && visibleTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}

          {!loading && !error.message && visibleTransactions.length > 0 && (
            <>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.time_stamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.sender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.receiver}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Mk{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleTransactions.length < transactions.length && (
                <div className="text-center">
                  <button
                    onClick={loadMoreTransactions}
                    className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Trends (This Month)</h3>
                <Line data={graphData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;