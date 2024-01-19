import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Group } from '../models/Group';

export class GroupDAO {
  private groupRepository: Repository<Group>;

  constructor() {
    this.groupRepository = AppDataSource.getRepository(Group);
  }

  async getGroups(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async getGroupById(id: number): Promise<Group | null> {
    return this.groupRepository.findOneBy({ id });
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const group = this.groupRepository.create(groupData);
    return this.groupRepository.save(group);
  }

  async updateGroup(id: number, groupData: Partial<Group>): Promise<UpdateResult> {
    return this.groupRepository.update(id, groupData);
  }

  async deleteGroup(id: number): Promise<DeleteResult> {
    return this.groupRepository.delete(id);
  }
}