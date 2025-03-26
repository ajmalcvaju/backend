import { Schema } from "mongoose";
import mongoose from "mongoose";
import { Types } from "mongoose";

interface Member {
  userId: string; 
  isAdmin: boolean;
}

interface Slot {
  slotId: Types.ObjectId;
  vacancy: number;
  members: { userId: Types.ObjectId,isAdmin:boolean }[]; 
}

export interface Team {
  teamName: string;
  maxMembers: number;
  privacy: 'public' | 'private';
  secretCode: string;
  members: Member[];
  slots: Slot[];
}
  