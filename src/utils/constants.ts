// Fee percentages
export let TRANSFER_FEE_PERCENTAGE = 0.00;
export let WITHDRAWAL_FEE_PERCENTAGE = 0.03;
export let DEPOSIT_FEE_PERCENTAGE = 0.03;

// Transaction limits by subscription plan
export const TRANSACTION_LIMITS = {
  FREE: 2000,
  BASIC: 100000,
  PREMIUM: Infinity
};

// API Keys
export let PAYMENT_API_KEY = 'SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T';

// API Base URLs
export let API_BASE_URL = 'https://mtima.onrender.com/api/v1';
export let PAYMENT_API_URL = 'https://api.paychangu.com';

// Try to load environment variables if they exist
try {
  // Check if import.meta.env exists (Vite style)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Vite environment variables
    if (import.meta.env.VITE_TRANSFER_FEE_PERCENTAGE) {
      TRANSFER_FEE_PERCENTAGE = parseFloat(import.meta.env.VITE_TRANSFER_FEE_PERCENTAGE);
    }
    
    if (import.meta.env.VITE_WITHDRAWAL_FEE_PERCENTAGE) {
      WITHDRAWAL_FEE_PERCENTAGE = parseFloat(import.meta.env.VITE_WITHDRAWAL_FEE_PERCENTAGE);
    }
    
    if (import.meta.env.VITE_DEPOSIT_FEE_PERCENTAGE) {
      DEPOSIT_FEE_PERCENTAGE = parseFloat(import.meta.env.VITE_DEPOSIT_FEE_PERCENTAGE);
    }
    
    // Transaction limits
    if (import.meta.env.VITE_FREE_PLAN_LIMIT) {
      TRANSACTION_LIMITS.FREE = parseInt(import.meta.env.VITE_FREE_PLAN_LIMIT);
    }
    
    if (import.meta.env.VITE_BASIC_PLAN_LIMIT) {
      TRANSACTION_LIMITS.BASIC = parseInt(import.meta.env.VITE_BASIC_PLAN_LIMIT);
    }
    
    // API Keys and URLs
    if (import.meta.env.VITE_PAYMENT_API_KEY) {
      PAYMENT_API_KEY = import.meta.env.VITE_PAYMENT_API_KEY;
    }
    
    if (import.meta.env.VITE_API_BASE_URL) {
      API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    }
    
    if (import.meta.env.VITE_PAYMENT_API_URL) {
      PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL;
    }
  }
} catch (e) {
  // If there's an error accessing environment variables, just use the defaults
  console.warn('Using default values for configuration. Environment variables not available.');
}