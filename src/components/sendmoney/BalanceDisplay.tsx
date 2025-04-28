import React from 'react';

interface BalanceDisplayProps {
  balance: number | null;
  loading: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, loading }) => {
  if (loading) {
    return <p>Loading balance...</p>;
  }

  return (
    <div className="bg-purple-50 p-4 rounded-lg mb-6">
      <p className="text-sm text-gray-600">Available Balance</p>
      <p className="text-xl font-bold text-[#8928A4]">MK{balance?.toLocaleString()}</p>
    </div>
  );
};

export default BalanceDisplay;