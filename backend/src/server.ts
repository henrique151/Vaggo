import express from "express";
import sequelize from './database';
import usersRoutes from './routes/usersRoutes'
import vehiclesRoutes from './routes/vehiclesRoutes'
import locationsRoutes from './routes/locationsRoutes'
import { errorHandler } from "./middlewares/errorHandler";
import setupAssociantos from './models/Associations';
import cors from "cors";

setupAssociantos();

const app = express();

app.use(express.json())
app.use(cors())

app.use('/users', usersRoutes)
app.use('/vehicles', vehiclesRoutes)
app.use('/locations', locationsRoutes)

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