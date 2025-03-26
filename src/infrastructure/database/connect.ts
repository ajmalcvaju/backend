import mongoose from "mongoose";

export const connectDB=async():Promise<void>=>{
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
        console.log("Mongodb connected successfully")
    } catch (error) {
        console.error("Error Connecting To Mongodb",error)
    }
} 