// src/controllers/loanController.js
const { Loan, Book, User, Reservation } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const borrowBook = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if user has reached loan limit
    const activeLoansCount = await Loan.count({
      where: { userId, status: 'active' }
    });

    if (activeLoansCount >= process.env.MAX_BOOKS_PER_USER) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `You can only borrow up to ${process.env.MAX_BOOKS_PER_USER} books at a time` 
      });
    }

    // Check if user has outstanding fines
    const user = await User.findByPk(userId);
    if (user.fineBalance > 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Please pay your outstanding fines (${user.fineBalance} FCFA) before borrowing` 
      });
    }

    // Check if book is available
    const book = await Book.findByPk(bookId, { transaction: t });
    if (!book || book.availableCopies <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Book is not available' });
    }

    // Check if user already has this book
    const existingLoan = await Loan.findOne({
      where: { userId, bookId, status: 'active' },
      transaction: t
    });

    if (existingLoan) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'You already have this book' });
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(process.env.LOAN_DURATION_DAYS));

    // Create loan
    const loan = await Loan.create({
      userId,
      bookId,
      dueDate
    }, { transaction: t });

    // Update book availability
    await book.decrement('availableCopies', { transaction: t });

    // Check if user had a reservation for this book
    const reservation = await Reservation.findOne({
      where: { userId, bookId, status: 'pending' },
      transaction: t
    });

    if (reservation) {
      await reservation.update({ status: 'fulfilled' }, { transaction: t });
    }

    await t.commit();

    const loanWithDetails = await Loan.findByPk(loan.id, {
      include: ['book', 'user']
    });

    res.status(201).json({ success: true, loan: loanWithDetails });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const returnBook = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { loanId } = req.params;

    const loan = await Loan.findByPk(loanId, {
      include: ['book'],
      transaction: t
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status === 'returned') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    // Update loan
    await loan.update({
      returnDate: new Date(),
      status: 'returned'
    }, { transaction: t });

    // Update book availability
    await loan.book.increment('availableCopies', { transaction: t });

    // Check for reservations and notify next user
    const nextReservation = await Reservation.findOne({
      where: { bookId: loan.bookId, status: 'pending' },
      order: [['createdAt', 'ASC']],
      include: ['user'],
      transaction: t
    });

    if (nextReservation) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(process.env.RESERVATION_HOLD_DAYS));
      
      await nextReservation.update({
        status: 'available',
        expiryDate
      }, { transaction: t });

      // Send notification (simplified - in production, use email service)
      console.log(`Notification: Book "${loan.book.title}" is now available for ${nextReservation.user.email}`);
    }

    await t.commit();

    res.json({ success: true, message: 'Book returned successfully', loan });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const renewLoan = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { loanId } = req.params;

    const loan = await Loan.findByPk(loanId, {
      include: ['book'],
      transaction: t
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (loan.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cannot renew returned book' });
    }

    if (loan.renewCount >= process.env.MAX_RENEWALS) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Maximum renewal limit (${process.env.MAX_RENEWALS}) reached` 
      });
    }

    // Check if there are reservations for this book
    const reservations = await Reservation.count({
      where: { bookId: loan.bookId, status: 'pending' },
      transaction: t
    });

    if (reservations > 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot renew - other users are waiting for this book' 
      });
    }

    // Extend due date
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(process.env.LOAN_DURATION_DAYS));

    await loan.update({
      dueDate: newDueDate,
      renewCount: loan.renewCount + 1
    }, { transaction: t });

    await t.commit();

    res.json({ success: true, loan });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active' } = req.query;

    const where = { userId };
    if (status !== 'all') {
      where.status = status;
    }

    const loans = await Loan.findAll({
      where,
      include: ['book'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  renewLoan,
  getUserLoans
};