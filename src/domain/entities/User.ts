export interface User{
    _id:string;
    firstName:string;
    lastName?:string;
    email:string;
    mobileNumber?:string; 
    password:string;
    otp?:string,
    otpExpiresAt?:Date,
    isVerified?:number,
    isApproved?:number,
    latitude?: number;
    longitude?: number;
    locationName?:string;
    googleId?:string;
}