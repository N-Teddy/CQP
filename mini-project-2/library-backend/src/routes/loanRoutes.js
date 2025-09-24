// src/routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  borrowBook,
  returnBook,
  renewLoan,
  getUserLoans
} = require('../controllers/loanController');

router.post('/borrow', protect, borrowBook);
router.post('/return/:loanId', protect, returnBook);
router.post('/renew/:loanId', protect, renewLoan);
router.get('/my-loans', protect, getUserLoans);

module.exports = router;