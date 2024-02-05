export interface GroupDTO {
  id: number;
  groupName: string;
  timestamp: Date;
  memberIds: number[];
  messageIds?: number[];
}
