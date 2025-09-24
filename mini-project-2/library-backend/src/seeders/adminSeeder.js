// src/seeders/adminSeeder.js
require('dotenv').config();
const { User, Book } = require('../models');
const sequelize = require('../config/database');

const seedAdmin = async () => {
  try {
    await sequelize.sync({ alter: true });

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@library.com' } });

    if (!adminExists) {
      const admin = await User.create({
        email: 'teddy.webdev@gmail.com',
        password: 'admin123', // Change this in production
        firstName: 'Ngangman',
        lastName: 'Teddy',
        role: 'admin',
        phone: '123456789',
        address: 'Library HQ'
      });

      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Seed some sample books
    const sampleBooks = [
      {
        isbn: '9780439139601',
        title: 'Harry Potter and the Goblet of Fire',
        author: 'J.K. Rowling',
        genre: 'Fantasy',
        publisher: 'Scholastic',
        publicationYear: 2000,
        description: 'The fourth book in the Harry Potter series',
        totalCopies: 5,
        availableCopies: 5,
        location: 'A1-B2'
      },
      {
        isbn: '9780261102385',
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        publisher: 'HarperCollins',
        publicationYear: 1991,
        description: 'Epic fantasy trilogy',
        totalCopies: 3,
        availableCopies: 3,
        location: 'A2-C3'
      },
      {
        isbn: '9780141439518',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        publisher: 'Penguin Classics',
        publicationYear: 2003,
        description: 'Classic romance novel',
        totalCopies: 4,
        availableCopies: 4,
        location: 'B1-A4'
      }
    ];

    for (const bookData of sampleBooks) {
      const existingBook = await Book.findOne({ where: { isbn: bookData.isbn } });
      if (!existingBook) {
        await Book.create(bookData);
        console.log(`Book created: ${bookData.title}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();