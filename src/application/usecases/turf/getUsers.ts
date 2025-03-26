import { User } from "../../../domain/entities/User"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const getUsers=async(turfRepository:TurfRepository):Promise<User[]>=>{
    const users=turfRepository.getUsers()
    return users
}