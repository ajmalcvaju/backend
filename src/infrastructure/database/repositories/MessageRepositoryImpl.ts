import { MessageRepository } from "../../../domain/repositories/MessageRepository";
import { MessageModel } from "../models/messageModel";
import { Types } from "mongoose";
import { Message } from "../../../domain/entities/Message";

export const MessageRepositoryImpl: MessageRepository = {
  async sendMessage(senderId: string | Types.ObjectId, recieverId: string | Types.ObjectId, message: string): Promise<void> {
    try {
      await MessageModel.create({ senderId, recieverId, message });
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to send message.');
    }
  },
  async getMessages(sId: string,rId:string ): Promise<any> {
    try {
      const messages = await MessageModel.find({$or:[{senderId: rId, recieverId: sId },{senderId: sId, recieverId: rId }]}).sort({ createdAt: 1 });      
      return messages
    } catch (error) { 
      console.error('Error saving message:', error);
      throw new Error('Failed to send message.');
    }
  }
};

