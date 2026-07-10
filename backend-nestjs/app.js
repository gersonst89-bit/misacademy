/**
 * app.js — Wrapper de inicio para NestJS en cPanel/Passenger
 */

const fs = require('fs');
const path = require('path');

// 1. Redirección de logs para depuración en el servidor
const logPath = path.join(__dirname, 'error_debug.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
process.stdout.write = logStream.write.bind(logStream);
process.stderr.write = logStream.write.bind(logStream);

process.on('uncaughtException', (err) => {
    fs.appendFileSync(logPath, `Uncaught Exception: ${err.message}\n${err.stack}\n`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    fs.appendFileSync(logPath, `Unhandled Rejection at: ${promise}\nReason: ${reason}\n`);
});

console.log(`--- ARRANQUE DE APLICACIÓN: ${new Date().toISOString()} ---`);
console.log(`Node Version: ${process.version}`);
console.log(`__dirname: ${__dirname}`);
console.log(`process.cwd(): ${process.cwd()}`);

// 2. Cargar variables de entorno del archivo .env manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log(`Cargando variables de entorno desde: ${envPath}`);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        // Ignorar comentarios y líneas vacías
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        
        const firstEquals = trimmedLine.indexOf('=');
        if (firstEquals === -1) return;
        
        const key = trimmedLine.substring(0, firstEquals).trim();
        let val = trimmedLine.substring(firstEquals + 1).trim();
        
        // Quitar comillas si están presentes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
        }
        
        if (key) {
            process.env[key] = val;
        }
    });
    console.log(`Variables de entorno cargadas. DB_HOST=${process.env.DB_HOST}, DB_DATABASE=${process.env.DB_DATABASE}`);
} else {
    console.error(`ERROR: No se encontró el archivo .env en: ${envPath}`);
}

// 3. Cargar la aplicación principal NestJS compilada
console.log('Iniciando NestJS (dist/bundled/index.js)...');
require('./dist/bundled/index.js');

