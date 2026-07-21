const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

let PORT = 9000;
const DIST_DIR = path.join(__dirname, 'dist');

// Define MIME types for our local static server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Create a simple local static file server with SPA routing fallback
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

      // Handle SPA routing: if a file (like js/css) doesn't exist, serve index.html
      const hasExtension = path.extname(filePath) !== '';
      if (!fs.existsSync(filePath) || !hasExtension) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(0, () => {
      PORT = server.address().port;
      console.log(`[Prerender Server] Running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// Function to convert title/name to slug
function createSlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Fetch active course slugs from production API, fallback to local mock database
async function getCourseSlugs() {
  const slugs = new Set();

  const API_BASE = 'https://api.muebleriarivas.website/api';

  // 1. Try to fetch from the live production API (handling pagination)
  try {
    console.log('[Prerender] Fetching course slugs from live production API...');
    let page = 1;
    let lastPage = 1;
    
    do {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      const res = await fetch(`${API_BASE}/cursos?page=${page}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }

      const json = await res.json();
      const items = json.data || [];
      
      for (const item of items) {
        if (item.estado === 'Publicado') {
          if (item.slug) {
            slugs.add(item.slug);
          } else if (item.nombre) {
            slugs.add(createSlug(item.nombre));
          }
        }
      }

      lastPage = json.last_page || 1;
      page++;
    } while (page <= lastPage);

    if (slugs.size > 0) {
      console.log(`[Prerender] Successfully fetched ${slugs.size} slugs from live API.`);
      return Array.from(slugs);
    }
  } catch (e) {
    console.warn(`[Prerender] Live API fetch failed or timed out: ${e.message}`);
  }

  // 2. Fallback: Parse src/data/mockDatabase.ts to extract course names
  console.log('[Prerender] Falling back to local mockDatabase.ts parser...');
  try {
    const dbPath = path.join(__dirname, 'src', 'data', 'mockDatabase.ts');
    if (fs.existsSync(dbPath)) {
      const dbContent = fs.readFileSync(dbPath, 'utf8');
      const regex = /nombre:\s*["']([^"']+)["']/g;
      let match;
      while ((match = regex.exec(dbContent)) !== null) {
        const name = match[1];
        if (name.startsWith('Curso ') || name.includes('Curso')) {
          slugs.add(createSlug(name));
        }
      }
    }
  } catch (e) {
    console.error(`[Prerender] Error parsing mockDatabase.ts: ${e.message}`);
  }

  return Array.from(slugs);
}

// Main prerender process
async function main() {
  console.log('[Prerender] Starting build pre-rendering...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('[Prerender] Error: dist/ directory does not exist. Run "vite build" first.');
    process.exit(1);
  }

  const server = await startServer();
  const slugs = await getCourseSlugs();

  // Combine static and dynamic routes
  const staticRoutes = [
    '/',
    '/cursos',
    '/lineas-academicas',
    '/consulta',
    '/terminos',
    '/reclamaciones',
    '/contacto',
    '/registro',
    '/login'
  ];

  const courseRoutes = slugs.map(slug => `/curso/${slug}`);
  const allRoutes = [...staticRoutes, ...courseRoutes];

  console.log(`[Prerender] Routes to pre-render (${allRoutes.length}):`, allRoutes);

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();

  // Pipe browser logs to node console for debugging API/rendering errors
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[HMR]') && !text.includes('React Router') && !text.includes('Download the React DevTools')) {
      console.log(`[Browser] ${text}`);
    }
  });
  page.on('pageerror', err => {
    console.error(`[Browser Error] ${err.message}`);
  });

  for (const route of allRoutes) {
    console.log(`[Prerender] Rendering route: ${route}`);
    try {
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

      // Wait for any React loading spinners/animations to disappear
      try {
        await page.waitForFunction(() => {
          return !document.querySelector('.animate-spin') && !document.querySelector('.animate-pulse');
        }, { timeout: 6000 });
        // Small delay to ensure react rendering is fully committed to DOM
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.warn(`[Prerender] Spinner wait timed out or skipped for ${route}`);
      }

      // Get fully rendered HTML
      const html = await page.content();

      // Write HTML to the appropriate path
      let fileDir = DIST_DIR;
      let filePath = path.join(DIST_DIR, 'index.html');

      if (route !== '/') {
        fileDir = path.join(DIST_DIR, route);
        fs.mkdirSync(fileDir, { recursive: true });
        filePath = path.join(fileDir, 'index.html');
      }

      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`[Prerender] Generated: ${filePath}`);
    } catch (err) {
      console.error(`[Prerender] Error rendering route ${route}:`, err.message);
    }
  }

  console.log('[Prerender] Pre-rendering complete. Cleaning up...');
  await browser.close();
  server.close(() => {
    console.log('[Prerender Server] Server shut down.');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('[Prerender] Fatal error in main script:', err);
  process.exit(1);
});


