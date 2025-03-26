import { Review } from "../entities/Review";
import { Slot } from "../entities/Turf";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { UpdateResult } from "mongodb";
import { Turf } from "../entities/Turf";
import { TurfDetails } from "../../domain/entities/Turf";
import { TurfModel } from "../../infrastructure/database/models/turfModel";

interface FullTurf extends Turf, TurfDetails {}



export interface UserRepository {
  createUser(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  generateOtp(email: string, person: number): Promise<void>;
  validateOtp(email: string, otp: string, person: number): Promise<string>;
  getIdByMail(email: string): Promise<string | null>;
  getUserDetails(id: string | null): Promise<User | null>;
  userName(userId: string): Promise<string>
  generateOtp(email: string, person: number): Promise<void>
  changePassword(id: string | null, password: string): Promise<User | null>
  googleAuthentication(email: string, name: string, password: string): Promise<any> 
  changePassword(id:string|null,password:string):Promise<User|null>
}
export interface TurfRelatedUserSideRepository {
  getTurfs(): Promise<FullTurf[]>;
  getTurfDetails(id: string): Promise<Turf | null>;
  getIdByMail(email: string): Promise<string | null>;
  addLocation(id: string, locationName: string, latitude: number, longitude: number): Promise<void>;
  getUserDetails(id: string | null): Promise<User | null>;
  updateRatings(review: Review): Promise<Review>;
  getReviews(turfId: string): Promise<[Review[], number, number]>;
  report(turfId: string, userId: string, issue: string): Promise<void>;
}


export interface BookingRepository {
  getIdByMail(email: string): Promise<string | null>;
  getSlots(turfId: string): Promise<Slot[] | void>;
  confirmBooking(ids: string[], userId: string | null, turfId: string): Promise<UpdateResult>;
  getBookings(id: string): Promise<any[]>;
  cancelBooking(slotId: string, bookingId: string, refund: number): Promise<any | null>;
}


export interface TeamRepository {
  createTeam(
    teamName: string,
    maxMembers: number,
    privacy: "public" | "private",
    userId: string
  ): Promise<Team>;

  getTeams(): Promise<Team[]>;

  joinTeam(teamId: string, userId: string): Promise<Team[]>;

  getTeam(id: string): Promise<Team | null>;

  leftRemoveTeam(teamId: string, userId: string): Promise<Team | null>;

  getSlotsForSell(id: string): Promise<any[]>;

  sellSlot(teamId: string, userId: string, vacancy: number, slotId: string): Promise<Team | null>;

  joinSlot(teamId: string, slotId: string, userId: string): Promise<Team | null>;

  getIdByMail(email: string): Promise<string | null>;
}
