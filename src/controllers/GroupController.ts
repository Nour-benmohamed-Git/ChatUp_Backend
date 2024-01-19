import { Request, Response } from 'express';
import { GroupService } from '../services/GroupService';
import { GroupDTO } from '../dto/GroupDTO';

export class GroupController {
  private groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
  }

  async getGroups(_req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.groupService.getGroups();
      res.json(groups);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGroup(req: Request, res: Response): Promise<void> {
    const groupId = Number(req.params.id);
    const group = await this.groupService.getGroup(groupId);

    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ error: 'Group not found' });
    }
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

  async updateGroup(req: Request, res: Response): Promise<void> {
    const groupId = Number(req.params.id);
    const dto = req.body as GroupDTO;

    try {
      const updateResult = await this.groupService.updateGroup(groupId, dto);
      if (updateResult.affected && updateResult.affected > 0) {
        res.status(200).json({ message: 'Group updated successfully' });
      } else {
        res.status(404).json({ error: 'Group not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteGroup(req: Request, res: Response): Promise<void> {
    const groupId = Number(req.params.id);

    try {
      const deleteResult = await this.groupService.deleteGroup(groupId);
      if (deleteResult.affected && deleteResult.affected > 0) {
        res.status(200).json({ message: 'Group deleted successfully' });
      } else {
        res.status(404).json({ error: 'Group not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}