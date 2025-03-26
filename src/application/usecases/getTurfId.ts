import { TurfDocument } from "../../infrastructure/database/models/turfModel";
import { TurfModel } from "../../infrastructure/database/models/turfModel";

export const getTurfDetailsFromMail=async(email:string)=>{
    let turfDetail=TurfModel.findOne({email})
    return turfDetail
}