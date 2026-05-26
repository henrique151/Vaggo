require("dotenv/config");

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  module.exports = {
    dialect: "postgres",
    use_env_variable: "DATABASE_URL",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
} else {
  module.exports = {
    dialect: "postgres",
    host: process.env.DB_HOST || "db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "12345",
    database: process.env.DB_NAME || "vaggo",
    port: Number(process.env.DB_PORT) || 5432,
  };
}
