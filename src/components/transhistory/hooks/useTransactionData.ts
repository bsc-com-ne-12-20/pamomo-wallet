import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal';
  sender?: string;
  receiver?: string;
  amount: number;
  fee?: number;
  time_stamp: string;
  display_time?: string;
}

interface UseTransactionDataResult {
  transactions: Transaction[];
  visibleTransactions: Transaction[];
  loading: boolean;
  error: { message: string; needsVerification?: boolean };
  loadMoreTransactions: () => void;
  totalCredit: number;
  totalDebit: number;
}

export const useTransactionData = (email: string | null, username: string, subscription: any): UseTransactionDataResult => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; needsVerification?: boolean }>({ message: '' });

  // Format date functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load more transactions
  const loadMoreTransactions = () => {
    const currentCount = visibleTransactions.length;
    const freeLimit = 5;
    const basicLimit = 10;
    
    if (subscription?.plan === 'FREE' && currentCount >= freeLimit) {
      return;
    }
    
    if (subscription?.plan === 'BASIC' && currentCount >= basicLimit) {
      return;
    }
    
    const batchSize = 5;
    let nextCount;
    
    if (subscription?.plan === 'FREE') {
      nextCount = Math.min(currentCount + batchSize, freeLimit);
    } else if (subscription?.plan === 'BASIC') {
      nextCount = Math.min(currentCount + batchSize, basicLimit);
    } else {
      nextCount = currentCount + batchSize;
    }
    
    setVisibleTransactions(transactions.slice(0, nextCount));
  };

  // Calculate totals
  const totalCredit = transactions
    .filter((tx) => tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebit = transactions
    .filter((tx) => tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Fetch transactions
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
          display_time: formatDate(tx.time_stamp)
        }));

        const withdrawalData = withdrawalResponse.data.map((tx: any) => ({
          id: tx.trans_id,
          type: 'withdrawal',
          amount: parseFloat(tx.amount),
          fee: parseFloat(tx.withdrawal_fee),
          time_stamp: tx.time_stamp,
          display_time: formatDate(tx.time_stamp)
        }));

        const depositData = depositResponse.data.map((tx: any) => ({
          id: tx.transaction_id,
          type: 'deposit',
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
          display_time: formatDate(tx.time_stamp)
        }));

        const allTransactions = [...transferData, ...withdrawalData, ...depositData];
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

  return {
    transactions,
    visibleTransactions,
    loading,
    error,
    loadMoreTransactions,
    totalCredit,
    totalDebit
  };
};