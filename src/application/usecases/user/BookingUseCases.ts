import { BookingRepository } from "../../../domain/repositories/UserRepository";
import { Slot } from "../../../domain/entities/Turf";
import { UpdateResult } from "mongoose";

export class BookingUseCases {
  constructor(private bookingRepository: BookingRepository) {}
  
  async getIdByMail(email: string): Promise<string | null> {
    return await this.bookingRepository.getIdByMail(email);
  }

  async getSlots(turfId: string): Promise<Slot[] | void> {
    return await this.bookingRepository.getSlots(turfId);
  }

  async confirmBooking(ids: string[], userId: string | null, turfId: string): Promise<UpdateResult> {
    return await this.bookingRepository.confirmBooking(ids, userId, turfId);
  }

  async getBookings(id: string): Promise<any[]> {
    return await this.bookingRepository.getBookings(id);
  }

  async cancelBooking(slotId: string, bookingId: string, refund: number): Promise<any | null> {
    return await this.bookingRepository.cancelBooking(slotId, bookingId, refund);
  }
}
