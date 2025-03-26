
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const loginAdmin=async(email:string,password:string):Promise<string>=>{
    const admin=process.env.ADMIN_EMAIL===email
    if(!admin) throw new Error("Invalid Email or Password")
    const isPasswordValid=process.env.ADMIN_PASSWORD===password
    if(!isPasswordValid) throw new Error("Invalid Password")
    const token=jwt.sign({email:email,role:"admin"},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
    return token
}