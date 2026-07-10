const { pathToRegexp } = require('path-to-regexp');

const patterns = [
  '/api/(.*)',
  '/api/*path',
  '/api/:path*',
  '/api/{*path}',
  '/api/(?:.*)'
];

patterns.forEach(pattern => {
  try {
    const result = pathToRegexp(pattern);
    console.log(`✅ ${pattern} is valid! Regex:`, result.regexp);
  } catch (err) {
    console.log(`❌ ${pattern} failed:`, err.message);
  }
});
