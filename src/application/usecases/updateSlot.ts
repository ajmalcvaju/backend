
import { Slot, Turf, TurfDetails } from "../../domain/entities/Turf";
import { TurfRepository } from "../../domain/repositories/TurfRepository";

export const updateSlot = async (
    turfrepository: TurfRepository,
    id: string,
    startDate:Date,
    endDate:Date,
    prices:{[key: string]: string},
    turfSizes: ('5 vs 5' | '7 vs 7' | '11 vs 11')[]
  ): Promise<Slot[]> => {
    return await turfrepository.updateSlot(id,startDate,endDate,prices,turfSizes);
  };
  
