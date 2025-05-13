import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { PAYMENT_API_KEY, PAYMENT_API_URL } from '../utils/constants';
import Loader2 from './Loader2';

interface VerificationLogs {
  type: string;
  message: string;
  created_at: string;
}

interface PaymentAuthorizationDetails {
  channel: string;
  card_number?: string;
  expiry?: string;
  brand?: string;
  provider?: string | null;
  mobile_number?: string | null;
  completed_at: string;
}

interface PaymentVerificationData {
  event_type: string;
  tx_ref: string;
  mode: string;
  status: string;
  reference: string;
  currency: string;
  amount: number;
  charges: number;
  authorization: PaymentAuthorizationDetails;
  logs: VerificationLogs[];
  created_at: string;
  updated_at: string;
}

interface PaymentVerificationProps {
  txRef: string;
  onVerificationComplete?: (success: boolean, data?: PaymentVerificationData) => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({ 
  txRef, 
  onVerificationComplete 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationData, setVerificationData] = useState<PaymentVerificationData | null>(null);
  const [currentBalance, setCurrentBalance] = useState<string | null>(null);
  useEffect(() => {
    // Check if we have an updated balance in localStorage
    const savedBalance = localStorage.getItem('currentBalance');
    if (savedBalance) {
      setCurrentBalance(savedBalance);
    }
    
    const verifyPayment = async () => {
      if (!txRef) {
        setIsLoading(false);
        setErrorMessage('No transaction reference provided');
        return;
      }
      
      try {
        const response = await fetch(`${PAYMENT_API_URL}/verify-payment/${txRef}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${PAYMENT_API_KEY}`,
          },
        });
        
        const result = await response.json();

        if (result.status === 'success' && result.data?.status === 'success') {
          setVerificationData(result.data);
          setIsVerified(true);
          if (onVerificationComplete) {
            onVerificationComplete(true, result.data);
          }
        } else {
          setErrorMessage(result.message || 'Payment verification failed');
          if (onVerificationComplete) {
            onVerificationComplete(false);
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setErrorMessage('An error occurred while verifying the payment');
        if (onVerificationComplete) {
          onVerificationComplete(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [txRef, onVerificationComplete]);

  // Format date to local readable format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Format card number with asterisks
  const formatCardNumber = (cardNumber: string | undefined) => {
    if (!cardNumber) return 'N/A';
    return cardNumber;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mt-8">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 />
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mt-8">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-600">Verification Failed</h3>
          <p className="text-gray-600 text-center">{errorMessage || 'Unable to verify the payment'}</p>
          <p className="text-sm text-gray-500">Transaction Reference: {txRef}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mt-8">
      <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-gray-100">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-green-600">Payment Successful</h3>
        <p className="text-gray-700 text-center">
          Your payment of <span className="font-bold">{verificationData?.currency} {verificationData?.amount?.toLocaleString()}</span> has been verified.
        </p>
      </div>

      <div className="py-4 space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Transaction Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reference</span>
              <span className="text-sm font-medium">{verificationData?.reference}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transaction ID</span>
              <span className="text-sm font-medium">{verificationData?.tx_ref}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-medium">
                {verificationData?.currency} {verificationData?.amount?.toLocaleString() || '0'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Charges</span>
              <span className="text-sm font-medium">
                {verificationData?.currency} {verificationData?.charges?.toLocaleString() || '0'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Platform Fee (3%)</span>
              <span className="text-sm font-medium text-red-600">
                {verificationData?.currency} {((verificationData?.amount || 0) * 0.03).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Deposited</span>
              <span className="text-sm font-medium text-green-600">
                {verificationData?.currency} {((verificationData?.amount || 0) * 0.97).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-sm font-bold text-[#8928A4]">
                {verificationData?.currency} {((verificationData?.amount || 0) + (verificationData?.charges || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
          {currentBalance && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Account Status</h4>
            
            <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Updated Balance</span>
                <span className="text-sm font-bold text-green-600">{verificationData?.currency} {parseFloat(currentBalance).toLocaleString()}</span>
              </div>
              <p className="text-xs text-green-600">Your account has been credited with the deposited amount.</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Payment Method</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Channel</span>
              <span className="text-sm font-medium">{verificationData?.authorization?.channel}</span>
            </div>
            
            {verificationData?.authorization?.card_number && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Card</span>
                <span className="text-sm font-medium">
                  {formatCardNumber(verificationData.authorization.card_number)}
                  {verificationData.authorization.brand && ` (${verificationData.authorization.brand})`}
                </span>
              </div>
            )}
            
            {verificationData?.authorization?.mobile_number && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile Number</span>
                <span className="text-sm font-medium">{verificationData.authorization.mobile_number}</span>
              </div>
            )}
            
            {verificationData?.authorization?.provider && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Provider</span>
                <span className="text-sm font-medium">{verificationData.authorization.provider}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Timeline</h4>
          
          <div className="space-y-4">
            {verificationData?.logs?.map((log, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1">
                  {log.type === 'error' ? (
                    <div className="rounded-full bg-red-100 p-1">
                      <XCircle size={16} className="text-red-500" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-blue-100 p-1">
                      <Clock size={16} className="text-blue-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{log.message}</p>
                  <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                </div>
              </div>
            ))}
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="rounded-full bg-green-100 p-1">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm">Payment completed successfully</p>
                <p className="text-xs text-gray-500">
                  {formatDate(verificationData?.authorization?.completed_at || verificationData?.updated_at || '')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => window.print()}
          className="text-[#8928A4] text-sm font-medium hover:underline flex items-center"
        >
          <ExternalLink size={14} className="mr-1" />
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentVerification;
