import { ChatSession } from '../../models/ChatSession';

export const getChatSessionImage = (
  chatSession: Partial<ChatSession>,
  currentUserId: number
) => {
  const currentUser = chatSession?.participants?.find(
    (participant) => participant?.id === currentUserId
  );
  const otherParticipant = chatSession?.participants?.find(
    (participant) => participant?.id !== currentUserId
  );
  return chatSession?.participants?.length === 1
    ? currentUser?.profilePicture
    : otherParticipant?.profilePicture;
};
