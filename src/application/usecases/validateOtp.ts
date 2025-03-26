import { TurfModel } from "../../infrastructure/database/models/turfModel";
import { UserModel } from "../../infrastructure/database/models/userModel";
import jwt from "jsonwebtoken";

export const validateOtp=async(email:string,otp:string,person: number):Promise<void|string>=>{
  let user;
  if(person===1){
    user = await UserModel.findOne({ email });
    console.log(user)
  }else if(person===0){
    user = await TurfModel.findOne({ email });
    console.log(user)
  }
  console.log(email)
  if (!user || user.otp !== otp || new Date() > user.otpExpiresAt!) {
    throw new Error('Invalid or expired OTP.');
  }
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.isVerified = 1;
  await user.save();
  const role=person===1?"user":"turf"
  const token=jwt.sign({email:user.email,role},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
  return token
}