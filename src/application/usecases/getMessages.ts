import { Message } from "../../domain/entities/Message";
import { MessageRepository } from "../../domain/repositories/MessageRepository";
import { Types } from "mongoose";

export const getMessages = async (
  messageRepository: MessageRepository,
  senderId: string | Types.ObjectId,
  recieverId:string| Types.ObjectId
): Promise<Message[]> => {
  try {
    const messages=await messageRepository.getMessages(senderId,recieverId);
    return messages
  } catch (error) {
    console.error('Error while sending message:', error);
    throw new Error('Failed to send message.');
  }
};

  