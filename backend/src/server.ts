import express from "express";
import sequelize from './database';
import usersRoutes from './routes/usersRoutes'
import { errorHandler } from "./middlewares/errorHandler";
const app = express();

app.use(express.json())

app.use('/users', usersRoutes)

app.use(errorHandler);

sequelize
    .authenticate()
    .then(() => {
        console.log('Banco conectado');

        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch(err => console.error('Erro ao conectar no banco:', err));
