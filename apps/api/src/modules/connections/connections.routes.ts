import { Router } from 'express';
import { connectionsController } from './connections.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  sendConnectionSchema,
  updateConnectionStatusSchema,
} from './connections.schema.js';

export const connectionsRouter = Router();

// All connection routes require authentication
connectionsRouter.use(requireAuth);

connectionsRouter.get('/', connectionsController.getMyConnections);
connectionsRouter.get('/requests/pending', connectionsController.getPendingRequests);
connectionsRouter.get('/requests/sent', connectionsController.getSentRequests);
connectionsRouter.post('/', validateBody(sendConnectionSchema), connectionsController.sendRequest);
connectionsRouter.patch('/:id', validateBody(updateConnectionStatusSchema), connectionsController.updateStatus);
connectionsRouter.delete('/:id', connectionsController.removeConnection);
