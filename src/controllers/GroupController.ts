import { Request, Response } from 'express';
import { GroupService } from '../services/GroupService';
import { GroupDTO } from '../dto/GroupDTO';

export class GroupController {
  private groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
  }

  async createGroup(req: Request, res: Response): Promise<void> {
    const dto = req.body as GroupDTO;

    try {
      const createdGroup = await this.groupService.createGroup(dto);
      res.status(201).json(createdGroup);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGroupById(req: Request, res: Response): Promise<void> {
    const groupId = Number(req.params.id);
    const group = await this.groupService.getGroupById(groupId);

    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ error: 'Group not found' });
    }
  }
}