// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `Library Management <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};

const sendDueDateReminder = async (user, loan, book) => {
  const dueDate = new Date(loan.dueDate).toLocaleDateString();
  const html = `
    <h2>Book Return Reminder</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>This is a reminder that the following book is due for return:</p>
    <ul>
      <li><strong>Title:</strong> ${book.title}</li>
      <li><strong>Author:</strong> ${book.author}</li>
      <li><strong>Due Date:</strong> ${dueDate}</li>
    </ul>
    <p>Please return the book on time to avoid fines.</p>
    <p>Thank you,<br>Library Management</p>
  `;

  await sendEmail(user.email, 'Book Return Reminder', html);
};

const sendReservationAvailable = async (user, book) => {
  const html = `
    <h2>Book Available for Pickup</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>Good news! The book you reserved is now available:</p>
    <ul>
      <li><strong>Title:</strong> ${book.title}</li>
      <li><strong>Author:</strong> ${book.author}</li>
    </ul>
    <p>Please collect it within ${process.env.RESERVATION_HOLD_DAYS} days.</p>
    <p>Thank you,<br>Library Management</p>
  `;

  await sendEmail(user.email, 'Reserved Book Available', html);
};

module.exports = {
  sendEmail,
  sendDueDateReminder,
  sendReservationAvailable
};