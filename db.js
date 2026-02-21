const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully to Atlas!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw new Error(`Could not connect to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;