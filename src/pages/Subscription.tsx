import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Star, Clock } from 'lucide-react';
import axios from 'axios';
// Import constants
import { 
  TRANSACTION_LIMITS,
  API_BASE_URL
} from '../utils/constants';

interface SubscriptionProps {
  username: string;
  onLogout: () => void;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  frequency: string;
  features: string[];
  limits: string;
  recommended?: boolean;
}

interface SubscriptionDetails {
  plan: string;
  period: string;
  status: string;
  expiry_date: string;
  auto_renew: boolean;
  current_balance?: number;
}

interface PaymentHistoryItem {
  plan: string;
  plan_display: string;
  period: string;
  period_display: string;
  amount: number;
  timestamp: string;
}

interface SubscriptionResponse {
  message: string;
  plan: string;
  period: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  current_balance: number;
  proration_refund: number;
  amount_charged: number;
}

const Subscription: React.FC<SubscriptionProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [subscriptionResponse, setSubscriptionResponse] = useState<SubscriptionResponse | null>(null);
  const [showSubscriptionReceipt, setShowSubscriptionReceipt] = useState<boolean>(false);

  // Subscription plans data - now using TRANSACTION_LIMITS from constants
  const plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      frequency: billingCycle,
      features: [
        `MWK${TRANSACTION_LIMITS.FREE.toLocaleString()} limit per transaction`,
        'Basic account features',
        'Standard support'
      ],
      limits: `MWK${TRANSACTION_LIMITS.FREE.toLocaleString()} per transaction`
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: billingCycle === 'MONTHLY' ? 1500 : 15000,
      frequency: billingCycle,
      features: [
        `MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()} limit per transaction`,
        'Transaction Insights',
        'Priority customer support',
        'Reduced transaction fees'
      ],
      limits: `MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()} per transaction`,
      recommended: true
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: billingCycle === 'MONTHLY' ? 2500 : 25000,
      frequency: billingCycle,
      features: [
        'Unlimited transaction amounts',
        'Advanced Transaction Insights',
        'Free agent Account',
        'No transaction fees',
        'VIP customer support'
      ],
      limits: 'Unlimited'
    }
  ];

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      if (!email) {
        setError('Authentication required: Please log in to view your subscription details');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/subscriptions/check-subscription/`, {
        email
      });

      if (response.status === 200) {
        const data = response.data;
        setSubscriptionDetails(data);
        setSelectedPlan(data.plan);
        
        // Set the billing cycle based on current subscription
        if (data.period) {
          setBillingCycle(data.period as 'MONTHLY' | 'YEARLY');
        }
        
        // Set auto-renew status
        setAutoRenew(data.auto_renew || false);
      }
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      // Default to free plan if fetch fails
      setSubscriptionDetails({
        plan: 'FREE',
        period: 'LIFETIME',
        status: 'ACTIVE',
        expiry_date: 'NEVER',
        auto_renew: false
      });
      setSelectedPlan('FREE');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const email = localStorage.getItem('email');
      if (!email) return;

      const response = await axios.get(`${API_BASE_URL}/subscriptions/payment-history/?email=${email}`);

      if (response.status === 200) {
        // Extract payment_history array from the response
        setPaymentHistory(response.data.payment_history || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowSubscriptionReceipt(false);  // Hide receipt when selecting a new plan
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || (subscriptionDetails && selectedPlan === subscriptionDetails.plan && billingCycle === subscriptionDetails.period)) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSubscriptionResponse(null);

    try {
      const email = localStorage.getItem('email');
      
      // Call subscription API using the endpoint from the test script
      const response = await axios.post(`${API_BASE_URL}/subscriptions/subscribe/`, {
        email,
        plan: selectedPlan,
        period: billingCycle,
        auto_renew: autoRenew
      });

      if (response.status === 200) {
        const data = response.data as SubscriptionResponse;
        setSubscriptionResponse(data);
        setSuccess(data.message || `Successfully updated to ${selectedPlan} plan!`);
        
        // Update local subscription details
        setSubscriptionDetails({
          plan: data.plan,
          period: data.period,
          status: 'ACTIVE',
          expiry_date: data.end_date,
          auto_renew: data.auto_renew,
          current_balance: data.current_balance
        });

        // Show receipt
        setShowSubscriptionReceipt(true);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setError(error.response?.data?.message || 'Failed to update subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBillingCycle = () => {
    setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY');
    setShowSubscriptionReceipt(false);
  };

  const toggleAutoRenew = () => {
    setAutoRenew(!autoRenew);
    setShowSubscriptionReceipt(false);
  };

  const togglePaymentHistory = () => {
    if (!showPaymentHistory && paymentHistory.length === 0) {
      fetchPaymentHistory();
    }
    setShowPaymentHistory(!showPaymentHistory);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'NEVER') return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Not specified';
      }
      
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
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

        {/* Subscription receipt/confirmation */}
        {showSubscriptionReceipt && subscriptionResponse && (
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-2">{subscriptionResponse.message}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan: <span className="font-medium text-gray-800">{subscriptionResponse.plan}</span></p>
                    <p className="text-gray-600">Period: <span className="font-medium text-gray-800">{subscriptionResponse.period}</span></p>
                    <p className="text-gray-600">Auto-renew: <span className="font-medium text-gray-800">{subscriptionResponse.auto_renew ? 'Yes' : 'No'}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date: <span className="font-medium text-gray-800">{formatDate(subscriptionResponse.start_date)}</span></p>
                    <p className="text-gray-600">End Date: <span className="font-medium text-gray-800">{formatDate(subscriptionResponse.end_date)}</span></p>
                    <p className="text-gray-600">Current Balance: <span className="font-medium text-gray-800">MWK {subscriptionResponse.current_balance.toLocaleString()}</span></p>
                  </div>
                </div>
                {subscriptionResponse.amount_charged > 0 && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <p className="text-gray-600">Amount Charged: <span className="font-bold text-[#8928A4]">MWK {subscriptionResponse.amount_charged.toLocaleString()}</span></p>
                    {subscriptionResponse.proration_refund > 0 && (
                      <p className="text-gray-600">Proration Refund: <span className="font-medium text-green-700">MWK {subscriptionResponse.proration_refund.toLocaleString()}</span></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {subscriptionDetails && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Current Subscription</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Plan</p>
                <p className="text-lg font-medium text-[#8928A4]">{subscriptionDetails.plan}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Billing Period</p>
                <p className="text-lg font-medium text-[#8928A4]">{subscriptionDetails.period}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Auto-renewal</p>
                <div className="flex items-center">
                  {subscriptionDetails.auto_renew ? (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-1 text-green-500" />
                      <p className="text-lg font-medium text-green-600">Enabled</p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle size={16} className="mr-1 text-red-500" />
                      <p className="text-lg font-medium text-red-600">Disabled</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Expires On</p>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-gray-500" />
                  <p className="text-lg font-medium text-gray-700">
                    {formatDate(subscriptionDetails.expiry_date)}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={togglePaymentHistory} 
              className="mt-4 text-sm text-[#8928A4] hover:underline flex items-center"
            >
              {showPaymentHistory ? 'Hide payment history' : 'View payment history'}
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
        )}

        {showPaymentHistory && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Payment History</h2>
            {loadingHistory ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-6 w-6 mx-auto text-[#8928A4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading payment history...</p>
              </div>
            ) : paymentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{formatDate(payment.timestamp)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{payment.plan_display}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{payment.period_display}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">MWK {payment.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">No payment history found.</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a Plan</h2>
          <p className="text-sm text-gray-600 mb-6">
            Select the right plan that suits your transaction needs
          </p>

          {/* Billing cycle toggle */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#8928A4] text-white'
                    : 'text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  billingCycle === 'YEARLY'
                    ? 'bg-[#8928A4] text-white'
                    : 'text-gray-700'
                }`}
              >
                Yearly <span className="text-xs text-green-500 font-medium">(Save 16%)</span>
              </button>
            </div>

            {/* Auto-renewal toggle */}
            {selectedPlan !== 'FREE' && (
              <div className="flex items-center gap-2">
                <label htmlFor="auto-renew" className="text-sm text-gray-600">
                  Auto-renew subscription
                </label>
                <div 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8928A4] focus:ring-offset-2 ${autoRenew ? 'bg-[#8928A4]' : 'bg-gray-200'}`}
                  onClick={toggleAutoRenew}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subscription plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg p-6 transition-all ${
                  selectedPlan === plan.id 
                    ? 'bg-[#f9f0fc] border-2 border-[#8928A4] shadow-lg transform scale-105' 
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                } ${plan.recommended ? 'relative' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-[#8928A4] text-white text-xs rounded-full px-3 py-1 font-medium flex items-center">
                      <Star size={12} className="mr-1" fill="white" />
                      Popular
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-bold">MWK {plan.price.toLocaleString()}</span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500">
                      /{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                
                <div className="mb-4 text-sm text-gray-600">
                  <div className="font-medium mb-2">Transaction Limit:</div>
                  <div className="bg-purple-50 py-1 px-2 rounded text-[#8928A4] font-medium text-center">
                    {plan.limits}
                  </div>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-2 px-4 rounded-md text-sm transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-[#8928A4] text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {subscriptionDetails && subscriptionDetails.plan === plan.id
                    ? 'Current Plan' 
                    : selectedPlan === plan.id
                      ? 'Selected'
                      : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {success && !showSubscriptionReceipt && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
              {success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              {selectedPlan && subscriptionDetails && selectedPlan !== subscriptionDetails.plan 
                ? `You are switching from ${subscriptionDetails.plan} to ${selectedPlan} plan.`
                : 'Select a different plan to upgrade or downgrade your subscription.'}
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading || (subscriptionDetails && selectedPlan === subscriptionDetails.plan && billingCycle === subscriptionDetails.period) || !selectedPlan}
              className={`flex items-center justify-center px-6 py-2 rounded-md text-white font-medium transition ${
                loading || (subscriptionDetails && selectedPlan === subscriptionDetails.plan && billingCycle === subscriptionDetails.period) || !selectedPlan
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#8928A4] hover:bg-[#7a2391]'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (subscriptionDetails && selectedPlan === subscriptionDetails.plan && billingCycle === subscriptionDetails.period) ? (
                'Current Plan'
              ) : selectedPlan === 'FREE' ? (
                'Subscribe to Free Plan'
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[#8928A4]">Can I change my plan later?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">How does billing work?</h4>
              <p className="text-sm text-gray-600 mt-1">
                For paid plans, you'll be charged at the beginning of each billing cycle (monthly or yearly).
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">What happens if I exceed transaction limits?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Transactions exceeding your plan's limits will be declined. Consider upgrading to a higher plan for larger transactions.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">What are Transaction Insights?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Transaction Insights provide detailed analytics and visualizations of your spending patterns, helping you make better financial decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;