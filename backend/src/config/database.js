require("dotenv/config");

const databaseConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST || "db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "veggodb",
  port: Number(process.env.DB_PORT) || 5432,
};


module.exports = databaseConfig;