import { AdminBookingRepository } from "../../../domain/repositories/AdminRepository";

export class AdminBookingUseCase {
  constructor(private readonly bookingRepo: AdminBookingRepository) {}

  async fetchBookings() {
    return await this.bookingRepo.getBookings();
  }

  async fetchReviews() {
    return await this.bookingRepo.getReviews();
  }

  async removeReview(id: string) {
    return await this.bookingRepo.deleteReview(id);
  }

  async processPayment(turfId: string, balance: number) {
    return await this.bookingRepo.payBalance(turfId, balance);
  }
}
