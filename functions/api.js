// This file is the serverless function handler for Netlify.

const serverless = require('serverless-http');
const app = require('../server'); // Imports your Express app from server.js

// We export a handler function that serverless-http wraps around our app
module.exports.handler = serverless(app);