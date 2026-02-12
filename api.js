// netlify/functions/api.js
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../../index'); // Adjust this path if your main server file is named differently or located elsewhere

// Establish a single database connection that can be reused
let conn = null;

const handler = async (event, context) => {
  if (conn == null) {
    conn = await mongoose.connect(process.env.MONGODB_URI);
  }
  return serverless(app)(event, context);
};

module.exports.handler = handler;