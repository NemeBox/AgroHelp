const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server'); // Import the configured express app

let conn = null;

const handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn`
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // If a connection is not established, create one
    if (conn == null) {
      console.log('Creating new mongoose connection...');
      conn = mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false, // Disable buffering for serverless
      });

      // `await`ing the connection here makes sure we're connected before proceeding
      await conn;
      console.log('Mongoose connection created.');
    } else {
      console.log('Re-using existing mongoose connection.');
    }

    return serverless(app)(event, context);
  } catch (error) {
    console.error('Mongoose connection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection failed.' })
    };
  }
};

module.exports.handler = handler;