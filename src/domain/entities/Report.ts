import mongoose, { Types } from 'mongoose';

export interface Report {
  turfId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  issue: string;
} 