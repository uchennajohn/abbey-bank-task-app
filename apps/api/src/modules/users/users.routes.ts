import { Router } from 'express';
import { usersController } from './users.controller.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import {
  updateProfileSchema,
  getUsersQuerySchema,
} from './users.schema.js';

export const usersRouter = Router();

usersRouter.get('/', requireAuth, validateQuery(getUsersQuerySchema), usersController.getUsers);
usersRouter.put('/profile', requireAuth, validateBody(updateProfileSchema), usersController.updateProfile);
usersRouter.get('/:id', optionalAuth, usersController.getUserById);
