import { errorHandler } from "./middlewares/errorHandler";
import express from "express";
import sequelize from './database';
import usersRoutes from './routes/usersRoutes';
import vehiclesRoutes from './routes/vehiclesRoutes';
import locationsRoutes from './routes/locationsRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import spotsRoutes from './routes/spotsRoutes';
import reservationsRoutes from './routes/reservationsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import reviewsRoutes from './routes/reviewsRoutes';
import authRoutes from './routes/authRoutes';
import setupAssociantos from './models/Associations';
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middlewares/rateLimiter";

setupAssociantos();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
}));
app.use(globalLimiter);

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/locations', locationsRoutes);
app.use('/properties', propertiesRoutes);
app.use('/spots', spotsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/reports', reportsRoutes);
app.use('/reviews', reviewsRoutes);

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
