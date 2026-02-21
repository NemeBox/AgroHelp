// This file is for local development only.
// It starts the server and connects to the database.

const app = require('./server');
const connectDB = require('./db');

const port = process.env.PORT || 4000;

// Connect to DB, then start server
connectDB().then(() => {
    app.listen(port, () => {
        console.log('Server is listening for local development on port', port);
    });
});