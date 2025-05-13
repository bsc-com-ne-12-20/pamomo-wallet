import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader2 from '../components/Loader2';
import { ArrowLeft, AlertTriangle, Wallet, CreditCard, Check, Building2, Smartphone } from 'lucide-react';
import axios from 'axios';
import jsQR from 'jsqr';

// Import bank logos
import nbLogo from '../components/images/banks/NB.png';
import standardLogo from '../components/images/banks/standard.png';
import fcbLogo from '../components/images/banks/fcb.png';
import nbsLogo from '../components/images/banks/nbs.png';

// Import wallet logos for mobile money providers
import mpambaLogo from '../components/images/wallets/mpamba.png';
import airtelMoneyLogo from '../components/images/wallets/airtelmoney.png';

// Import components
import BalanceDisplay from '../components/sendmoney/BalanceDisplay';
import SendMoneyForm from '../components/sendmoney/SendMoneyForm';
import QRScannerModal from '../components/sendmoney/QRScannerModal';
import ConfirmationModal from '../components/sendmoney/ConfirmationModal';
import SuccessModal from '../components/sendmoney/SuccessModal';
import { 
  API_BASE_URL, 
  TRANSACTION_LIMITS, 
  TRANSFER_FEE_PERCENTAGE,
  PAYMENT_API_URL,
  PAYMENT_API_KEY
} from '../utils/constants';

interface SubscriptionPlan {
  plan: string;
  period: string;
  status: string;
  expiry_date: string;
  auto_renew: boolean;
  current_balance?: number;
}

interface SendMoneyProps {
  onLogout: () => void;
  isVerified: boolean;
}

// Expanded payment method types
type PaymentMethod = 'pamomo_wallet' | 'mobile_money' | 'bank_transfer' | 'external_wallet';

// Bank data interface
interface BankOption {
  id: string;
  name: string;
  logo: string;  // Updated to require logo
}

// Mobile money provider interface
interface MobileProvider {
  id: string;
  name: string;
  logo: string;
  country: string;
}

const SendMoney: React.FC<SendMoneyProps> = ({ onLogout, isVerified }) => {
  // Define constants
  const PAYMENT_GATEWAY_LIMIT = 1000000; // 1,000,000 MWK limit for payment gateway
  
  const [balance, setBalance] = useState<number | null>(null);
  const [receiver, setReceiver] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fetchingUsername, setFetchingUsername] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pamomo_wallet');
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(true);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [frequency, setFrequency] = useState('DAILY');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  
  // New state variables for external transfers
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileProvider, setMobileProvider] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  
  const navigate = useNavigate();

  const minDate = new Date().toISOString().split('T')[0];

  // Banks available for transfer with logos
  const availableBanks: BankOption[] = [
    { id: 'nbm', name: 'National Bank', logo: nbLogo },
    { id: 'standard', name: 'Standard Bank', logo: standardLogo },
    { id: 'first-capital', name: 'First Capital', logo: fcbLogo },
    { id: 'nbs', name: 'NBS Bank', logo: nbsLogo }
  ];

  // Mobile money providers with logos
  const mobileProviders: MobileProvider[] = [
    { id: 'tnm-mpamba', name: 'TNM Mpamba', logo: mpambaLogo, country: 'Malawi' },
    { id: 'airtel-money', name: 'Airtel Money', logo: airtelMoneyLogo, country: 'Malawi' }
  ];  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    const amountNum = parseFloat(value) || 0;
    const fee = amountNum * TRANSFER_FEE_PERCENTAGE;
    setTransactionFee(fee);
    setTotalDeduction(amountNum + fee);
  };
  
  // Live validation for amount across all payment methods
  useEffect(() => {
    // Skip validation if amount is empty
    if (!amount) {
      setError('');
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    // Validate amount format
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Validate against balance for pamomo wallet
    if (paymentMethod === 'pamomo_wallet' && balance !== null && amountValue > balance) {
      setError('Insufficient balance');
      return;
    }
    
    // Validate against payment gateway limit for external wallet
    if (paymentMethod === 'external_wallet' && amountValue > PAYMENT_GATEWAY_LIMIT) {
      setError(`Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}`);
      return;
    }
    
    // Validate against transaction limit
    const effectiveLimit = getEffectiveTransactionLimit(paymentMethod !== 'pamomo_wallet');
    if (amountValue > effectiveLimit) {
      setError(`Amount exceeds your transaction limit of MWK${effectiveLimit.toLocaleString()}`);
      return;
    }
    
    // Clear error if all validations pass
    setError('');
  }, [amount, balance, paymentMethod, PAYMENT_GATEWAY_LIMIT]);

  const handleScanQRCode = () => {
    setShowQRScanner(true);
  };

  const fetchUsername = async (email: string) => {
    setFetchingUsername(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/get-username/`, {
        email
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        setReceiverUsername(response.data.username);
      } else {
        setError('Failed to fetch username');
        setReceiverUsername('Unknown User');
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      setReceiverUsername('Unknown User');
    } finally {
      setFetchingUsername(false);
    }
  };

  const handleScanResult = async (result: string | null) => {
    if (result) {
      setReceiver(result);
      setShowQRScanner(false);
      
      await fetchUsername(result);
      setShowConfirmation(true);
    }
  };

  const confirmQrCode = () => {
    setShowConfirmation(false);
  };

  const cancelQrCode = () => {
    setShowConfirmation(false);
    setReceiver('');
    setReceiverUsername('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCode) {
              setReceiver(qrCode.data);
              setShowQRScanner(false);
              
              await fetchUsername(qrCode.data);
              setShowConfirmation(true);
            } else {
              setError('No QR code found in the image.');
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch user's subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;
      
      try {
        setSubscriptionLoading(true);
        const response = await axios.post(`${API_BASE_URL}/subscriptions/check-subscription/`, {
          email
        });
        
        if (response.status === 200) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        setSubscription({
          plan: 'FREE',
          period: 'LIFETIME',
          status: 'ACTIVE',
          expiry_date: 'NEVER',
          auto_renew: false
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setError('You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      if (!isVerified) {
        navigate('/verify');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/accounts/get-balance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [isVerified, navigate]);  const checkTransactionLimit = (amountNum: number, isGatewayTx: boolean = false): boolean => {
    if (!subscription) return true;
    
    const limit = TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
    
    // When it's a gateway transaction, also check the gateway limit
    if (isGatewayTx) {
      return amountNum <= limit && amountNum <= PAYMENT_GATEWAY_LIMIT;
    }
    
    return amountNum <= limit;
  };
  const getTransactionLimit = (): number => {
    if (!subscription) return TRANSACTION_LIMITS.FREE;
    return TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
  };
  const getEffectiveTransactionLimit = (isGatewayTx: boolean = false): number => {
    const userLimit = getTransactionLimit();
    
    if (isGatewayTx) {
      // Return the lower of the two limits
      return Math.min(userLimit, PAYMENT_GATEWAY_LIMIT);
    }
    
    return userLimit;
  };
    // Constant declaration moved to the top of the component

  const handleSubmitPamomoWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    if (!receiver || !amount) {
      setError('Please fill in all fields');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }    // Check transaction limits
    if (!checkTransactionLimit(amountNum, false)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    // Check balance
    if (amountNum > (balance || 0)) {
      setError('Insufficient balance');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    // Handle recurring payment setup if selected
    if (makeRecurring) {
      // Validate recurring payment fields
      if (!startDate) {
        setError('Please select a start date for recurring payments');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }

      if (subscription?.plan === 'FREE') {
        setError('Recurring payments require Basic or Premium subscription');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }

      try {
        // First send the initial payment
        const senderEmail = localStorage.getItem('email');
        const transferResponse = await axios.post(`${API_BASE_URL}/trsf/`, {
          sender_email: senderEmail,
          receiver_email: receiver,
          amount: amountNum
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (transferResponse.status !== 201) {
          setError('Initial transaction failed. Please try again.');
          setTimeout(() => setIsSending(false), 3000);
          return;
        }

        // Then set up the auto payment
        const autoPaymentResult = await createAutoPayment(receiver, amountNum, {
          frequency,
          startDate,
          description
        });

        if (!autoPaymentResult.success) {
          // If auto payment setup fails but the initial transfer succeeded
          setError(`Initial payment sent, but failed to set up recurring payments: ${autoPaymentResult.error}`);
          setTimeout(() => {
            setIsSending(false);
            setShowSuccessPopup(true); // Still show success for the initial payment
          }, 3000);
          return;
        }

        // Both succeeded
        setTimeout(() => {
          setIsSending(false);
          setShowSuccessPopup(true);
        }, 3000);

      } catch (error) {
        console.error("Transaction error:", error);
        setError('An error occurred while processing your transaction.');
        setTimeout(() => setIsSending(false), 3000);
      }
    } else {
      // Regular one-time payment (existing functionality)
      try {
        const senderEmail = localStorage.getItem('email');
        const response = await axios.post(`${API_BASE_URL}/trsf/`, {
          sender_email: senderEmail,
          receiver_email: receiver,
          amount: amountNum
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 201) {
          setTimeout(() => {
            setIsSending(false);
            setShowSuccessPopup(true);
          }, 3000);
        } else {
          setError('Transaction failed. Please try again.');
          setTimeout(() => setIsSending(false), 3000);
        }
      } catch (error) {
        setError('An error occurred while processing your transaction.');
        setTimeout(() => setIsSending(false), 3000);
      }
    }
  };

  const createAutoPayment = async (recipientEmail: string, amountValue: number, recurringOptions: {
    frequency: string;
    startDate: string;
    description: string;
  }) => {
    try {
      const email = localStorage.getItem('email');
      
      const payload = {
        user_email: email,
        recipient_email: recipientEmail,
        amount: amountValue,
        frequency: recurringOptions.frequency,
        start_date: recurringOptions.startDate,
        next_payment_date: recurringOptions.startDate,
        description: recurringOptions.description || `Auto payment to ${recipientEmail}`
      };
      
      console.log('Creating auto payment with data:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/autopayments/create/`, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (err: any) {
      console.error('Auto payment creation failed:', err.response || err);
      
      let errorMessage = 'Failed to create auto payment';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ');
        } else if (err.response.data.next_payment_date) {
          errorMessage = `Next Payment Date: ${err.response.data.next_payment_date[0]}`;
        } else if (err.response.data.amount) {
          errorMessage = `Amount: ${err.response.data.amount[0]}`;
        } else if (err.response.data.start_date) {
          errorMessage = `Start date: ${err.response.data.start_date[0]}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Handle external payment submission based on the selected payment method
  const handleSubmitExternalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    if (!amount) {
      setError('Please enter an amount');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }      // Apply payment gateway limit and check plan limits
    if (!checkTransactionLimit(amountNum, true)) {
      if (amountNum > PAYMENT_GATEWAY_LIMIT) {
        setError(`Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}. Please enter a smaller amount.`);
      } else {
        setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      }
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    // Validate fields based on payment method
    if (paymentMethod === 'bank_transfer') {
      if (!selectedBank) {
        setError('Please select a bank');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }
      if (!accountNumber) {
        setError('Please enter an account number');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }
      if (!accountName) {
        setError('Please enter the account name');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }
    } else if (paymentMethod === 'mobile_money') {
      if (!mobileProvider) {
        setError('Please select a mobile money provider');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }
      if (!mobileNumber) {
        setError('Please enter a mobile number');
        setTimeout(() => setIsSending(false), 3000);
        return;
      }
    }

    // For external payments, we use the payment gateway
    try {
      const senderEmail = localStorage.getItem('email');
      
      // Store transfer info in localStorage
      localStorage.setItem('transferAmount', amount);
      
      if (paymentMethod === 'bank_transfer') {
        const selectedBankName = availableBanks.find(bank => bank.id === selectedBank)?.name || selectedBank;
        localStorage.setItem('transferReceiver', `${accountName} (${selectedBankName})`);
        localStorage.setItem('transferReceiverUsername', accountNumber);
      } else if (paymentMethod === 'mobile_money') {
        const providerName = mobileProviders.find(provider => provider.id === mobileProvider)?.name || mobileProvider;
        localStorage.setItem('transferReceiver', `${mobileNumber} (${providerName})`);
        localStorage.setItem('transferReceiverUsername', mobileNumber);
      } else {
        localStorage.setItem('transferReceiver', cardHolderName);
        localStorage.setItem('transferReceiverUsername', cardHolderName);
      }

      // Build metadata based on payment method
      let metadata = {
        sender_email: senderEmail,
        transaction_type: 'external_transfer',
        payment_method: paymentMethod
      };

      if (paymentMethod === 'bank_transfer') {
        metadata = {
          ...metadata,
          bank_id: selectedBank,
          account_number: accountNumber,
          account_name: accountName
        };
      } else if (paymentMethod === 'mobile_money') {
        metadata = {
          ...metadata,
          provider_id: mobileProvider,
          mobile_number: mobileNumber
        };
      }

      const response = await fetch(`${PAYMENT_API_URL}/payment`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: `Bearer ${PAYMENT_API_KEY}`,
        },
        body: JSON.stringify({
          currency: 'MWK',
          amount: amountNum.toString(),
          callback_url: 'https://pamomo-wallet.netlify.app/verifytransfer',
          return_url: 'https://pamomo-wallet.netlify.app/transfer/complete',
          metadata: metadata
        }),
      });

      const result = await response.json();

      if (result.status === 'success' && result.data.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        setError('Transaction initiation failed. Please try again.');
        setTimeout(() => setIsSending(false), 3000);
      }
    } catch (error) {
      setError('An error occurred while processing your transaction.');
      setTimeout(() => setIsSending(false), 3000);
    }
  };

  // Handle mobile money payment submission
  const handleMobileMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    // Validate input fields
    if (!mobileProvider) {
      setError('Please select a mobile money provider');
      setIsSending(false);
      return;
    }

    if (!mobileNumber) {
      setError('Please enter a mobile number');
      setIsSending(false);
      return;
    }

    // Different validation based on provider
    if (mobileProvider === 'tnm-mpamba') {
      // TNM Mpamba numbers start with 08
      if (!mobileNumber.match(/^08\d{8}$/)) {
        setError('TNM Mpamba number must start with 08 and be 10 digits long');
        setIsSending(false);
        return;
      }    } else if (mobileProvider === 'airtel-money') {
      // Airtel Money numbers start with 09
      if (!mobileNumber.match(/^09\d{8}$/)) {
        setError('Airtel Money number must start with 09 and be 10 digits long');
        setIsSending(false);
        return;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsSending(false);
      return;
    }
    
    const amountNum = parseFloat(amount);
    
    // Check payment gateway limit
    if (amountNum > PAYMENT_GATEWAY_LIMIT) {
      setError(`Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}`);
      setIsSending(false);
      return;
    }
    
    // Check balance
    if (amountNum > (balance || 0)) {
      setError('Insufficient balance');
      setIsSending(false);
      return;
    }

    // Check transaction limit
    if (!checkTransactionLimit(amountNum)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      setIsSending(false);
      return;
    }

    try {
      // Generate a mock transaction ID
      const mockTransactionId = generateMockTransactionId();
      
      // Mock successful payment - simulate API delay
      setTimeout(() => {
        // Store transfer info for success modal
        const providerName = mobileProviders.find(provider => provider.id === mobileProvider)?.name || mobileProvider;
        localStorage.setItem('transferReceiver', mobileNumber);
        localStorage.setItem('transferReceiverUsername', `${mobileNumber} (${providerName})`);
        localStorage.setItem('transferAmount', amount);
        localStorage.setItem('transactionId', mockTransactionId);
        
        setIsSending(false);
        setShowSuccessPopup(true);
      }, 2000);
    } catch (error) {
      console.error("Error processing mobile money payment:", error);
      setError('An error occurred while processing your mobile money payment.');
      setIsSending(false);
    }
  };

  // Handle bank transfer payment submission
  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    // Validate input fields
    if (!selectedBank) {
      setError('Please select a bank');
      setIsSending(false);
      return;
    }

    if (!accountNumber) {
      setError('Please enter an account number');
      setIsSending(false);
      return;
    }    if (!accountName) {
      setError('Please enter the account name');
      setIsSending(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsSending(false);
      return;
    }

    const amountNum = parseFloat(amount);
    
    // Check payment gateway limit
    if (amountNum > PAYMENT_GATEWAY_LIMIT) {
      setError(`Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}`);
      setIsSending(false);
      return;
    }
    
    // Check balance
    if (amountNum > (balance || 0)) {
      setError('Insufficient balance');
      setIsSending(false);
      return;
    }

    // Check transaction limit
    if (!checkTransactionLimit(amountNum)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      setIsSending(false);
      return;
    }

    try {
      // Generate a mock transaction ID
      const mockTransactionId = generateMockTransactionId();
      const selectedBankName = availableBanks.find(bank => bank.id === selectedBank)?.name || selectedBank;
      
      // Store transfer info for success modal
      localStorage.setItem('transferReceiver', accountNumber);
      localStorage.setItem('transferReceiverUsername', `${accountName} (${selectedBankName})`);
      localStorage.setItem('transferAmount', amount);
      localStorage.setItem('transactionId', mockTransactionId);
      
      // Mock successful payment - simulate API delay
      setTimeout(() => {
        setIsSending(false);
        setShowSuccessPopup(true);
      }, 2000);
    } catch (error) {
      console.error("Error processing bank transfer:", error);
      setError('An error occurred while processing your bank transfer.');
      setIsSending(false);
    }
  };

  // Generate a mock transaction ID with format PMMO-XXXXX-XXXXX
  const generateMockTransactionId = (): string => {
    const randomPart1 = Math.floor(10000 + Math.random() * 90000);
    const randomPart2 = Math.floor(10000 + Math.random() * 90000);
    return `PMMO-${randomPart1}-${randomPart2}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (paymentMethod === 'pamomo_wallet') {
      return handleSubmitPamomoWallet(e);
    } else if (paymentMethod === 'mobile_money') {
      return handleMobileMoneySubmit(e);
    } else if (paymentMethod === 'bank_transfer') {
      return handleBankTransferSubmit(e);
    } else {
      return handleSubmitExternalPayment(e);
    }
  };
  // Handle payment method selection, clear localStorage to avoid showing previous transaction data
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // For external wallet, redirect to the dedicated page
    if (method === 'external_wallet') {
      navigate('/external-transfer');
      return;
    }
    
    setShowPaymentMethodSelection(false);
    setShowTransferDetails(true);
    // Reset form fields when changing payment method
    if (method !== 'pamomo_wallet') {
      setReceiver('');
      setReceiverUsername('');
    }
    setError('');
    
    // Clear any previous transfer data from localStorage
    localStorage.removeItem('transferReceiver');
    localStorage.removeItem('transferReceiverUsername');
    localStorage.removeItem('transferAmount');
    localStorage.removeItem('transactionId');
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/dashboard');
  };

  const handleUpgradeClick = () => {
    navigate('/subscription');
  };

  const handleBackToPaymentSelection = () => {
    setShowPaymentMethodSelection(true);
    setShowTransferDetails(false);
    setError('');
  };

  // Reset fields helper
  const resetExternalTransferFields = () => {
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setMobileProvider('');
    setMobileNumber('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolderName('');
  };

  const username = localStorage.getItem('username') || 'User';

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
        
        {subscription && subscription.plan !== 'PREMIUM' && !subscriptionLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Transaction Limit: {subscription.plan === 'FREE' 
                  ? `MWK${TRANSACTION_LIMITS.FREE.toLocaleString()}` 
                  : `MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()}`}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Your current subscription limits you to 
                {subscription.plan === 'FREE' 
                  ? ` MWK${TRANSACTION_LIMITS.FREE.toLocaleString()}` 
                  : ` MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()}`} per transaction.
                <button 
                  onClick={handleUpgradeClick}
                  className="ml-1 text-[#8928A4] hover:underline"
                >
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        )}
        
        {isSending ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Money</h2>
            
            {showPaymentMethodSelection ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">Select your payment method:</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethodSelect('pamomo_wallet')}
                    className="w-full bg-white border-2 border-[#8928A4] p-4 rounded-lg flex items-center text-left hover:bg-[#f9f0fc] transition-colors"
                  >
                    <Wallet className="text-[#8928A4] mr-3 h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Pamomo Wallet</p>
                      <p className="text-xs text-gray-500">Send money from Pamomo to other Pamomo users</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethodSelect('external_wallet')}
                    className="w-full bg-white border border-gray-300 p-4 rounded-lg flex items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="text-purple-600 mr-3 h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">External Wallet</p>
                      <p className="text-xs text-gray-500">Send money from external digital wallets to anyone</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethodSelect('bank_transfer')}
                    className="w-full bg-white border border-gray-300 p-4 rounded-lg flex items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="text-blue-600 mr-3 h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Send money from Pamomo to bank accounts</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect('mobile_money')}
                    className="w-full bg-white border border-gray-300 p-4 rounded-lg flex items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <Smartphone className="text-green-600 mr-3 h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Mobile Money</p>
                      <p className="text-xs text-gray-500">Send money from Pamomo to mobile money accounts</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-blue-50 p-3 rounded-lg flex items-center">
                  {paymentMethod === 'pamomo_wallet' && <Wallet className="text-[#8928A4] mr-3" />}
                  {paymentMethod === 'bank_transfer' && <Building2 className="text-blue-600 mr-3" />}
                  {paymentMethod === 'mobile_money' && <Smartphone className="text-green-600 mr-3" />}
                  {paymentMethod === 'external_wallet' && <CreditCard className="text-purple-600 mr-3" />}
                  <div>
                    <p className="text-sm font-medium">
                      Payment Method: {
                        paymentMethod === 'pamomo_wallet' ? 'Pamomo Wallet' :
                        paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                        paymentMethod === 'mobile_money' ? 'Mobile Money' :
                        'External Wallet'
                      }
                    </p>
                    <button 
                      onClick={handleBackToPaymentSelection}
                      className="text-xs text-[#8928A4] hover:underline mt-1"
                    >
                      Change payment method
                    </button>
                  </div>
                </div>

                {paymentMethod === 'pamomo_wallet' && (
                  <>
                    <BalanceDisplay balance={balance} loading={loading} />                    <SendMoneyForm
                      receiver={receiver}
                      setReceiver={setReceiver}
                      amount={amount}
                      handleAmountChange={handleAmountChange}
                      error={error}
                      setError={setError}
                      handleSubmit={handleSubmit}
                      handleScanQRCode={handleScanQRCode}
                      transactionFee={transactionFee}
                      totalDeduction={totalDeduction}
                      transactionLimit={getEffectiveTransactionLimit(paymentMethod !== 'pamomo_wallet')}
                      showLimitWarning={!subscriptionLoading && !!subscription && subscription.plan !== 'PREMIUM'}
                      submitButtonText='Send from Pamomo Wallet'
                      isPaymentGateway={paymentMethod !== 'pamomo_wallet'}
                      balance={balance}
                    />

                    {subscription && subscription.plan !== 'FREE' && (
                      <div className="flex items-center mt-4 mb-2">
                        <input
                          type="checkbox"
                          id="makeRecurring"
                          className="rounded text-[#8928A4] focus:ring-[#8928A4] h-4 w-4"
                          checked={makeRecurring}
                          onChange={(e) => setMakeRecurring(e.target.checked)}
                        />
                        <label htmlFor="makeRecurring" className="ml-2 text-sm text-gray-700">
                          Set up as recurring auto payment
                        </label>
                      </div>
                    )}

                    {makeRecurring && (
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="frequency" className="block text-xs font-medium text-gray-700 mb-1">
                              Frequency
                            </label>
                            <select
                              id="frequency"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                              value={frequency}
                              onChange={(e) => setFrequency(e.target.value)}
                            >
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="BIWEEKLY">Bi-weekly</option>
                              <option value="MONTHLY">Monthly</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              id="startDate"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={minDate}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            id="description"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Monthly rent payment"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                        {availableBanks.map(bank => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`border rounded-lg p-3 flex flex-col items-center transition-all ${
                              selectedBank === bank.id 
                                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="h-12 w-12 mb-2 rounded flex items-center justify-center overflow-hidden">
                              {bank.logo ? (
                                <img 
                                  src={bank.logo} 
                                  alt={bank.name} 
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/40x40?text=Bank';
                                  }}
                                />
                              ) : (
                                <Building2 className="h-8 w-8 text-blue-500" />
                              )}
                            </div>
                            <span className="text-xs text-center font-medium">{bank.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="Enter account holder's name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Description</label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="e.g. Invoice #1234 or Rent Payment"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">This reference will appear on the recipient's statement</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <p className="text-gray-400"><b>MK</b></p>
                        </div>
                        <input
                          type="number"
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                          placeholder="0.00"
                          value={amount}
                          onChange={handleAmountChange}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {amount && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          Transaction Fee ({(TRANSFER_FEE_PERCENTAGE * 100).toFixed()}%): 
                          <span className="font-medium"> MK{transactionFee.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-700 font-bold mt-1">
                          Total Cost: <span className="text-[#8928A4]">MK{totalDeduction.toFixed(2)}</span>
                        </p>
                      </div>
                    )}                    {error && (
                      <div className="p-2 bg-red-50 text-red-500 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
                      disabled={!!error || !bankSelected || !accountNumber || parseFloat(amount) <= 0 || parseFloat(amount) > PAYMENT_GATEWAY_LIMIT}
                    >
                      Send to Bank Account
                    </button>
                  </form>
                )}

                {paymentMethod === 'mobile_money' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Mobile Money Provider</label>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        {mobileProviders.map(provider => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => setMobileProvider(provider.id)}
                            className={`border rounded-lg p-3 flex flex-col items-center transition-all ${
                              mobileProvider === provider.id 
                                ? 'border-green-500 bg-green-50 shadow-sm' 
                                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <div className="h-14 w-14 mb-2 rounded flex items-center justify-center overflow-hidden">
                              {provider.logo ? (
                                <img 
                                  src={provider.logo} 
                                  alt={provider.name} 
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/48x48?text=Mobile';
                                  }}
                                />
                              ) : (
                                <Smartphone className="h-10 w-10 text-green-500" />
                              )}
                            </div>
                            <span className="text-sm text-center font-medium">{provider.name}</span>
                            <span className="text-xs text-center text-gray-500">{provider.country}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="Enter mobile number (e.g. 0991234567)"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">Format: Numbers should start with 09 or 08</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Description</label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="e.g. Payment for goods"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">This reference will appear in the recipient's notifications</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <p className="text-gray-400"><b>MK</b></p>
                        </div>
                        <input
                          type="number"
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                          placeholder="0.00"
                          value={amount}
                          onChange={handleAmountChange}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {amount && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          Transaction Fee ({(TRANSFER_FEE_PERCENTAGE * 100).toFixed()}%): 
                          <span className="font-medium"> MK{transactionFee.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-700 font-bold mt-1">
                          Total Cost: <span className="text-[#8928A4]">MK{totalDeduction.toFixed(2)}</span>
                        </p>
                      </div>
                    )}                    {error && (
                      <div className="p-2 bg-red-50 text-red-500 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
                      disabled={!!error || !mobileProvider || !mobileNumber || parseFloat(amount) <= 0 || parseFloat(amount) > PAYMENT_GATEWAY_LIMIT}
                    >
                      Send to Mobile Money
                    </button>
                  </form>
                )}

                {paymentMethod === 'external_wallet' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                        placeholder="Enter recipient email"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <p className="text-gray-400"><b>MK</b></p>
                        </div>
                        <input
                          type="number"
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                          placeholder="0.00"
                          value={amount}
                          onChange={handleAmountChange}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {amount && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          Transaction Fee ({(TRANSFER_FEE_PERCENTAGE * 100).toFixed()}%): 
                          <span className="font-medium"> MK{transactionFee.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-700 font-bold mt-1">
                          Total Cost: <span className="text-[#8928A4]">MK{totalDeduction.toFixed(2)}</span>
                        </p>
                      </div>
                    )}

                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      <p className="text-sm font-medium text-yellow-800 mb-1">External Wallet Payment</p>
                      <p className="text-xs text-yellow-700">
                        You'll be redirected to our secure payment gateway to complete this transaction using your preferred external wallet.
                      </p>
                    </div>                    {error && (
                      <div className="p-2 bg-red-50 text-red-500 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
                      disabled={!!error || parseFloat(amount) <= 0 || parseFloat(amount) > PAYMENT_GATEWAY_LIMIT}
                    >
                      Continue to Payment Gateway
                    </button>
                  </form>
                )}
              </div>
            )}
        </div>
        )}

        <QRScannerModal
          show={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanResult={handleScanResult}
          handleImageUpload={handleImageUpload}
        />

        <ConfirmationModal
          show={showConfirmation}
          receiver={receiver}
          receiverUsername={receiverUsername}
          onConfirm={confirmQrCode}
          onCancel={cancelQrCode}
          isLoading={fetchingUsername}
        />

        <SuccessModal
          show={showSuccessPopup}
          amount={amount}
          receiver={receiver}
          receiverUsername={receiverUsername}
          onClose={handlePopupClose}
          isRecurring={makeRecurring}
        />
      </div>
    </div>
  );
};

export default SendMoney;