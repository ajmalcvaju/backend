import { TurfDocument } from "../../infrastructure/database/models/turfModel";
import { TurfModel } from "../../infrastructure/database/models/turfModel";

export const getTurfDetails=async(id:string)=>{
    let turfDetail=TurfModel.findOne({_id:id})
    return turfDetail
}