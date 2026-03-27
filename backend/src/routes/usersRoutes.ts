import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, loginUser } from '../controllers/usersController';
import { createUserSchema, updateUserSchema, loginUserSchema } from '../schemas/usersSchema';

const router = Router();

router.post('/', validateBody(createUserSchema), createUser);
router.post('/login', validateBody(loginUserSchema), loginUser);

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, validateBody(updateUserSchema), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;