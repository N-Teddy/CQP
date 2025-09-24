// src/controllers/reservationController.js
const { Reservation, Book, Loan } = require('../models');
const { Op } = require('sequelize');

const createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if book is available (no need to reserve available books)
    if (book.availableCopies > 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is available, you can borrow it directly'
      });
    }

    // Check if user already has a reservation for this book
    const existingReservation = await Reservation.findOne({
      where: { userId, bookId, status: 'pending' }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have a reservation for this book'
      });
    }

    // Check if user already has this book on loan
    const existingLoan = await Loan.findOne({
      where: { userId, bookId, status: 'active' }
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have this book on loan'
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      userId,
      bookId
    });

    const reservationWithDetails = await Reservation.findByPk(reservation.id, {
      include: ['book', 'user']
    });

    // Get position in queue
    const position = await Reservation.count({
      where: {
        bookId,
        status: 'pending',
        createdAt: { [Op.lte]: reservation.createdAt }
      }
    });

    res.status(201).json({
      success: true,
      reservation: reservationWithDetails,
      queuePosition: position
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;

    const reservation = await Reservation.findOne({
      where: { id: reservationId, userId }
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.status !== 'pending' && reservation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this reservation'
      });
    }

    await reservation.update({ status: 'cancelled' });

    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await Reservation.findAll({
      where: {
        userId,
        status: { [Op.in]: ['pending', 'available'] }
      },
      include: ['book'],
      order: [['createdAt', 'DESC']]
    });

    // Add queue position for each reservation
    const reservationsWithPosition = await Promise.all(
      reservations.map(async (reservation) => {
        const position = await Reservation.count({
          where: {
            bookId: reservation.bookId,
            status: 'pending',
            createdAt: { [Op.lte]: reservation.createdAt }
          }
        });

        return {
          ...reservation.toJSON(),
          queuePosition: position
        };
      })
    );

    res.json({ success: true, reservations: reservationsWithPosition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createReservation,
  cancelReservation,
  getUserReservations
};