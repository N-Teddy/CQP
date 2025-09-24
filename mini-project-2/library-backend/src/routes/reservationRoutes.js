// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReservation,
  cancelReservation,
  getUserReservations
} = require('../controllers/reservationController');

router.post('/', protect, createReservation);
router.delete('/:reservationId', protect, cancelReservation);
router.get('/my-reservations', protect, getUserReservations);

module.exports = router;