// src/services/api.js (Updated with admin endpoints)
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
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getByGenre: (genre) => api.get('/books/genre', { params: { genre } }),
};

// Loans
export const loansAPI = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  returnBook: (loanId) => api.post(`/loans/return/${loanId}`),
  renew: (loanId) => api.post(`/loans/renew/${loanId}`),
  getUserLoans: () => api.get('/loans/my-loans'),
  getAllLoans: () => api.get('/loans'), // Admin only
  getLoanById: (id) => api.get(`/loans/${id}`),
};

// Reservations
export const reservationsAPI = {
  create: (bookId) => api.post('/reservations', { bookId }),
  cancel: (id) => api.delete(`/reservations/${id}`),
  getUserReservations: () => api.get('/reservations/my-reservations'),
  getAllReservations: () => api.get('/reservations'), // Admin only
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
};

// Users
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getFines: () => api.get('/users/fines'),
  payFine: (amount) => api.post('/users/pay-fine', { amount }),
  getHistory: () => api.get('/users/history'),
};

// Admin
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
  getReports: (params) => api.get('/admin/reports', { params }),

  // Loans Management
  getAllLoans: () => api.get('/admin/loans'),
  getOverdueLoans: () => api.get('/admin/overdue-loans'),
  markAsReturned: (loanId) => api.post(`/admin/loans/${loanId}/return`),
  extendLoan: (loanId, days) => api.post(`/admin/loans/${loanId}/extend`, { days }),

  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  suspendUser: (userId, reason) => api.post(`/admin/users/${userId}/suspend`, { reason }),
  activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),

  // Fines Management
  getAllFines: () => api.get('/admin/fines'),
  waiveFine: (userId, amount) => api.post(`/admin/fines/${userId}/waive`, { amount }),

  // Notifications
  sendNotification: (userId, message) => api.post('/admin/notifications', { userId, message }),
  sendBulkNotification: (message) => api.post('/admin/notifications/bulk', { message }),

  // Import/Export
  exportData: (type) => api.get(`/admin/export/${type}`, { responseType: 'blob' }),
  importBooks: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/import/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default api;
