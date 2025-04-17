import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal';
  sender?: string;
  receiver?: string;
  amount: number;
  fee?: number;
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
  const [graphType, setGraphType] = useState<'transaction' | 'week' | 'month'>('month');
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!email) {
        setError({ message: 'Authentication required: Please log in to view your transactions' });
        setLoading(false);
        return;
      }

      try {
        const transferResponse = await axios.get(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`);
        const withdrawalResponse = await axios.get(`https://mtima.onrender.com/api/v1/wtdr/history/?email=${email}`);
        const depositResponse = await axios.get(`https://mtima.onrender.com/api/v1/dpst/history/?email=${email}`);

        const transferData = transferResponse.data.map((tx: any) => ({
          id: tx.trans_id,
          type: 'transfer',
          sender: tx.sender,
          receiver: tx.receiver,
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
        }));

        const withdrawalData = withdrawalResponse.data.map((tx: any) => ({
          id: tx.trans_id,
          type: 'withdrawal',
          amount: parseFloat(tx.amount),
          fee: parseFloat(tx.withdrawal_fee),
          time_stamp: tx.time_stamp,
        }));

        const depositData = depositResponse.data.map((tx: any) => ({
          id: tx.transaction_id,
          type: 'deposit',
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
        }));

        const allTransactions = [...transferData, ...withdrawalData, ...depositData];
        // Sort transactions by newest first
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime());

        setTransactions(allTransactions);
        setVisibleTransactions(allTransactions.slice(0, 5));
      } catch (err: any) {
        setError({ message: err.response?.data?.message || 'Failed to fetch transactions. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [username, email]);

  const loadMoreTransactions = () => {
    const nextVisibleCount = visibleTransactions.length + 5;
    setVisibleTransactions(transactions.slice(0, nextVisibleCount));
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  const formatWeekYear = (dateString: string) => {
    const date = new Date(dateString);
    const week = Math.ceil(date.getDate() / 7);
    return `W${week}, ${date.getFullYear()}`;
  };

  const graphData = (() => {
    if (graphType === 'transaction') {
      return {
        labels: transactions.map((tx) => new Date(tx.time_stamp).toLocaleString()),
        datasets: [
          {
            label: 'Credit (CR)',
            data: transactions
              .filter((tx) => tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email))
              .map((tx) => tx.amount),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
          },
          {
            label: 'Debit (DR)',
            data: transactions
              .filter((tx) => tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email))
              .map((tx) => tx.amount),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
          },
        ],
      };
    } else {
      const groupBy = graphType === 'month' ? formatMonthYear : formatWeekYear;
      const groupedData = transactions.reduce((acc, tx) => {
        const key = groupBy(tx.time_stamp);

        if (!acc[key]) {
          acc[key] = { credit: 0, debit: 0 };
        }

        if (tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email)) {
          acc[key].credit += tx.amount;
        } else if (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email)) {
          acc[key].debit += tx.amount;
        }

        return acc;
      }, {} as Record<string, { credit: number; debit: number }>);

      const labels = Object.keys(groupedData);
      const creditData = labels.map((key) => groupedData[key].credit);
      const debitData = labels.map((key) => groupedData[key].debit);

      return {
        labels,
        datasets: [
          {
            label: 'Credit (CR)',
            data: creditData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
          },
          {
            label: 'Debit (DR)',
            data: debitData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
          },
        ],
      };
    }
  })();

  const totalCredit = transactions
    .filter((tx) => tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebit = transactions
    .filter((tx) => tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pieData = {
    labels: ['Credit (CR)', 'Debit (DR)'],
    datasets: [
      {
        data: [totalCredit, totalDebit],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      }
    }
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

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

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
              {/* Mobile Transaction List View */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {visibleTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</span>
                        <span className="text-sm font-bold">
                          Mk{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(transaction.time_stamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-700">
                        {transaction.type === 'transfer'
                          ? `From: ${transaction.sender} To: ${transaction.receiver}`
                          : transaction.type === 'withdrawal'
                          ? `Fee: Mk${transaction.fee?.toFixed(2)}`
                          : 'Deposit'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Transaction Table View */}
              <div className="hidden md:block overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type === 'transfer'
                            ? `From: ${transaction.sender} To: ${transaction.receiver}`
                            : transaction.type === 'withdrawal'
                            ? `Fee: Mk${transaction.fee?.toFixed(2)}`
                            : 'Deposit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Mk{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleTransactions.length < transactions.length && (
                <div className="text-center mb-8">
                  <button
                    onClick={loadMoreTransactions}
                    className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Transaction Trends</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setGraphType('transaction')}
                    className={`px-3 py-1 text-xs md:text-sm rounded-md ${
                      graphType === 'transaction' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    Per Transaction
                  </button>
                  <button
                    onClick={() => setGraphType('week')}
                    className={`px-3 py-1 text-xs md:text-sm rounded-md ${
                      graphType === 'week' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    Per Week
                  </button>
                  <button
                    onClick={() => setGraphType('month')}
                    className={`px-3 py-1 text-xs md:text-sm rounded-md ${
                      graphType === 'month' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    Per Month
                  </button>
                </div>
                <div className="h-60 md:h-80" ref={chartContainerRef}>
                  <Line data={graphData} options={lineChartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Transaction Breakdown</h3>
                <div className="flex justify-center">
                  <div className="h-52 w-52 md:h-64 md:w-64 lg:h-80 lg:w-80">
                    <Pie data={pieData} options={pieChartOptions} />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Credit</p>
                      <p className="text-sm md:text-base font-bold text-blue-600">Mk{totalCredit.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Debit</p>
                      <p className="text-sm md:text-base font-bold text-red-600">Mk{totalDebit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;