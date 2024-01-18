import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["src/app/entities/**/*.ts"],
  migrations: ["src/database/migrations/**/*.ts"],
  synchronize: true,
  logging: true,
});
