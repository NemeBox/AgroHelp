const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Options for serverless environments
      serverSelectionTimeoutMS: 5000, // Fail fast if server is not reachable
      bufferCommands: false // Disable command buffering
    });
    console.log('MongoDB connected successfully to Atlas!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw new Error(`Could not connect to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;