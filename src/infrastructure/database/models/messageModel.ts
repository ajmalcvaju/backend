import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../../../domain/entities/Message';

export interface MessageDocument extends Message,Document {}

const MessageSchema = new Schema<MessageDocument>({
  message: { type: String, required: true },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  recieverId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type:{type:String,required: true}
});

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);
