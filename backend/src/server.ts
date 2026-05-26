import { errorHandler } from "./middlewares/errorHandler";
import express from "express";
import http from "http";
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
import chatsRoutes from './routes/chatsRoutes';
import adminRoutes from './routes/adminRoutes';
import setupAssociantos from './models/Associations';
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middlewares/rateLimiter";
import { initSocket } from "./utils/socket";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger";
import { swaggerCustomCss } from "./config/swagger-css";

setupAssociantos();

const app = express();
const server = http.createServer(app);
initSocket(server);

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
app.use('/chats', chatsRoutes);
app.use('/admin', adminRoutes);

// Swagger API Documentation with Custom Dark Theme & CSP Headers
app.use('/api-docs', (req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'"
    );
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: swaggerCustomCss,
    customSiteTitle: "Veggo API - Documentation",
}));

app.use(errorHandler);

sequelize
    .authenticate()
    .then(() => {
        console.log('Banco conectado');
        server.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch(err => console.error('Erro ao conectar no banco:', err));
