import { Turf, TurfDetails } from "../../domain/entities/Turf";
import { TurfModel } from "../../infrastructure/database/models/turfModel";

interface FullTurf extends Turf, TurfDetails {}

export const getTurfs = async (): Promise<FullTurf[]> => {
  const turfs = await TurfModel.find();
  return turfs.map((turf) => turf.toObject() as FullTurf);
};
