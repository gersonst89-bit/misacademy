import { DataSource } from 'typeorm';
import { Rol } from '../../entities/rol.entity';

/**
 * Seed de roles iniciales.
 * Se ejecuta al arrancar la aplicación.
 * Inserta los roles solo si no existen aún en la tabla.
 */
export async function seedRoles(dataSource: DataSource): Promise<void> {
    const rolRepo = dataSource.getRepository(Rol);

    const roles = [
        { id_rol: 1, nombre_rol: 'Administrador', descripcion: 'Administrador del sistema con acceso total' },
        { id_rol: 2, nombre_rol: 'Docente', descripcion: 'Docente que gestiona cursos y contenido' },
        { id_rol: 3, nombre_rol: 'Estudiante', descripcion: 'Estudiante que accede a los cursos' },
    ];

    for (const role of roles) {
        const exists = await rolRepo.findOne({ where: { id_rol: role.id_rol } });
        if (!exists) {
            await rolRepo.save(rolRepo.create({
                ...role,
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date(),
            }));
            console.log(`  ✅ Rol "${role.nombre_rol}" creado (id: ${role.id_rol})`);
        }
    }
}
