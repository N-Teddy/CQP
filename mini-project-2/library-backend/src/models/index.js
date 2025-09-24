// src/models/index.js
const User = require('./User');
const Book = require('./Book');
const Loan = require('./Loan');
const Reservation = require('./Reservation');

// Associations
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Book.hasMany(Loan, { foreignKey: 'bookId', as: 'loans' });
Loan.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Book.hasMany(Reservation, { foreignKey: 'bookId', as: 'reservations' });
Reservation.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  User,
  Book,
  Loan,
  Reservation
};