import { DeleteResult, UpdateResult } from 'typeorm';
import { GroupDAO } from '../dao/GroupDAO';
import { GroupDTO } from '../dto/GroupDTO';
import { Group } from '../models/Group';

export class GroupService {
  private groupDAO: GroupDAO;

  constructor() {
    this.groupDAO = new GroupDAO();
  }

  async getGroups(): Promise<GroupDTO[]> {
    const groups = await this.groupDAO.getGroups();
    return groups.map(group => this.mapGroupToDTO(group));
  }

  async getGroup(id: number): Promise<GroupDTO | null> {
    const group = await this.groupDAO.getGroupById(id);
    if (group) {
      return this.mapGroupToDTO(group);
    }
    return null;
  }
  
  async createGroup(dto: GroupDTO): Promise<Group> {
    const groupData = this.mapDTOToGroup(dto);
    return this.groupDAO.createGroup(groupData);
  }

  async updateGroup(id: number, dto: GroupDTO): Promise<UpdateResult> {
    const groupData = this.mapDTOToGroup(dto);
    return this.groupDAO.updateGroup(id, groupData);
  }

  async deleteGroup(id: number): Promise<DeleteResult> {
    return this.groupDAO.deleteGroup(id);
  }

  private mapDTOToGroup(dto: GroupDTO): Partial<Group> {
    return {
      groupName: dto.groupName,
      timestamp: dto.timestamp || new Date(),
      // ... other mappings as necessary
    };
  }

  private mapGroupToDTO(group: Group): GroupDTO {
    return {
      id: group.id,
      groupName: group.groupName,
      timestamp: group.timestamp,
      memberIds: group.members.map((member) => member.id),
      messageIds: group.messages.map((message) => message.id),
      // ... other mappings as necessary
    };
  }
}