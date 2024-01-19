import { Router } from "express";
import { GroupController } from '../controllers/GroupController';

const groupRouter = Router();
const groupController = new GroupController();

groupRouter.post('/groups', groupController.createGroup);
groupRouter.get('/groups/:id', groupController.getGroupById);

export default groupRouter;