// src/controllers/adminController.js
const { User, Book, Loan, Reservation } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.count();
    const totalUsers = await User.count({ where: { role: 'user' } });
    const activeLoans = await Loan.count({ where: { status: 'active' } });
    const overdueLoans = await Loan.count({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      }
    });

    const totalFines = await User.sum('fineBalance') || 0;

    // Popular books (most borrowed)
    const popularBooks = await Book.findAll({
      attributes: [
        'id',
        'title',
        'author',
        [sequelize.fn('COUNT', sequelize.col('loans.id')), 'loanCount']
      ],
      include: [{
        model: Loan,
        as: 'loans',
        attributes: []
      }],
      group: ['Book.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('loans.id')), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        totalFines,
        popularBooks
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { role: 'user' };
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { membershipId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ status });

    res.json({ success: true, message: 'User status updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOverdueLoans = async (req, res) => {
  try {
    const overdueLoans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      },
      include: ['user', 'book'],
      order: [['dueDate', 'ASC']]
    });

    const loansWithFines = overdueLoans.map(loan => {
      const daysOverdue = Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * parseInt(process.env.FINE_PER_DAY);
      
      return {
        ...loan.toJSON(),
        daysOverdue,
        fine
      };
    });

    res.json({ success: true, loans: loansWithFines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const waiveFine = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newBalance = Math.max(0, user.fineBalance - amount);
    await user.update({ fineBalance: newBalance });

    res.json({ 
      success: true, 
      message: `Waived ${amount} FCFA from user's fines`,
      newBalance 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getOverdueLoans,
  waiveFine
};