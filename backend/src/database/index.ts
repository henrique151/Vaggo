import { Sequelize } from 'sequelize';
import * as databaseConfig from '../config/database';

const connectionString = process.env.DATABASE_URL;

const sequelize = connectionString
    ? new Sequelize(connectionString, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    })
    : new Sequelize({
        ...databaseConfig,
        logging: false,
    });

export default sequelize;
