import { Router } from 'express';
import * as usersController from '../controllers/usersController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Importando o middleware

const router = Router();


router.delete('/:id', authMiddleware, usersController.deleteUser);
router.post('/login', usersController.loginUser);

router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);

export default router;