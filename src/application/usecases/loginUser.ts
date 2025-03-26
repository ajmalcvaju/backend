import { UserRepository } from "../../domain/repositories/UserRepository";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../../domain/entities/User";

export const loginUser=async(userRepository:UserRepository,email:string,password:string):Promise<{ token: string; user: User }>=>{
    const user=await userRepository.findByEmail(email)
    console.log(user)
    if(!user) throw new Error("Invalid Email or Password")
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid) throw new Error("Invalid Password")
    const token=jwt.sign({email:user.email,role:"user"},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
    return {token,user}
} 