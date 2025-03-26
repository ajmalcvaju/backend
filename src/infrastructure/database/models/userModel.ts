import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User'; 

export interface UserDocument extends User {
  isOnline?:boolean;
  lastSeen?:Date
}

const UserSchema = new Schema<UserDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, sparse: true},
  password: { type: String, required: true },
  otp:{ type: String},
  otpExpiresAt:{type:Date},
  isVerified:{type:Number,default:0},
  isApproved:{type:Number,default:1},
  locationName:{ type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  isOnline:{ type: Boolean, required: false },
  lastSeen:{type:Date,required: false}
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
