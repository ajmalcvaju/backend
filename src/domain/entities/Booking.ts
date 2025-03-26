import mongoose, { Types } from 'mongoose';

export interface Booking {
    slotId:string | Types.ObjectId;
    turfId: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    status:string
    paid:number
  } 