import { TurfRelatedUserSideRepository } from "../../../domain/repositories/UserRepository";
import { Turf } from "../../../domain/entities/Turf";
import { TurfDetails } from "../../../domain/entities/Turf";
import { TurfModel } from "../../../infrastructure/database/models/turfModel";
interface FullTurf extends Turf, TurfDetails {}
import { User } from "../../../domain/entities/User";
import { Review } from "../../../domain/entities/Review";


export class TurfRelatedUserSideUseCases {
    constructor(private repository: TurfRelatedUserSideRepository) {}
  
    async getTurfs(): Promise<FullTurf[]> {
      return await this.repository.getTurfs();
    }
  
    async getTurfDetails(id: string): Promise<Turf | null> {
      return await this.repository.getTurfDetails(id);
    }
  
    async getIdByMail(email: string): Promise<string | null> {
      return await this.repository.getIdByMail(email);
    }
  
    async addLocation(
      id: string,
      locationName: string,
      latitude: number,
      longitude: number
    ): Promise<void> {
      return await this.repository.addLocation(id, locationName, latitude, longitude);
    }
  
    async getUserDetails(id: string | null): Promise<User | null> {
      return await this.repository.getUserDetails(id);
    }
  
    async updateRatings(review: Review): Promise<Review> {
      return await this.repository.updateRatings(review);
    }
  
    async getReviews(turfId: string): Promise<[Review[], number, number]> {
      return await this.repository.getReviews(turfId);
    }
  
    async report(turfId: string, userId: string, issue: string): Promise<void> {
      return await this.repository.report(turfId, userId, issue);
    }
  }
  