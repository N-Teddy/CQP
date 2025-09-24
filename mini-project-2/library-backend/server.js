// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const sequelize = require('./src/config/database');
const { calculateDailyFines, sendDueDateReminders } = require('./src/jobs/scheduledTasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/books', require('./src/routes/bookRoutes'));
app.use('/api/loans', require('./src/routes/loanRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Schedule jobs
// Run every day at midnight to calculate fines
cron.schedule('0 0 * * *', calculateDailyFines);

// Run every day at 9 AM to send reminder emails
cron.schedule('0 9 * * *', sendDueDateReminders);

const PORT = process.env.PORT || 5000;

// Database sync and server start
sequelize.sync({ alter: true }).then(() => {
  console.log('Database connected and synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to database:', err);
});