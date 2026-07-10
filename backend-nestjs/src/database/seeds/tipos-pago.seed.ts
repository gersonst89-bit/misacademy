import { DataSource } from 'typeorm';
import { TipoPago } from '../../entities/tipo-pago.entity';

export async function seedTiposPago(dataSource: DataSource): Promise<void> {
  // --- SCRIPT DE REPARACIÓN DE EMERGENCIA ---
  try {
    const columns = await dataSource.query(
      'SHOW COLUMNS FROM materiales LIKE "id_curso"',
    );
    if (columns.length === 0) {
      console.log('🛠️ Reparando tabla materiales: Añadiendo id_curso...');
      await dataSource.query(
        'ALTER TABLE materiales ADD COLUMN id_curso INT AFTER id_material',
      );
      await dataSource.query(
        'UPDATE materiales m JOIN modulos mod ON m.id_modulo = mod.id_modulo SET m.id_curso = mod.id_curso WHERE m.id_curso IS NULL',
      );
    }

    const colEstado = await dataSource.query(
      'SHOW COLUMNS FROM materiales LIKE "estado"',
    );
    if (colEstado.length === 0) {
      await dataSource.query(
        'ALTER TABLE materiales ADD COLUMN estado VARCHAR(20) DEFAULT "Activo"',
      );
    }

    await dataSource.query(
      'ALTER TABLE materiales MODIFY COLUMN id_modulo INT NULL',
    );
    console.log('✅ Estructura de materiales verificada.');
  } catch (e) {
    console.warn('⚠️ Nota sobre reparación de BD:', e.message);
  }
  // ------------------------------------------

  const repo = dataSource.getRepository(TipoPago);
  // ... resto del código existente

  const tipos = [
    {
      nombre: 'Yape',
      descripcion: 'Pago rápido con QR o número',
      activo: true,
    },
    {
      nombre: 'Plin',
      descripcion: 'Pago rápido con QR o número',
      activo: true,
    },
    {
      nombre: 'Transferencia Bancaria',
      descripcion: 'BCP, BBVA, Interbank',
      activo: true,
    },
    {
      nombre: 'Tarjeta de Crédito/Débito',
      descripcion: 'Próximamente (Pasarela)',
      activo: false,
    },
  ];

  for (const t of tipos) {
    const exists = await repo.findOne({ where: { nombre: t.nombre } });
    if (!exists) {
      await repo.save(repo.create(t));
      console.log(`✅ Método creado: ${t.nombre}`);
    }
  }
}
