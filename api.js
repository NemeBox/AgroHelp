const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server'); // Import the configured express app

let conn = null;

const handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn`
  context.callbackWaitsForEmptyEventLoop = false;

  // If a connection is not established, create one
  if (conn == null) {
    console.log('Creating new mongoose connection...');
    conn = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Disable buffering for serverless
    });

    // `await`ing the connection here makes sure we're connected before proceeding
    await conn;
    console.log('Mongoose connection created.');
  }

  return serverless(app)(event, context);
};

module.exports.handler = handler;