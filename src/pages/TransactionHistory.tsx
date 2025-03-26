import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  description: string;
}

interface TransactionHistoryProps {
  username: string;
  onLogout: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ username, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [response1, response2, response3] = await Promise.all([
          axios.get("https://mtima.onrender.com/api/v1/trsf/history"),
          axios.get("https://mtima.onrender.com/api/v1/dpst/history"),
          axios.get("https://mtima.onrender.com/api/v1/wtdr/history")
        ]);

        console.log('Transfer History:', response1.data);
        console.log('Deposit History:', response2.data);
        console.log('Withdraw History:', response3.data);

        const allTransactions = [
          ...response1.data,
          ...response2.data,
          ...response3.data,
        ];

        console.log('All Transactions:', allTransactions);

        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
      }
    };

    fetchTransactions();
  }, []);

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
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {transaction.type === 'credit' ? (
                          <div className="bg-green-100 p-1 rounded-full mr-2">
                            <ArrowDownLeft size={16} className="text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 p-1 rounded-full mr-2">
                            <ArrowUpRight size={16} className="text-red-600" />
                          </div>
                        )}
                        {transaction.type === 'credit' ? 'Received' : 'Sent'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;