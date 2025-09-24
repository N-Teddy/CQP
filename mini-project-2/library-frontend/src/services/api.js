// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Books
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (book) => api.post('/books', book),
  update: (id, book) => api.put(`/books/${id}`, book),
  delete: (id) => api.delete(`/books/${id}`),
};

// Loans
export const loansAPI = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  returnBook: (loanId) => api.post(`/loans/return/${loanId}`),
  renew: (loanId) => api.post(`/loans/renew/${loanId}`),
  getUserLoans: () => api.get('/loans/my-loans'),
};

// Reservations
export const reservationsAPI = {
  create: (bookId) => api.post('/reservations', { bookId }),
  cancel: (id) => api.delete(`/reservations/${id}`),
  getUserReservations: () => api.get('/reservations/my-reservations'),
};

// Users
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getFines: () => api.get('/users/fines'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOverdueLoans: () => api.get('/admin/overdue-loans'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
};

export default api;