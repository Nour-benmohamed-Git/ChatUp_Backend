import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || '', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/models/**/*.ts'],
  synchronize: true,
  logging: false,
});
