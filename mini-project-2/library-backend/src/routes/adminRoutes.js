// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getOverdueLoans,
  waiveFine
} = require('../controllers/adminController');

router.use(protect, admin); // All admin routes require authentication and admin role

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/overdue-loans', getOverdueLoans);
router.post('/fines/waive/:userId', waiveFine);

module.exports = router;