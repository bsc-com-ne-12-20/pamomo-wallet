import React from 'react';

interface SuccessModalProps {
  show: boolean;
  amount: string;
  receiver: string;
  receiverUsername: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  show,
  amount,
  receiver,
  receiverUsername,
  onClose
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction Successful</h2>
        <p className="text-sm text-gray-600 mb-4">
          MK<span className="font-bold">{amount}</span> has been sent successfully to <span className="font-bold">{receiverUsername || receiver}</span>.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;