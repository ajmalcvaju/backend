

export interface TurfUserAdminRepository {
  findUsers(): Promise<any[]>;
  findTurfs(): Promise<any[]>;
  blockUser(id: string, block: boolean): Promise<any[]>;
  blockTurf(id: string, block: boolean): Promise<any[]>;
}

export interface AdminBookingRepository {
  getBookings(): Promise<any[]>;
  getReviews(): Promise<any[] | null>;
  deleteReview(id: string): Promise<void>;
  payBalance(turfId: string, balance: number): Promise<any>;
}
