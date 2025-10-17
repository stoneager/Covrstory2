import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_LOGIN_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  sendCode: (email) => api.post('/auth/send-code', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  registerEmail: (data) => api.post('/auth/register-email', data),
  loginEmail: (credentials) => api.post('/auth/login-email', credentials),
};

export default api;