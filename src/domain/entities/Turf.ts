import { ObjectId } from "mongodb";
export interface Turf {
  turfName: string;
  email: string;
  mobileNumber: string;
  password: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified?: number;
  isApproved?: number;
}
export interface TurfDetails{ 
    turfAddress?: string;
    turfMap?: string;
    latitude?: number;
    longitude?: number;
    turfOverview?: string;
    locationName?:string;
    facilities?:string
    gallery?: string[];
    turfTypes?:string[];
    turfSizes?:string[];
    rating:number;
    votes:number
}

export interface Slot {
  date: string;    
  time: string;
  isBooked: boolean;
  price:string;
  turfSizes: string
  bookingNumber:number
}
