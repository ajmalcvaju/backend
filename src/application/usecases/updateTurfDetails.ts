
import { Turf, TurfDetails } from "../../domain/entities/Turf";
import { TurfRepository } from "../../domain/repositories/TurfRepository";

export const updateTurfDetails = async (
  turfrepository: TurfRepository,
  email: string,
  details: Partial<TurfDetails>
): Promise<Turf> => {
  const turf = await turfrepository.findByEmail(email);

  if (!turf) {
    throw new Error("Turf not found");
  }
  console.log(details)
  return await turfrepository.updateDetails(email, details);
};
