import { TurfBookSlotRepository } from "../../../domain/repositories/TurfRepository";
import { Slot } from "../../../domain/entities/Turf";

export class TurfBookSlotUseCase {
  constructor(private turfBookSlotRepository: TurfBookSlotRepository) {}

  async getTurfDetails(email: string) {
    return this.turfBookSlotRepository.getTurfDetailsFromMail(email);
  }

  async updateSlots(
    turfId: string,
    startDate: Date,
    endDate: Date,
    prices: { [key: string]: string },
    turfSizes: ('5 vs 5' | '7 vs 7' | '11 vs 11')[]
  ): Promise<Slot[]> {
    return this.turfBookSlotRepository.updateSlot(turfId, startDate, endDate, prices, turfSizes);
  }

  async fetchSlots(turfId: string) {
    return this.turfBookSlotRepository.getSlots(turfId);
  }

  async fetchCurrentSlots(turfId: string, date?: string) {
    return this.turfBookSlotRepository.currentSlots(turfId, date);
  }

  async removeSlot(id: string) {
    return this.turfBookSlotRepository.deleteSlot(id);
  }

  async fetchBookings(id: string) {
    return this.turfBookSlotRepository.getBookings(id);
  }

  async cancelUserBooking(slotId: string, bookingId: string) {
    return this.turfBookSlotRepository.cancelBooking(slotId, bookingId);
  }
}
