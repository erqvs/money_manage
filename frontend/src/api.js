import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 账户相关
export const getAccounts = () => api.get('/accounts');
export const getSummary = () => api.get('/summary');
export const updateBalance = (accountId, balance) => 
  api.put(`/accounts/${accountId}/balance`, { balance });

// 交易相关
export const getTransactions = (page = 1, perPage = 50) => 
  api.get('/transactions', { params: { page, per_page: perPage } });
export const getTransactionsGrouped = () => api.get('/transactions/grouped');
export const createTransaction = (data) => api.post('/transactions', data);

// 统计相关
export const getStatistics = () => api.get('/statistics');
export const getChartData = (days = 7) => api.get('/chart', { params: { days } });

export default api;

