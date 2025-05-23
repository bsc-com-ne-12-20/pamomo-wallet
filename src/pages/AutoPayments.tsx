import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Crown, User, Building2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Import components
import AutoPaymentForm from '../components/autopayments/AutoPaymentForm';
import AutoPaymentsList from '../components/autopayments/AutoPaymentsList';
import ServiceProviderView, { ServiceProvider } from '../components/autopayments/ServiceProviderView';
import PaymentHistoryModal from '../components/autopayments/PaymentHistoryModal';

interface AutoPaymentsProps {
  username: string;
  onLogout: () => void;
}

interface AutoPayment {
  id: string;
  recipient_email: string;
  recipient_name: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  next_payment_date: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  last_payment_date?: string;
  last_payment_status?: string;
  recipient_type?: 'personal' | 'service';
  service_provider?: string;
}

interface PaymentHistoryItem {
  id: string;
  auto_payment_id: string;
  recipient_email: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  timestamp: string;
}

type RecipientType = 'personal' | 'service';

const AutoPayments: React.FC<AutoPaymentsProps> = ({ username, onLogout }) => {
  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showRecipientTypeSelection, setShowRecipientTypeSelection] = useState(true);
  const [selectedRecipientType, setSelectedRecipientType] = useState<RecipientType | null>(null);
  const [showServiceProviders, setShowServiceProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [navigationStack, setNavigationStack] = useState<string[]>(['initial']);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  const navigate = useNavigate();

  // Debug interceptor for API calls
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
      },
      error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    const responseInterceptor = axios.interceptors.response.use(
      response => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      error => {
        console.error(`❌ Response Error: ${error.response?.status} ${error.config.url}`, 
                      error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Fetch user's auto payments
  useEffect(() => {
    const fetchAutoPayments = async () => {
      try {
        const email = localStorage.getItem('email');
        if (!email) {
          setError('Authentication required: Please log in to view your auto payments');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/autopayments/?email=${email}`);
        console.log('Auto payments fetched:', response.data);
        setAutoPayments(response.data);
      } catch (err: any) {
        console.error('Failed to fetch auto payments:', err.response || err);
        setError(err.response?.data?.message || 'Failed to fetch auto payments');
      } finally {
        setLoading(false);
      }
    };

    fetchAutoPayments();
  }, []);

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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const endpoint = newStatus === 'ACTIVE' ? 'resume' : 'pause';
      
      const response = await axios.post(`${API_BASE_URL}/autopayments/${id}/${endpoint}/`);
      
      if (response.status === 200) {
        setAutoPayments(autoPayments.map(payment => 
          payment.id === id ? { ...payment, status: newStatus as 'ACTIVE' | 'PAUSED' } : payment
        ));
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update auto payment status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this auto payment?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/autopayments/${id}/`);
      
      if (response.status === 200) {
        setAutoPayments(autoPayments.filter(payment => payment.id !== id));
      }
    } catch (err: any) {
      console.error('Failed to delete auto payment:', err.response || err);
      setError(err.response?.data?.message || 'Failed to delete auto payment');
    }
  };

  const fetchPaymentHistory = async (paymentId: string) => {
    setLoadingHistory(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/autopayments/${paymentId}/history/`);
      if (response.status === 200) {
        setPaymentHistory(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err.response || err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleShowHistory = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    fetchPaymentHistory(paymentId);
  };

  const handleRecipientTypeSelect = (type: RecipientType) => {
    setSelectedRecipientType(type);
    setShowRecipientTypeSelection(false);
    if (type === 'service') {
      setShowServiceProviders(true);
      setNavigationStack([...navigationStack, 'service-providers']);
    } else {
      setShowCreateForm(true);
      setNavigationStack([...navigationStack, 'personal-form']);
    }
  };

  const handleBackToSelection = () => {
    const newStack = [...navigationStack];
    const lastScreen = newStack.pop();
    setNavigationStack(newStack);
    
    const currentScreen = newStack[newStack.length - 1];
    
    if (currentScreen === 'initial') {
      setSelectedRecipientType(null);
      setShowRecipientTypeSelection(true);
      setShowServiceProviders(false);
      setShowCreateForm(false);
      setSelectedProvider(null);
      setSelectedServiceType(null);
    } else if (currentScreen === 'service-providers') {
      setShowServiceProviders(true);
      setShowCreateForm(false);
      setSelectedProvider(null);
      setSelectedServiceType(null);
    } else if (currentScreen === 'service-type') {
      setShowServiceProviders(true);
      setSelectedProvider(null);
      setShowCreateForm(false);
    }
  };

  const handleServiceProviderSelect = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowServiceProviders(false);
    setShowCreateForm(true);
    setNavigationStack([...navigationStack, 'provider-form']);
  };
  
  const handleServiceTypeSelect = (serviceType: string | null) => {
    if (serviceType === null) {
      setSelectedServiceType(null);
    } else {
      setSelectedServiceType(serviceType);
      setNavigationStack([...navigationStack, 'service-type']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        {/* Premium feature banner */}
        {subscription && subscription.plan !== 'PREMIUM' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <div className="mr-3 p-2 bg-yellow-100 rounded-full">
              <Crown size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Auto payments are exclusively available for Premium subscribers
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Upgrade to Premium to set up recurring automatic payments and never miss a bill payment again.
                <button 
                  onClick={() => navigate('/subscription')}
                  className="ml-1 text-[#8928A4] hover:underline"
                >
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Auto Payments</h2>
          </div>
          
          {error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
              {error}
            </div>
          ) : (
            <>
              {subscription && subscription.plan === 'PREMIUM' ? (
                <>
                  {/* Initial Selection View */}
                  {showRecipientTypeSelection && (
                    <>
                      <div className="max-w-md mx-auto">
                        <p className="text-center text-gray-600 mb-6">Choose payment recipient type</p>
                        
                        <div className="space-y-4">
                          <button
                            onClick={() => handleRecipientTypeSelect('personal')}
                            className="w-full bg-white border-2 border-[#8928A4] p-6 rounded-lg flex items-center text-left hover:bg-[#f9f0fc] transition-colors"
                          >
                            <div className="p-3 bg-[#f9f0fc] rounded-full mr-4">
                              <User className="h-8 w-8 text-[#8928A4]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">Personal Account</h3>
                              <p className="text-sm text-gray-500">Send recurring payments to individuals</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => handleRecipientTypeSelect('service')}
                            className="w-full bg-white border-2 border-gray-300 p-6 rounded-lg flex items-center text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="p-3 bg-gray-100 rounded-full mr-4">
                              <Building2 className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">Service Provider</h3>
                              <p className="text-sm text-gray-500">Pay recurring bills and subscriptions</p>
                            </div>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="font-medium text-lg text-gray-800 mb-4">Your Current Auto Payments</h3>
                        <AutoPaymentsList 
                          payments={autoPayments}
                          loading={loading}
                          subscription={subscription}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                          onShowHistory={handleShowHistory}
                        />
                      </div>
                    </>
                  )}

                  {/* Service Provider Selection View */}
                  {showServiceProviders && (
                    <>
                      <ServiceProviderView 
                        onBack={handleBackToSelection}
                        onSelectProvider={handleServiceProviderSelect}
                        onServiceTypeSelect={handleServiceTypeSelect}
                        selectedServiceType={selectedServiceType}
                      />
                      
                      <div className="mt-8">
                        <h3 className="font-medium text-lg text-gray-800 mb-4">Your Current Auto Payments</h3>
                        <AutoPaymentsList 
                          payments={autoPayments}
                          loading={loading}
                          subscription={subscription}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                          onShowHistory={handleShowHistory}
                        />
                      </div>
                    </>
                  )}

                  {/* Personal Payment Form or Provider-specific Form */}
                  {showCreateForm && (
                    <div>
                      <div className="mb-6">
                        <button 
                          onClick={handleBackToSelection}
                          className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
                        >
                          <ArrowLeft size={20} className="mr-2" />
                          {navigationStack[navigationStack.length - 2] === 'service-type' 
                            ? 'Back to Providers' 
                            : 'Back to Selection'}
                        </button>
                        <h3 className="font-medium text-lg text-gray-800 mt-4">
                          {selectedProvider 
                            ? `Set Up ${selectedProvider.name} Auto Payment` 
                            : "Set Up Personal Auto Payment"}
                        </h3>
                      </div>

                      <AutoPaymentForm 
                        onSubmit={(newPayment) => {
                          setAutoPayments([...autoPayments, newPayment]);
                          setShowCreateForm(false);
                          setShowRecipientTypeSelection(true);
                          setSelectedProvider(null);
                          setSelectedServiceType(null);
                          setNavigationStack(['initial']);
                        }}
                        onCancel={() => {
                          handleBackToSelection();
                        }}
                        subscription={subscription}
                        recipientType={selectedRecipientType || 'personal'}
                        initialEmail={selectedProvider?.email || ''}
                        initialProvider={selectedProvider?.name}
                        serviceType={selectedServiceType}
                      />
                      
                      <div className="mt-8">
                        <h3 className="font-medium text-lg text-gray-800 mb-4">Your Current Auto Payments</h3>
                        <AutoPaymentsList 
                          payments={autoPayments}
                          loading={loading}
                          subscription={subscription}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                          onShowHistory={handleShowHistory}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <div className="flex flex-col items-center">
                    <Crown size={32} className="text-yellow-500 mb-2" />
                    <p className="text-gray-500">Auto payments are a Premium feature.</p>
                    <button 
                      onClick={() => navigate('/subscription')}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-[#8928A4] text-white rounded-md shadow hover:from-purple-700 hover:to-[#7a2391] transition-all"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">About Auto Payments</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-[#8928A4]">What are auto payments?</h4>
              <p className="text-gray-600 mt-1">
                Auto payments allow you to schedule recurring transfers to the same recipient automatically. This is perfect for regular payments like rent, subscriptions, or allowances.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">How are payments processed?</h4>
              <p className="text-gray-600 mt-1">
                On the scheduled date, we automatically process the payment from your Pamomo wallet balance to the recipient. Make sure you have sufficient funds available.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">What if my wallet doesn't have enough funds?</h4>
              <p className="text-gray-600 mt-1">
                If your wallet has insufficient balance, the auto payment will fail. You'll receive a notification when this happens, and the payment will be attempted again the next day.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Crown size={18} className="text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-800">Premium Feature</h4>
              </div>
              <p className="text-purple-700 text-sm">
                Auto Payments is exclusively available to Premium subscribers. This feature helps you automate your recurring payments, saving you time and ensuring you never miss important payments.
              </p>
            </div>
          </div>
        </div>

        {/* Payment History Modal */}
        {selectedPaymentId && (
          <PaymentHistoryModal
            onClose={() => setSelectedPaymentId(null)}
            loading={loadingHistory}
            history={paymentHistory}
          />
        )}
      </div>
    </div>
  );
};

export default AutoPayments;