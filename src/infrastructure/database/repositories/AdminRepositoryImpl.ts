import { TurfUserAdminRepository } from "../../../domain/repositories/AdminRepository";
import { AdminBookingRepository } from "../../../domain/repositories/AdminRepository";
import { UserModel } from "../models/userModel";
import { User } from "../../../domain/entities/User";
import { Slot } from "../../../domain/entities/Turf";
import { TurfModel } from "../models/turfModel";
import { BookingModel } from "../models/bookingModel";
import ReportModel from "../models/reportModel";
import { ReviewModel } from "../models/reviewModel";

export class TurfUserAdminRepositoryImpl implements TurfUserAdminRepository {
  async findUsers(): Promise<any[]> {
    const users = await UserModel.find();
    const bookings = await BookingModel.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $project: { userId: "$_id", count: 1, _id: 0 } },
    ]);
    return [users, bookings];
  }

  async findTurfs(): Promise<any[]> {
    const turfs = await TurfModel.find();
    const reports = await ReportModel.find();
    const bookings = await BookingModel.aggregate([
      { $group: { _id: "$turfId", count: { $sum: 1 } } },
      { $project: { turfId: "$_id", count: 1, _id: 0 } },
    ]);
    return [turfs, reports, bookings];
  }

  async blockUser(id: string, block: boolean): Promise<any[]> {
    await UserModel.updateOne({ _id: id }, { $set: { isApproved: block } });
    return await UserModel.find();
  }

  async blockTurf(id: string, block: boolean): Promise<any[]> {
    await TurfModel.updateOne({ _id: id }, { $set: { isApproved: block } });
    return await TurfModel.find();
  }
}

export class AdminBookingRepositoryImpl implements AdminBookingRepository {
  async getBookings(): Promise<any[]> {
    const bookings = await BookingModel.find({})
      .populate("turfId", "turfName")
      .populate("slotId", "_id time slotNumber date")
      .populate("userId", "firstName lastName mobileNumber email")
      .sort({ createdAt: -1 })
      .exec();

    const flatBookings = bookings.map((booking) => {
      const user = booking.userId as User | any;
      const turf = booking.turfId as { turfName: string } | any;
      const slot = booking.slotId as Slot | any;
      return {
        _id: booking._id,
        price: booking.paid,
        status: booking.status,
        slotId: slot?._id || null,
        time: slot?.time || null,
        date: slot?.date || null,
        slotNumber: slot?.slotNumber || null,
        turfName: turf?.turfName || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        mobileNumber: user?.mobileNumber ?? "",
        email: user?.email || "",
      };
    });
    console.log("Flat bookings:", flatBookings);
    return flatBookings;
  }

  async getReviews(): Promise<any[] | null> {
    return await ReviewModel.find().populate({
      path: "userId",
      select: "firstName lastName",
    });
  }

  async deleteReview(id: string): Promise<void> {
    await ReviewModel.deleteOne({ _id: id });
  }

  async payBalance(turfId: string, balance: number): Promise<any> {
    return await TurfModel.findByIdAndUpdate(
      turfId,
      {
        $inc: { paid: balance },
        $push: { history: { amount: balance, date: new Date() } },
      },
      { new: true }
    );
  }
}
