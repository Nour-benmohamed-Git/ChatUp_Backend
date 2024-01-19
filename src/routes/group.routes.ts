import { Router } from 'express';
import { GroupController } from '../controllers/GroupController';

const groupRouter = Router();
const groupController = new GroupController();
groupRouter.get('/groups', groupController.getGroups);
groupRouter.get('/groups/:id', groupController.getGroup);
groupRouter.post('/groups', groupController.createGroup);
groupRouter.put('/groups/:id', groupController.updateGroup);
groupRouter.delete('/groups/:id', groupController.deleteGroup);

export default groupRouter;
