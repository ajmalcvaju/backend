import mongoose, { Types } from 'mongoose';
import { Message } from "../entities/Message";


export interface MessageRepository{
  sendMessage(senderId:string | Types.ObjectId, recieverId:string | Types.ObjectId, message:string): Promise<void>,
  getMessages(senderId:string| Types.ObjectId,recieverId:string| Types.ObjectId): Promise<Message[]>
}
  