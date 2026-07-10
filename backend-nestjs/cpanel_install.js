const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'install_log.txt');
fs.writeFileSync(logFile, '=== INICIANDO INSTALACIÓN DE DEPENDENCIAS ===\n');

// Intentaremos usar las rutas comunes de cPanel para Node 18 y Node 20
const npmPaths = [
  '/opt/cpanel/ea-nodejs20/bin/npm',
  '/opt/cpanel/ea-nodejs18/bin/npm',
  'npm'
];

let success = false;
for (const npmPath of npmPaths) {
  try {
    fs.appendFileSync(logFile, `Intentando instalar dependencias con: ${npmPath}...\n`);
    
    // Ejecutar npm install
    const stdout = execSync(`"${npmPath}" install --no-audit --no-fund`, { 
      cwd: __dirname,
      env: process.env,
      stdio: 'pipe' 
    });
    
    fs.appendFileSync(logFile, `\n--- Salida del comando ---\n${stdout.toString()}\n-----------------------\n`);
    fs.appendFileSync(logFile, `¡Éxito! Dependencias instaladas correctamente usando ${npmPath}.\n`);
    success = true;
    break;
  } catch (err) {
    fs.appendFileSync(logFile, `Fallo con ${npmPath}:\nError: ${err.message}\n`);
    if (err.stderr) {
      fs.appendFileSync(logFile, `Detalles stderr:\n${err.stderr.toString()}\n`);
    }
    fs.appendFileSync(logFile, '-----------------------------------------\n');
  }
}

if (!success) {
  fs.appendFileSync(logFile, '=== ERROR: No se pudo instalar usando ninguna de las rutas de Node/NPM. ===\n');
} else {
  fs.appendFileSync(logFile, '=== PROCESO COMPLETADO CON ÉXITO ===\n');
}

// Servir una respuesta HTTP simple para que Passenger no falle al cargar el script en el navegador
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  const logContent = fs.readFileSync(logFile, 'utf8');
  res.end(`Proceso de instalación finalizado.\n\nLOG DE INSTALACIÓN:\n\n${logContent}`);
});
server.listen(process.env.PORT || 8000);
