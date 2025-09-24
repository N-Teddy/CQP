// src/controllers/bookController.js
const { Book, Loan, Reservation } = require('../models');
const { Op } = require('sequelize');

const getBooks = async (req, res) => {
  try {
    const { search, genre, available, page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (genre) {
      where.genre = genre;
    }

    if (available === 'true') {
      where.availableCopies = { [Op.gt]: 0 };
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['title', 'ASC']]
    });

    res.json({
      success: true,
      books,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalBooks: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        {
          model: Loan,
          as: 'loans',
          where: { status: 'active' },
          required: false,
          include: ['user']
        },
        {
          model: Reservation,
          as: 'reservations',
          where: { status: 'pending' },
          required: false
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createBook = async (req, res) => {
  try {
    const bookData = req.body;

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ where: { isbn: bookData.isbn } });
    if (existingBook) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
    }

    if (req.file) {
      bookData.coverImage = `/uploads/${req.file.filename}`;
    }

    const book = await Book.create(bookData);
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (req.file) {
      req.body.coverImage = `/uploads/${req.file.filename}`;
    }

    await book.update(req.body);
    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if book has active loans
    const activeLoans = await Loan.count({
      where: { bookId: book.id, status: 'active' }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active loans'
      });
    }

    await book.destroy();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};