import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createUser, deleteUser, getUserById, updateUser, searchUsers } from '../controllers/usersController';
import { createUserSchema, updateUserSchema } from '../schemas/usersSchema';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { uploadSingle } from '../middlewares/upload';
import { Roles } from '../types/Roles';
import { allowSelfOrRoles } from '../middlewares/ownershipMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';

const router = Router();

router.post('/', uploadLimiter, uploadSingle, validateBody(createUserSchema), createUser);
router.get('/admin/search', authMiddleware, permissionMiddleware(Roles.MANAGER, Roles.ADMIN), searchUsers);
router.get('/:id', authMiddleware, allowSelfOrRoles('id', Roles.MANAGER, Roles.ADMIN), getUserById);
router.put('/:id', authMiddleware, allowSelfOrRoles('id', Roles.ADMIN), uploadLimiter, uploadSingle, validateBody(updateUserSchema), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;