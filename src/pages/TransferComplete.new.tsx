import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import PaymentVerification from '../components/PaymentVerification';
import { API_BASE_URL } from '../utils/constants';

interface TransferCompleteProps {
  username: string;
  onLogout: () => void;
}

const TransferComplete: React.FC<TransferCompleteProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [txRef, setTxRef] = useState<string | null>(null);
  const [processingApi, setProcessingApi] = useState(false);
  const [apiProcessed, setApiProcessed] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const txRefParam = queryParams.get('tx_ref');

    if (txRefParam) {
      setTxRef(txRefParam);
    }
  }, [location]);

  const handleVerificationComplete = async (success: boolean, data?: any) => {
    if (!success) {
      return;
    }

    setProcessingApi(true);

    try {
      // Extract metadata and amount from verification result
      const metadata = data.metadata || {};
      const receiverEmail = metadata.receiver_email;
      const senderEmail = metadata.sender_email || localStorage.getItem('email');
      const paidAmount = parseFloat(data.amount);
      
      // Get transfer details from localStorage as backup
      const storedReceiver = localStorage.getItem('transferReceiver') || '';
      
      // Now process the transfer through our API
      const transferResponse = await axios.post(`${API_BASE_URL}/external-transfer/`, {
        sender_email: senderEmail,
        receiver_email: receiverEmail || storedReceiver,
        amount: paidAmount,
        payment_reference: txRef
      });
      
      if (transferResponse.status === 201 || transferResponse.status === 200) {
        setApiSuccess(true);
        setApiMessage('Your transfer has been processed successfully in our system.');
      } else {
        setApiSuccess(false);
        setApiMessage('We received your payment but had trouble recording it in our system. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing transfer with API:', error);
      setApiSuccess(false);
      setApiMessage('We received your payment but encountered an error when processing it. Please contact support.');
    } finally {
      setProcessingApi(false);
      setApiProcessed(true);
      
      // Clean up localStorage
      localStorage.removeItem('transferAmount');
      localStorage.removeItem('transferReceiver');
      localStorage.removeItem('transferReceiverUsername');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification</h2>
          <p className="text-gray-600">
            Verifying your payment and processing your transaction.
          </p>
        </div>
        
        {txRef ? (
          <PaymentVerification 
            txRef={txRef}
            onVerificationComplete={handleVerificationComplete}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="text-center text-red-500">
              <p>Invalid transaction reference. Please try again or contact support.</p>
            </div>
          </div>
        )}
        
        {apiProcessed && (
          <div className={`mt-4 p-4 rounded-lg ${apiSuccess ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`${apiSuccess ? 'text-green-800' : 'text-yellow-800'} font-medium`}>
              {apiSuccess ? 'Transaction Recorded' : 'Attention Required'}
            </p>
            <p className={`text-sm ${apiSuccess ? 'text-green-600' : 'text-yellow-600'} mt-1`}>
              {apiMessage}
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#7a2391] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferComplete;
