#!/usr/bin/env node

// Simple startup wrapper for Node 16 + Phusion Passenger
const path = require('path');
const fs = require('fs');

// Ensure we can write logs
const logFile = path.join(process.cwd(), 'startup.log');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  try {
    fs.appendFileSync(logFile, line + '\n');
    console.log(line);
  } catch (e) {
    console.log(line);
  }
}

writeLog('=== Node.js Application Startup ===');
writeLog('Node Version: ' + process.version);
writeLog('Working Directory: ' + process.cwd());
writeLog('Script: ' + __filename);

// Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = process.env.APP_ENV || 'production';
  writeLog('NODE_ENV set to: ' + process.env.NODE_ENV);
}

// Verify .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  writeLog('ERROR: .env file not found at ' + envPath);
  process.exit(1);
}
writeLog('✓ .env found');

// Load environment variables
try {
  require('dotenv').config({ path: envPath });
  writeLog('✓ Environment variables loaded');
} catch (e) {
  writeLog('ERROR: Failed to load .env - ' + e.message);
  process.exit(1);
}

// Verify main.js exists
const mainPath = path.join(__dirname, 'dist', 'src', 'main.js');
if (!fs.existsSync(mainPath)) {
  writeLog('ERROR: dist/src/main.js not found at ' + mainPath);
  writeLog('Directory contents: ' + fs.readdirSync(process.cwd()).join(', '));
  process.exit(1);
}
writeLog('✓ dist/src/main.js found');

// Set up error handlers BEFORE loading the app
process.on('uncaughtException', function (err) {
  writeLog('UNCAUGHT EXCEPTION: ' + err.message);
  writeLog('Stack: ' + err.stack);
  process.exit(1);
});

process.on('unhandledRejection', function (reason, promise) {
  writeLog('UNHANDLED REJECTION: ' + String(reason));
  process.exit(1);
});

// Load and start the application
writeLog('Loading main application...');
try {
  require('./dist/src/main.js');
  writeLog('✓ Application loaded successfully');
} catch (err) {
  writeLog('ERROR: Failed to load application');
  writeLog('Message: ' + err.message);
  writeLog('Stack: ' + (err.stack || 'No stack trace'));
  process.exit(1);
}
