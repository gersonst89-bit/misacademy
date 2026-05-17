import { DataSource } from 'typeorm';
import { Pago } from '../../entities/pago.entity';
import { DetallePago } from '../../entities/detalle-pago.entity';
import { CarritoCompra } from '../../entities/carrito-compra.entity';
import { CarritoItem } from '../../entities/carrito-item.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { InscripcionRuta } from '../../entities/inscripcion-ruta.entity';
import { Resena } from '../../entities/resena.entity';
import { Contacto } from '../../entities/contacto.entity';
import { Reclamacion } from '../../entities/reclamacion.entity';
import { Notificacion } from '../../entities/notificacion.entity';

export async function cleanupTestData(dataSource: DataSource): Promise<void> {
    console.log('🧹 Iniciando limpieza PROFUNDA de datos de prueba...');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Desactivar checks de llaves foráneas para poder truncar
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    try {
        const entities = [
            { name: 'DetallePago', table: 'detalle_pagos' },
            { name: 'Pago', table: 'pagos' },
            { name: 'CarritoItem', table: 'carrito_items' },
            { name: 'CarritoCompra', table: 'carrito_compras' },
            { name: 'Inscripcion', table: 'inscripciones' },
            { name: 'InscripcionRuta', table: 'inscripciones_rutas' },
            { name: 'Resena', table: 'resenas' },
            { name: 'Contacto', table: 'contacto' },
            { name: 'Reclamacion', table: 'reclamaciones' },
            { name: 'Notificacion', table: 'notificaciones' },
        ];

        for (const entity of entities) {
            console.log(`  🗑️ Limpiando tabla: ${entity.table}`);
            await queryRunner.query(`TRUNCATE TABLE ${entity.table}`);
        }

        console.log('✨ Limpieza completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
        await queryRunner.release();
    }
}
