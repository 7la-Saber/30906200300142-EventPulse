const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const Category = require('./models/Category');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await Category.deleteMany();
    await User.deleteMany();
    await Event.deleteMany();

    const categories = await Category.insertMany([
      { name: 'Music' },
      { name: 'Tech' },
      { name: 'Sports' }
    ]);


    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@eventpulse.com',
      password: 'password123', 
      role: 'admin'
    });

    await Event.create({
      title: 'Tech Conference 2026',
      description: 'The biggest tech event of the year.',
      date: new Date('2026-10-10'),
      city: 'Cairo',
      capacity: 100,
      category: categories[1]._id 
    });

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error}`);
    process.exit(1);
  }
};

seedData();