/**
 * app.js — Passenger/cPanel entry point for NestJS (MIS_ACADEMY)
 *
 * Passenger busca este archivo por defecto cuando inicia la app.
 * Este wrapper carga el build compilado de NestJS (dist/main.js).
 *
 * IMPORTANTE: Asegúrate de haber ejecutado `npm run build`
 * antes de subir los archivos al servidor.
 */

const fs = require('fs');
const path = require('path');

// Redirigir errores a un archivo local para poder verlos en cPanel
const logFile = fs.createWriteStream(path.join(__dirname, 'error_debug.log'), { flags: 'a' });
process.stderr.write = logFile.write.bind(logFile);
process.on('uncaughtException', (err) => {
    fs.appendFileSync(path.join(__dirname, 'error_debug.log'), `Uncaught Exception: ${err.message}\n${err.stack}\n`);
    process.exit(1);
});

require('./dist/main.js');
