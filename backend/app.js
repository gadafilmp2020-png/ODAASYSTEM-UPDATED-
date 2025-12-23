
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// cPanel/Passenger Node.js wrapper
// This file ensures the compiled TypeScript code (in dist/) is executed correctly
// regardless of how cPanel invokes the application.

try {
    console.log("Starting Odaa Backend via app.js wrapper...");
    require('./dist/server.js');
} catch (e) {
    console.error("CRITICAL ERROR: Failed to start server.");
    console.error("Ensure you have run 'npm run build' to compile TypeScript to ./dist");
    console.error(e);
    process.exit(1);
}
