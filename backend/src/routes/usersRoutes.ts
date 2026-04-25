import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, loginUser } from '../controllers/usersController';
import { createUserSchema, updateUserSchema, loginUserSchema } from '../schemas/usersSchema';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

router.post('/', uploadLimiter, uploadSingle, validateBody(createUserSchema), createUser);
router.post('/login', validateBody(loginUserSchema), loginUser);

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, uploadLimiter, uploadSingle, validateBody(updateUserSchema), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;