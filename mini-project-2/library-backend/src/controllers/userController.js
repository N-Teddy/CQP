// src/controllers/userController.js
const { User, Loan, Reservation, Book } = require('../models');
const { Op } = require('sequelize');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Loan,
          as: 'loans',
          where: { status: 'active' },
          required: false,
          include: ['book']
        },
        {
          model: Reservation,
          as: 'reservations',
          where: { status: { [Op.in]: ['pending', 'available'] } },
          required: false,
          include: ['book']
        }
      ]
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    await req.user.update({
      firstName,
      lastName,
      phone,
      address
    });

    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getLoanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: loans } = await Loan.findAndCountAll({
      where: { userId },
      include: ['book'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      loans,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLoans: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getFines = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    const overdueLoans = await Loan.findAll({
      where: {
        userId,
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      },
      include: ['book']
    });

    const fineDetails = overdueLoans.map(loan => {
      const daysOverdue = Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * parseInt(process.env.FINE_PER_DAY);
      
      return {
        loanId: loan.id,
        book: loan.book,
        dueDate: loan.dueDate,
        daysOverdue,
        fine
      };
    });

    res.json({
      success: true,
      totalFine: user.fineBalance,
      fineDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLoanHistory,
  getFines
};