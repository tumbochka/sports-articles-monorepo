import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { SportsArticle } from "./entities/SportsArticle";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "sports",
  password: process.env.DB_PASSWORD ?? "sports",
  database: process.env.DB_NAME ?? "sports_articles",
  synchronize: false,
  logging: false,
  entities: [SportsArticle],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
});
