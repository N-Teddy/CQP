// src/models/Reservation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reservationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'available', 'cancelled', 'fulfilled'),
    defaultValue: 'pending'
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiryDate: {
    type: DataTypes.DATE
  }
});

module.exports = Reservation;