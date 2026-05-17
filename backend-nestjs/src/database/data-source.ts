import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as entities from '../entities';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mis_academy',
  synchronize: false, // Las migraciones reemplazan el synchronize
  logging: process.env.APP_ENV === 'development',
  entities: Object.values(entities),
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [],
});
