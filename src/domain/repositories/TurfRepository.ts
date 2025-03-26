import { TurfDocument } from "../../infrastructure/database/models/turfModel";
import { Slot, Turf, TurfDetails } from "../entities/Turf";
import { User } from "../entities/User";
interface UpdatedTurf extends Turf,TurfDetails{}

export interface TurfRepository{
  getUsers():Promise<User[]>
}

export interface TurfAuthRepository {
  createTurf(turf: Turf): Promise<Turf>;
  findByEmail(email: string): Promise<Turf | null>;
  updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf>;
  changePassword(id: string | null, password: string): Promise<Turf | null>;
  generateOtp(email: string, person: number): Promise<void>;
  validateOtp(email: string, otp: string, person: number): Promise<string>;
  getTurfDetailsFromMail(email: string): Promise<TurfDocument | null>;
}


export interface TurfBookSlotRepository {
  getTurfDetailsFromMail(email: string): Promise<TurfDocument | null>;
  updateSlot(
    turfId: string,
    startDate: Date,
    endDate: Date,
    prices: { [key: string]: string },
    turfSizes: ('5 vs 5' | '7 vs 7' | '11 vs 11')[]
  ): Promise<Slot[]>;
  getSlots(turfId: string): Promise<Slot[]>;
  currentSlots(turfId: string, date?: string): Promise<Slot[]>;
  deleteSlot(id: string): Promise<void>;
  getBookings(id: string): Promise<any[]>;
  cancelBooking(slotId: string, bookingId: string): Promise<void>;
}

export interface TurfInfoRepository {
  updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf>;
  addLocation(
    id: string,
    locationName: string,
    latitude: number,
    longitude: number
  ): Promise<void>;
  getTurfDetailsFromMail(email: string): Promise<TurfDocument | null>;
}
