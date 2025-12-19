import "reflect-metadata";
import * as path from "path";

import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

export let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? "sports",
    password: process.env.DB_PASSWORD ?? "sports",
    database: process.env.DB_NAME ?? "sports_articles_test",
    synchronize: false,
    logging: false,
    entities: [path.resolve(__dirname, "../entities/*.{ts,js}")],
    migrations: [path.resolve(__dirname, "../migrations/*.{ts,js}")],
  });

  await testDataSource.initialize();
  await testDataSource.runMigrations();
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  // Truncate all tables, keeping the schema
  if (testDataSource?.isInitialized) {
    await testDataSource.query('TRUNCATE TABLE sports_articles CASCADE');
  }
});
