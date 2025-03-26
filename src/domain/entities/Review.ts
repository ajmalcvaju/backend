import mongoose, { Types } from 'mongoose';

export interface Review {
    turfId: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    rating:number;
    tags:string[];
    comment:string
  }