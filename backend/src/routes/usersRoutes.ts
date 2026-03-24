import { Router } from 'express';
import * as usersController from '../controllers/usersController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Importando o middleware

const router = Router();

router.post('/login', usersController.loginUser);
router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);

router.get('/:id', authMiddleware, usersController.getUserById);
router.put('/:id', authMiddleware, usersController.updateUser);
router.delete('/:id', authMiddleware, usersController.deleteUser);

export default router;