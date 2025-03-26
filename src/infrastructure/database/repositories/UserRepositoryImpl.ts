import { User } from "../../../domain/entities/User";
import { Slot, Turf } from "../../../domain/entities/Turf";
import { TurfRelatedUserSideRepository, UserRepository } from "../../../domain/repositories/UserRepository";
import { UserModel, UserDocument } from "../models/userModel";
import { SlotModel } from "../models/slotModel";
import { UpdateResult } from "mongodb";
import mongoose from "mongoose";
import { ReviewModel } from "../models/reviewModel";
import { Review } from "../../../domain/entities/Review";
import { TurfModel } from "../models/turfModel";
import { BookingModel } from "../models/bookingModel";
import ReportModel from "../models/reportModel";
import { Team } from "../../../domain/entities/Team";
import { TeamModel } from "../models/TeamModel";
import { sendOtpEmail } from "../../services/emailService";
import jwt from "jsonwebtoken";
import { TurfDetails } from "../../../domain/entities/Turf";
import { BookingRepository } from "../../../domain/repositories/UserRepository";
interface FullTurf extends Turf, TurfDetails {}




export class UserRepositoryImpl implements UserRepository {
  async createUser(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  }

  async userName(userId: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return "";
    }
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    return `${firstName} ${lastName}`.trim();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email, isApproved: true });
    return user ? user.toObject() : null;
  }

  async generateOtp(email: string, person: number): Promise<void> {
    try {
      const userModel = person === 1 ? UserModel : TurfModel;
      const user = await UserModel.findOne({ email });
      if (!user) throw new Error("User not found");

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(otp)
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      await sendOtpEmail(email, otp);
    } catch (error) {
      console.error("Error generating OTP:", error);
      throw error;
    }
  }

  async validateOtp(email: string, otp: string, person: number): Promise<string> {
    const userModel = person === 1 ? UserModel : TurfModel;
    const user = await UserModel.findOne({ email });

    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt!) {
      throw new Error("Invalid or expired OTP.");
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = 1;
    await user.save();
 
    const role = person === 1 ? "user" : "turf";
    return jwt.sign({ email: user.email, role }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" });
  }

  async getIdByMail(email: string): Promise<string | null> {
    const user = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  }

  async getUserDetails(id: string | null): Promise<User | null> {
    if (!id) return null;
    const user = await UserModel.findById(id);
    return user ? user.toObject() : null;
  }

  async changePassword(id: string | null, password: string): Promise<User | null> {
    if (!id) return null;
    await UserModel.updateOne({ _id: id }, { $set: { password: password } });
    return UserModel.findOne({ _id: id });
  }

  async googleAuthentication(email: string, name: string, password: string): Promise<any> {
    try {
      const user = await UserModel.findOne({ email });
  
      if (user) {
        return user.toObject();
      }
  
      const createdUser = await UserModel.create({
        email,
        firstName: name,
        password,
        isApproved: 1,
        isVerified: 1,
      });
  
      return createdUser.toObject();
    } catch (error) {
      console.error("Error in googleAuthentication:", error);
      throw new Error("Failed to authenticate user with Google.");
    }
  }
  
}

export class TurfRelatedUserSideRepositoryImpl implements TurfRelatedUserSideRepository {
  async getTurfs(): Promise<FullTurf[]> {
    const turfs = await TurfModel.find();
    return turfs.map((turf) => turf.toObject() as FullTurf);
  }

  async getTurfDetails(id: string): Promise<Turf | null> {
    return await TurfModel.findOne({ _id: id });
  }

  async getIdByMail(email: string): Promise<string | null> {
    const user = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  }

  async addLocation(id: string, locationName: string, latitude: number, longitude: number): Promise<void> {
    await UserModel.updateOne(
      { _id: id },
      { locationName, latitude, longitude }
    );
  }

  async getUserDetails(id: string | null): Promise<User | null> {
    return await UserModel.findOne({ _id: id });
  }

  async updateRatings(review: Review): Promise<Review> {
    const ObjectId = mongoose.Types.ObjectId;
    const updatedReview = await ReviewModel.findOneAndUpdate(
      { turfId: review.turfId, userId: review.userId },
      review,
      { new: true, upsert: true }
    );
    
    const [ratingData] = await ReviewModel.aggregate([
      { $match: { turfId: new ObjectId(review.turfId) } },
      {
        $group: {
          _id: "$turfId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    await TurfModel.findOneAndUpdate(
      { _id: new ObjectId(review.turfId) },
      { rating: ratingData?.averageRating || 0, votes: ratingData?.totalReviews || 0 },
      { new: true, upsert: true }
    );

    return updatedReview.toObject();
  }

  async getReviews(turfId: string): Promise<[Review[], number, number]> {
    const ObjectId = mongoose.Types.ObjectId;
    const reviews = await ReviewModel.find({ turfId })
      .populate("turfId", "turfName")
      .populate("userId", "firstName lastName")
      .exec();
    
    const [ratingData] = await ReviewModel.aggregate([
      { $match: { turfId: new ObjectId(turfId) } },
      {
        $group: {
          _id: "$turfId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    
    return [reviews, ratingData?.averageRating || 0, ratingData?.totalReviews || 0];
  }

  async report(turfId: string, userId: string, issue: string): Promise<void> {
    await ReportModel.findOneAndUpdate(
      { turfId, userId },
      { issue },
      { upsert: true, new: true }
    );
  }
}



export class BookingRepositoryImpl implements BookingRepository {

  async getIdByMail(email: string): Promise<string | null> {
    const user = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  }
  
  async getSlots(turfId: string): Promise<Slot[] | void> {
    const slots = await SlotModel.find({ turfId }).sort({ date: 1, time: 1 });
    if (!slots) {
      throw new Error("No slot found.");
    }
    return slots;
  }

  async confirmBooking(
    ids: string[],
    userId: string | null,
    turfId: string
  ): Promise<UpdateResult> {
    const result = await SlotModel.updateMany(
      { _id: { $in: ids } },
      { isBooked: true, userId }
    );

    const slotPromises = ids.map(async (id) => {
      const slot = await SlotModel.findOne({ _id: id });
      const price = slot ? slot.price : 0;
      const newBooking = new BookingModel({
        slotId: id,
        turfId: turfId,
        userId: userId,
        paid: price,
      });
      await newBooking.save();
    });

    await Promise.all(slotPromises);
    return result;
  }

  async getBookings(id: string): Promise<any[]> {
    const bookings = await BookingModel.find({ userId: id })
      .populate("slotId", "_id time slotNumber turfSizes date")
      .populate("turfId", "_id turfName mobileNumber email")
      .sort({ createdAt: -1 })
      .exec();

    return bookings.map((booking) => {
      const turf = booking.turfId as Turf | any;
      const slot = booking.slotId as Slot | any;
      return {
        _id: booking._id,
        turfId: turf?._id || "",
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || "",
        status: booking.status || "",
        time: slot?.time || "",
        date: slot?.date || "",
        slotNumber: slot?.slotNumber || 0,
        turfName: turf?.turfName || "",
        mobileNumber: turf?.mobileNumber || "",
        email: turf?.email || "",
        turfSizes:slot?.turfSizes || ""
      };
    });
  }

  async cancelBooking(slotId: string, bookingId: string, refund: number): Promise<any | null> {
    const slotObjectId = new mongoose.Types.ObjectId(slotId);
    const bookingObjectId = new mongoose.Types.ObjectId(bookingId);
    const booking = await BookingModel.findById(bookingObjectId).exec();
    const adjustedPaid = booking ? booking.paid * (refund / 100) : 0;

    await SlotModel.updateOne(
      { _id: slotObjectId },
      { $set: { isBooked: false }, $unset: { userId: "" } }
    );

    await BookingModel.updateOne(
      { _id: bookingObjectId },
      { $set: { status: "cancelled", paid: adjustedPaid } }
    );
  }
}


import { TeamRepository } from "../../../domain/repositories/UserRepository";

export class TeamRepositoryImpl implements TeamRepository {
  async createTeam(
    teamName: string,
    maxMembers: number,
    privacy: "public" | "private",
    userId: string
  ): Promise<Team> {
    const newTeam = new TeamModel({
      teamName,
      maxMembers,
      privacy,
      members: [{ userId, isAdmin: true }],
    });
    await newTeam.save();
    return newTeam.toObject() as Team;
  }

  async getTeams(): Promise<Team[]> {
    return await TeamModel.find();
  }

  async joinTeam(teamId: string, userId: string): Promise<Team[]> {
    await TeamModel.findByIdAndUpdate(
      teamId,
      {
        $push: { members: { userId, isAdmin: false } },
        $set: { updatedAt: new Date() },
      },
      { new: true, runValidators: true }
    );
    return await TeamModel.find();
  }

  async getTeam(id: string): Promise<Team | null> {
    return await TeamModel.findOne({ _id: id }).populate({
      path: "members.userId",
      select: "firstName lastName",
    });
  }

  async leftRemoveTeam(teamId: string, userId: string): Promise<Team | null> {
    let team = await TeamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } } },
      { new: true }
    );
    if (team && team.members.length === 0) {
      team = await TeamModel.findByIdAndDelete(teamId);
    }
    return team;
  }

  async getSlotsForSell(id: string): Promise<any[]> {
    const bookings = await BookingModel.find()
      .populate("slotId", "_id time slotNumber date turfSizes")
      .populate("turfId", "_id turfName mobileNumber email locationName latitude longitude")
      .populate("userId", "_id firstName lastName mobileNumber")
      .sort({ createdAt: -1 })
      .exec();

    return bookings.map((booking) => {
      const turf = booking.turfId as Turf | any;
      const slot = booking.slotId as Slot | any;
      const user = booking.userId as User | any;
      return {
        _id: booking._id,
        turfId: turf?._id || "",
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || "",
        status: booking.status || "",
        time: slot?.time || "",
        date: slot?.date || "",
        turfSize:slot?.turfSizes||"",
        slotNumber: slot?.slotNumber || 0,
        turfName: turf?.turfName || "",
        mobileNumber: turf?.mobileNumber || "",
        email: turf?.email || "",
        latitude: turf?.latitude || 0,
        longitude: turf?.longitude || 0,
        location: turf?.locationName || "",
        userName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        userMobileNumber: user?.mobileNumber || "",
      };
    });
  }

  async sellSlot(teamId: string, userId: string, vacancy: number, slotId: string): Promise<Team | null> {
    return await TeamModel.findOneAndUpdate(
      { _id: teamId },
      {
        $push: {
          slots: {
            slotId: new mongoose.Types.ObjectId(slotId),
            vacancy,
            members: [{ userId: new mongoose.Types.ObjectId(userId), isAdmin: true }]
          }
        }
      },
      { new: true, runValidators: true }
    );
  }

  async joinSlot(teamId: string, slotId: string, userId: string): Promise<Team | null> {
    return await TeamModel.findOneAndUpdate(
      { _id: teamId, "slots.slotId": slotId },
      {
        $push: { "slots.$.members": { userId: new mongoose.Types.ObjectId(userId) } },
        $inc: { "slots.$.vacancy": -1 }
      },
      { new: true, runValidators: true }
    );
  }

  async getIdByMail(email: string): Promise<string | null> {
    const user = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  }
}



