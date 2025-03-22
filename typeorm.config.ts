import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import 'dotenv/config';

const ConfigDataSource: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  migrations: [`${process.cwd()}/database/migrations/**`],
  entities: [`${process.cwd()}/database/**/**.entity.ts`],
};

export const dataSource = new DataSource(ConfigDataSource);
