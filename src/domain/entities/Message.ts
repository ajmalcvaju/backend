import mongoose, { Types } from 'mongoose';

export interface Message {
    senderId?: string | Types.ObjectId;
    recieverId?: string | Types.ObjectId;
    message:string
    type:string
    createdAt:Date
  }