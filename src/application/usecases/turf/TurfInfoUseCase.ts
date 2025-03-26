// application/useCases/TurfInfoUseCase.ts
import { TurfInfoRepository } from "../../../domain/repositories/TurfRepository";
import { Turf, TurfDetails } from "../../../domain/entities/Turf";
import { TurfDocument } from "../../../infrastructure/database/models/turfModel";
interface UpdatedTurf extends Turf,TurfDetails{}


export class TurfInfoUseCase {
  private turfInfoRepository: TurfInfoRepository;

  constructor(turfInfoRepository: TurfInfoRepository) {
    this.turfInfoRepository = turfInfoRepository;
  }

  async updateTurfDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf> {
    return this.turfInfoRepository.updateDetails(email, turfDetails);
  }

  async addTurfLocation(id: string, locationName: string, latitude: number, longitude: number): Promise<void> {
    await this.turfInfoRepository.addLocation(id, locationName, latitude, longitude);
  }

  async fetchTurfDetails(email: string): Promise<TurfDocument | null> {
    return this.turfInfoRepository.getTurfDetailsFromMail(email);
  }
}
