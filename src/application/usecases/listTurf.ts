import { Turf } from "../../domain/entities/Turf";
import { TurfRepository } from "../../domain/repositories/TurfRepository";
import bcrypt from "bcryptjs"

export const listTurf=async(turfRepository:TurfRepository,turfData:Turf):Promise<Turf>=>{
    const existingTurf=await turfRepository.findByEmail(turfData.email)
    if(existingTurf) throw new Error("Email already exists")
    const hashedPassword=await bcrypt.hash(turfData.password,10)
    turfData.password=hashedPassword
    return turfRepository.createTurf(turfData)
}

