// apiService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const fetchTransactions = async () => {
  return await axios.get(`${API_URL}/transactions/`); // Adjust if you have a specific endpoint for transactions.
};

export const withdraw = async (email: string, amount: number) => {
  return await axios.post(`${API_URL}/witdr/`, { email, amount });
};

export const deposit = async (email: string, amount: number) => {
  return await axios.post(`${API_URL}/dpt/`, { email, amount });
};

export const sendMoney = async (email: string, amount: number) => {
  return await axios.post(`${API_URL}/str/`, { email, amount });
};