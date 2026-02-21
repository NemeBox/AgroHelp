const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server'); // Import the configured express app
const connectDB = require('../db'); // Import our centralized connection function

const handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn`
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Check if we have a connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Creating new mongoose connection...');
      await connectDB();
    } else {
      console.log('Re-using existing mongoose connection.');
    }

    return serverless(app)(event, context);
  } catch (error) {
    console.error('Mongoose connection or handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      })
    };
  }
};

module.exports.handler = handler;