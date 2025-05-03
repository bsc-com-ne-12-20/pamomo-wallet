// Environment variables with fallbacks
export const ENV = {
  TRANSACTION_LIMITS: {
    FREE: import.meta.env.VITE_FREE_TRANSACTION_LIMIT || 2000,
    BASIC: import.meta.env.VITE_BASIC_TRANSACTION_LIMIT || 100000,
    PREMIUM: import.meta.env.VITE_PREMIUM_TRANSACTION_LIMIT || 1000000,
  },
  SUBSCRIPTION_PRICES: {
    BASIC_MONTHLY: import.meta.env.VITE_BASIC_MONTHLY || 1500,
    BASIC_YEARLY: import.meta.env.VITE_BASIC_YEARLY || 15000,
    PREMIUM_MONTHLY: import.meta.env.VITE_PREMIUM_MONTHLY || 2500,
    PREMIUM_YEARLY: import.meta.env.VITE_PREMIUM_YEARLY || 25000,
  },
  API_URL: import.meta.env.VITE_API_URL || 'https://mtima.onrender.com',
};