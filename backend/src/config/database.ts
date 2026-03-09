import 'dotenv/config';

const databaseConfig = {
  dialect: 'postgres' as const,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default databaseConfig;