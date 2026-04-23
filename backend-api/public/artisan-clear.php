<?php
chdir(__DIR__ . '/../');
echo shell_exec('php artisan route:clear');
echo shell_exec('php artisan config:clear');
echo "Comandos ejecutados.";