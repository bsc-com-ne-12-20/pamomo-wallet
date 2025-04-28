import React from 'react';

interface TransactionDetailsProps {
  transactionFee: number;
  totalDeduction: number;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transactionFee, totalDeduction 
}) => {
  return (
    <div className="mb-4 text-sm text-gray-700">
      <p>Transaction Fee: <span className="font-bold">MK{transactionFee.toFixed(2)}</span></p>
      <p>Total Deduction: <span className="font-bold">MK{totalDeduction.toFixed(2)}</span></p>
    </div>
  );
};

export default TransactionDetails;