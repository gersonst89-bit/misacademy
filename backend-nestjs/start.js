#!/usr/bin/env node

console.log('🚀 [STARTUP] Loading environment...');
console.log('🚀 [STARTUP] CWD:', process.cwd());

// Load .env first
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env');
console.log('🚀 [STARTUP] Looking for .env at:', envPath);
console.log('🚀 [STARTUP] .env exists:', fs.existsSync(envPath));

if (!fs.existsSync(envPath)) {
  console.error('❌ [CRITICAL] .env file not found at', envPath);
  console.error('📂 [DEBUG] Contents of', process.cwd(), ':');
  try {
    const files = fs.readdirSync(process.cwd());
    files.forEach((f) => console.error('   -', f));
  } catch (e) {
    console.error('   Could not list directory');
  }
  process.exit(1);
}

require('dotenv').config({ path: envPath });
console.log('🚀 [STARTUP] ✓ .env loaded');

// Check critical env vars
const requiredVars = [
  'DB_HOST',
  'DB_DATABASE',
  'DB_USERNAME',
  'JWT_SECRET',
  'MAIL_HOST',
];
const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    '❌ [CRITICAL] Missing environment variables:',
    missing.join(', '),
  );
  process.exit(1);
}

console.log('🚀 [STARTUP] ✓ All critical env vars present');
console.log('🚀 [STARTUP] Loading NestJS application...');

try {
  require('./dist/src/main.js');
  console.log('🚀 [STARTUP] ✓ Application started');
} catch (err) {
  console.error('');
  console.error('❌ [CRITICAL] Failed to load application');
  console.error('Error:', err?.message);
  console.error('Type:', err?.constructor?.name);
  if (err?.stack) {
    console.error('');
    console.error('Stack trace:');
    console.error(err.stack);
  }
  process.exit(1);
}
