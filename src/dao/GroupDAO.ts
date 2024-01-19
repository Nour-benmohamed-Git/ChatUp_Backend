import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Group } from '../models/Group';

export class GroupDAO {
  private groupRepository: Repository<Group>;

  constructor() {
    this.groupRepository = AppDataSource.getRepository(Group);
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groupRepository.findOne({ where: { id: id } });
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const group = this.groupRepository.create(groupData);
    return this.groupRepository.save(group);
  }
  
}