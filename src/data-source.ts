import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!) || 5433,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'my_crm',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['src/migrations/*.ts'], // Source TS files for CLI
  subscribers: [],
});
