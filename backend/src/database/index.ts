import { Sequelize } from 'sequelize';
import * as databaseConfig from '../config/database';

const sequelize = new Sequelize({
    ...databaseConfig,
    logging: false,
});

export default sequelize;
