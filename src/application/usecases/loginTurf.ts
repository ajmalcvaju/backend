import { TurfRepository } from "../../domain/repositories/TurfRepository"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Turf } from "../../domain/entities/Turf";

export const loginTurf=async(turfRepository:TurfRepository,email:string,password:string):Promise<{ token: string; turf: Turf }>=>{
    const turf=await turfRepository.findByEmail(email)
    console.log(turf)
    if(!turf) throw new Error("Invalid Email or Password")
    const isPasswordValid=await bcrypt.compare(password,turf.password)
    if(!isPasswordValid) throw new Error("Invalid Password")
    const token=jwt.sign({email:turf.email,role:"turf"},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
    return {token,turf}
} 