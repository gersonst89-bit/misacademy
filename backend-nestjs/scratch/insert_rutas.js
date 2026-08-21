const mysql = require('mysql2/promise');

async function insertRutas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const rutas = [
    'Excavadora',
    'Retroexcavadora',
    'Cargador frontal',
    'Minicargador',
    'Martillo hidráulico',
    'Montacarga',
    'Rodillo'
  ];

  try {
    // Buscar el id_linea_academica de "OPERADOR DE MAQUINARIA PESADA"
    const [lineas] = await connection.query('SELECT id_linea_academica FROM lineas_academicas WHERE nombre = "OPERADOR DE MAQUINARIA PESADA" LIMIT 1');
    
    if (lineas.length === 0) {
      console.log('No se encontro la linea academica');
      return;
    }
    
    const id_linea = lineas[0].id_linea_academica;

    for (const ruta of rutas) {
      await connection.query(
        `INSERT INTO rutas_academicas (id_linea_academica, nombre, estado, fecha_creacion, fecha_actualizacion) 
         VALUES (?, ?, 'Activo', NOW(), NOW())`,
        [id_linea, ruta]
      );
      console.log(`Ruta insertada: ${ruta}`);
    }
  } catch (err) {
    console.error('Error insertando rutas:', err);
  } finally {
    await connection.end();
  }
}

insertRutas();
