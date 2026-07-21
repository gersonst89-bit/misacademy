<?php
// Script temporal para ejecutar npm install desde el navegador
// IMPORTANTE: Borrar este archivo del servidor después de usarlo

$allowed_ip = null; // Dejar null para permitir cualquier IP (borrar después de usar)

if ($allowed_ip && $_SERVER['REMOTE_ADDR'] !== $allowed_ip) {
    die('Acceso denegado.');
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>NPM Install</title>';
echo '<style>body{font-family:monospace;background:#1a1a1a;color:#00ff00;padding:20px;}';
echo 'pre{background:#000;padding:15px;border-radius:8px;white-space:pre-wrap;word-break:break-all;}';
echo '.btn{display:inline-block;padding:10px 20px;background:#0066cc;color:white;text-decoration:none;border-radius:5px;margin:5px;font-size:14px;}';
echo '.warn{color:#ffaa00;} .ok{color:#00ff00;} .err{color:#ff4444;}</style></head><body>';

echo '<h2>🔧 NPM Install Tool</h2>';
echo '<p class="warn">⚠️ BORRAR ESTE ARCHIVO DEL SERVIDOR DESPUÉS DE USAR</p>';

$app_path = '/home/mattacademy/public_html/api/public';
$npm_bin  = '/opt/cpanel/ea-nodejs16/bin/npm';

if ($action === 'install') {
    echo '<h3>Ejecutando: npm install...</h3>';
    echo '<pre>';
    $cmd = "cd {$app_path} && {$npm_bin} install 2>&1";
    $output = shell_exec($cmd);
    if ($output === null) {
        echo '<span class="err">ERROR: shell_exec está deshabilitado en este servidor.</span>' . "\n";
        echo '<span class="warn">Contacta a tu proveedor de hosting para habilitar shell_exec.</span>';
    } else {
        echo htmlspecialchars($output);
        echo "\n\n" . '<span class="ok">✅ Comando terminado.</span>';
    }
    echo '</pre>';
    echo '<a href="run_npm.php" class="btn">← Volver</a>';
} elseif ($action === 'check') {
    echo '<h3>Verificando entorno...</h3>';
    echo '<pre>';
    echo "Ruta de la app: {$app_path}\n";
    echo "Existe: " . (is_dir($app_path) ? '✅ SÍ' : '❌ NO') . "\n\n";
    
    echo "Node.js: " . htmlspecialchars(shell_exec('/opt/cpanel/ea-nodejs16/bin/node --version 2>&1') ?? 'No disponible') . "\n";
    echo "NPM: " . htmlspecialchars(shell_exec("{$npm_bin} --version 2>&1") ?? 'No disponible') . "\n\n";
    
    echo "shell_exec: " . (function_exists('shell_exec') ? '✅ Habilitado' : '❌ Deshabilitado') . "\n\n";
    
    // Verificar si @nestjs/core existe
    $nestjs_path = $app_path . '/node_modules/@nestjs/core';
    echo "@nestjs/core: " . (is_dir($nestjs_path) ? '✅ Instalado' : '❌ NO encontrado') . "\n";
    
    $nm_path = $app_path . '/node_modules';
    if (is_dir($nm_path)) {
        $count = count(scandir($nm_path)) - 2;
        echo "node_modules carpetas: {$count}\n";
    }
    echo '</pre>';
    echo '<a href="run_npm.php" class="btn">← Volver</a>';
} else {
    echo '<p>Ruta de la app: <strong>' . $app_path . '</strong></p>';
    echo '<hr style="border-color:#333">';
    echo '<h3>Acciones disponibles:</h3>';
    echo '<a href="run_npm.php?action=check" class="btn">🔍 Verificar entorno primero</a>';
    echo '<a href="run_npm.php?action=install" class="btn" style="background:#cc0000">🚀 Ejecutar npm install</a>';
    echo '<p class="warn">⚠️ Empieza siempre con "Verificar entorno" antes de instalar.</p>';
}

echo '</body></html>';
?>
