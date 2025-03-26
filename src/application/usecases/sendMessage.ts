import { MessageRepository } from "../../domain/repositories/MessageRepository";
import { Types } from "mongoose";

export const sendMessage = async (
  messageRepository: MessageRepository,
  senderId: string | Types.ObjectId,
  recieverId: string | Types.ObjectId,
  message: string
): Promise<void> => {
  try {
    await messageRepository.sendMessage(senderId, recieverId, message);
  } catch (error) {
    console.error('Error while sending message:', error);
    throw new Error('Failed to send message.');
  }
};

  