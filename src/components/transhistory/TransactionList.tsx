import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WITHDRAWAL_FEE_PERCENTAGE, TRANSACTION_LIMITS } from '../../utils/constants';

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

interface TransactionListProps {
  transactions: Transaction[];
  visibleTransactions: Transaction[];
  loading: boolean;
  error: { message: string; needsVerification?: boolean };
  subscription: any;
  email: string | null;
  onLoadMore: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  visibleTransactions,
  loading,
  error,
  subscription,
  email,
  onLoadMore,
}) => {
  const navigate = useNavigate();

  const checkSubscriptionLimit = (transaction: Transaction) => {
    if (!subscription) return false;
    
    if (transaction.type === 'withdrawal' || (transaction.type === 'transfer' && transaction.sender === email)) {
      if (subscription.plan === 'FREE' && transaction.amount > TRANSACTION_LIMITS.FREE) {
        return true;
      } else if (subscription.plan === 'BASIC' && transaction.amount > TRANSACTION_LIMITS.BASIC) {
        return true;
      }
    }
    return false;
  };

  if (loading) {
    return <p className="text-gray-500 text-center">Loading transactions...</p>;
  }

  if (error.message) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (visibleTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Transaction List View */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {visibleTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`
                bg-gray-50 rounded-lg p-4 shadow-sm
                ${checkSubscriptionLimit(transaction) ? 'border-l-4 border-yellow-400' : ''}
              `}
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</span>
                <span
                  className={`text-sm font-bold ${
                    checkSubscriptionLimit(transaction) ? 'text-yellow-600' : ''
                  }`}
                >
                  Mk{transaction.amount.toFixed(2)}
                  {checkSubscriptionLimit(transaction) && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Limit Exceeded
                    </span>
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">{transaction.display_time}</div>
              <div className="text-xs text-gray-700">
                {transaction.type === 'transfer'
                  ? `From: ${transaction.sender} To: ${transaction.receiver}`
                  : transaction.type === 'withdrawal'
                  ? `Fee: Mk${transaction.fee?.toFixed(2)} (${(WITHDRAWAL_FEE_PERCENTAGE * 100).toFixed(0)}%)`
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
              <tr key={transaction.id} className={checkSubscriptionLimit(transaction) ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.display_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.type === 'transfer'
                    ? `From: ${transaction.sender} To: ${transaction.receiver}`
                    : transaction.type === 'withdrawal'
                    ? `Fee: Mk${transaction.fee?.toFixed(2)} (${(WITHDRAWAL_FEE_PERCENTAGE * 100).toFixed(0)}%)`
                    : 'Deposit'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`text-sm font-medium ${
                        checkSubscriptionLimit(transaction) ? 'text-yellow-600' : ''
                      }`}
                    >
                      Mk{transaction.amount.toFixed(2)}
                    </span>
                    {checkSubscriptionLimit(transaction) && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Limit Exceeded
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleTransactions.length < transactions.length && (
        <div className="text-center mb-8">
          {subscription?.plan === 'FREE' && visibleTransactions.length >= 5 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">You've reached the transaction history limit for the Free plan</p>
              <button
                onClick={() => navigate('/subscription')}
                className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
              >
                Upgrade to Basic or Premium for more history
              </button>
            </div>
          ) : subscription?.plan === 'BASIC' && visibleTransactions.length >= 10 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">You've reached the transaction history limit for the Basic plan</p>
              <button
                onClick={() => navigate('/subscription')}
                className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
              >
                Upgrade to Premium for unlimited history
              </button>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default TransactionList;