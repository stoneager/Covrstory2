import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'http://localhost:3002'; // Redirect to login app
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: (token) => api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ).toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/products/${id}`),
};

// Collections API
export const collectionsAPI = {
  getAll: () => api.get('/collections'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productQuantityId, quantity) => api.post('/cart/add', { productQuantityId, quantity }),
  update: (productQuantityId, quantity) => api.put('/cart/update', { productQuantityId, quantity }),
  remove: (productQuantityId) => api.delete(`/cart/remove/${productQuantityId}`),
  clear: () => api.delete('/cart/clear'),
};

// Checkout API
export const checkoutAPI = {
  applyCoupon: (couponCode, amount) => api.post('/checkout/apply-coupon', { couponCode, amount }),
  createOrder: (orderData) => api.post('/checkout/create-order', orderData),
};

// Payment API
export const paymentAPI = {
  createOrder: (orderData) => api.post('/payment/create-order', orderData),
  verifyPayment: (paymentData) => api.post('/payment/verify', paymentData),
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => api.get('/orders/my'),
};

// Returns API
export const returnsAPI = {
  create: (data) => api.post('/returns', data),
  getMyReturns: () => api.get('/returns/me'),
};

export default api;