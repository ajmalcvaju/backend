import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import bcrypt from "bcryptjs"

export const registerUser=async(userRepository:UserRepository,userData:User):Promise<User>=>{
    const existingUser=await userRepository.findByEmail(userData.email)
    if(existingUser) throw new Error("Email already exists")
    const hashedPassword=await bcrypt.hash(userData.password,10)
    userData.password=hashedPassword
    return userRepository.createUser(userData)
}

