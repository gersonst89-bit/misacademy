import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSecuritySchema1778136876307 implements MigrationInterface {
    name = 'InitialSecuritySchema1778136876307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cursos_rutas\` DROP FOREIGN KEY \`FK_2c8e6271302fd8945fd2a0f2f7b\``);
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id_audit_log\` int NOT NULL AUTO_INCREMENT, \`id_usuario\` int NULL, \`action\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`details\` text NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id_audit_log\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_b6d6c0a613fae1aa1d003f3f4ae\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuarios\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cursos_rutas\` ADD CONSTRAINT \`FK_2c8e6271302fd8945fd2a0f2f7b\` FOREIGN KEY (\`id_ruta\`) REFERENCES \`rutas_academicas\`(\`id_ruta\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cursos_rutas\` DROP FOREIGN KEY \`FK_2c8e6271302fd8945fd2a0f2f7b\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_b6d6c0a613fae1aa1d003f3f4ae\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
        await queryRunner.query(`ALTER TABLE \`cursos_rutas\` ADD CONSTRAINT \`FK_2c8e6271302fd8945fd2a0f2f7b\` FOREIGN KEY (\`id_ruta\`) REFERENCES \`rutas_academicas\`(\`id_ruta\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
