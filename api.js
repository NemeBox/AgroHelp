// netlify/functions/api.js
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../../server');

// Establish a single database connection that can be reused
let conn = null;

const handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/
  context.callbackWaitsForEmptyEventLoop = false;

  // If a connection is already established, reuse it
  if (conn == null) {
    console.log('Creating new mongoose connection...');
    // `conn` will be a promise that resolves to the connection
    conn = mongoose.connect(process.env.MONGO_URI, { // Use MONGO_URI to match your db.js
      // Buffering means mongoose will queue up operations if it gets
      // disconnected, and replay them when it reconnects. This is not ideal for serverless.
      bufferCommands: false,
    });

    // `await`ing the connection here makes sure we're connected before proceeding
    await conn;
    console.log('Mongoose connection created.');
  }

  return serverless(app)(event, context);
};

module.exports.handler = handler;