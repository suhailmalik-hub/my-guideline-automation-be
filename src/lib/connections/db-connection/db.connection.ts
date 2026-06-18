import { Sequelize } from "sequelize";

const db = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export async function connectDB(): Promise<void> {
  try {
    await db.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export default db;
