// src/jobs/scheduledTasks.js
const { Loan, User, Book, Reservation } = require('../models');
const { Op } = require('sequelize');
const { sendDueDateReminder, sendReservationAvailable } = require('../services/emailService');

const calculateDailyFines = async () => {
  try {
    console.log('Calculating daily fines...');
    
    const overdueLoans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      },
      include: ['user']
    });

    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
      const dailyFine = parseInt(process.env.FINE_PER_DAY);
      const totalFine = daysOverdue * dailyFine;

      // Update loan fine
      await loan.update({ fine: totalFine, status: 'overdue' });

      // Update user's fine balance
      const user = loan.user;
      await user.update({ fineBalance: user.fineBalance + dailyFine });
    }

    console.log(`Processed ${overdueLoans.length} overdue loans`);
  } catch (error) {
    console.error('Error calculating fines:', error);
  }
};

const sendDueDateReminders = async () => {
  try {
    console.log('Sending due date reminders...');
    
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    const upcomingDueLoans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.gte]: new Date(),
          [Op.lte]: reminderDate
        }
      },
      include: ['user', 'book']
    });

    for (const loan of upcomingDueLoans) {
      await sendDueDateReminder(loan.user, loan, loan.book);
    }

    console.log(`Sent ${upcomingDueLoans.length} reminder emails`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};

const checkExpiredReservations = async () => {
  try {
    console.log('Checking expired reservations...');
    
    const expiredReservations = await Reservation.findAll({
      where: {
        status: 'available',
        expiryDate: { [Op.lt]: new Date() }
      }
    });

    for (const reservation of expiredReservations) {
      await reservation.update({ status: 'cancelled' });
      
      // Check for next reservation in queue
      const nextReservation = await Reservation.findOne({
        where: {
          bookId: reservation.bookId,
          status: 'pending'
        },
        order: [['createdAt', 'ASC']],
        include: ['user', 'book']
      });

      if (nextReservation) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(process.env.RESERVATION_HOLD_DAYS));
        
        await nextReservation.update({
          status: 'available',
          expiryDate
        });

        await sendReservationAvailable(nextReservation.user, nextReservation.book);
      }
    }

    console.log(`Processed ${expiredReservations.length} expired reservations`);
  } catch (error) {
    console.error('Error checking expired reservations:', error);
  }
};

module.exports = {
  calculateDailyFines,
  sendDueDateReminders,
  checkExpiredReservations
};