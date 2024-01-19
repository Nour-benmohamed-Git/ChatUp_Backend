import { Group } from '../models/Group';
import { GroupDAO } from '../dao/GroupDAO';
import { GroupDTO } from '../dto/GroupDTO';

export class GroupService {
  private groupDAO: GroupDAO;

  constructor() {
    this.groupDAO = new GroupDAO();
  }

  async createGroup(dto: GroupDTO): Promise<Group> {
    const groupData = this.mapDTOToGroup(dto);
    return this.groupDAO.createGroup(groupData);
  }

  async getGroupById(id: number): Promise<GroupDTO | undefined> {
    const group = await this.groupDAO.getGroupById(id);

    if (group) {
      return this.mapGroupToDTO(group);
    }

    return undefined;
  }

  // Add other methods like updateGroup, deleteGroup, etc.

  private mapDTOToGroup(dto: GroupDTO): Partial<Group> {
    return {
      groupName: dto.groupName,
      timestamp: dto.timestamp || new Date(),
    };
  }

  private mapGroupToDTO(group: Group): GroupDTO {
    return {
      id: group.id,
      groupName: group.groupName,
      timestamp: group.timestamp,
      memberIds: group.members.map(member => member.id),
      messageIds: group.messages.map(message => message.id),
    };
  }
}