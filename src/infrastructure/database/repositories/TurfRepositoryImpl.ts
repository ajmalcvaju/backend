import { Turf } from "../../../domain/entities/Turf";
// import { TurfRepository } from "../../../domain/repositories/TurfRepository";
import { TurfModel,TurfDocument } from "../models/turfModel";
import { TurfDetails } from "../../../domain/entities/Turf";
import { Slot } from "../../../domain/entities/Turf";
import { SlotModel } from "../models/slotModel";
import { User } from "../../../domain/entities/User";
import { UserModel } from "../models/userModel";
import { BookingModel } from "../models/bookingModel";
const { RRule, RRuleSet } = require('rrule');
import mongoose from "mongoose";
import { sendOtpEmail } from "../../services/emailService";
import jwt from "jsonwebtoken";
import { TurfBookSlotRepository, TurfInfoRepository, TurfRepository } from "../../../domain/repositories/TurfRepository";

interface UpdatedTurf extends Turf,TurfDetails{}


export const TurfRepositoryImpl: TurfRepository = {
async getUsers():Promise<User[]>{
  const users = await UserModel.find().sort({ online: 1, lastSeen: -1 });
   return users
},
};

export class TurfAuthRepositoryImpl {

  async createTurf(turf: Turf): Promise<Turf> {
    const createdTurf = await TurfModel.create(turf);
    return createdTurf.toObject();
  }

  async findByEmail(email: string): Promise<Turf | null> {
    const turf = await TurfModel.findOne({ email, isApproved: true });
    return turf ? turf.toObject() : null;
  }

  async updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf> {
    const updatedTurf = await TurfModel.findOneAndUpdate(
      { email },
      { $set: turfDetails },
      { new: true }
    );
    if (!updatedTurf) {
      throw new Error("Turf not found with the provided email.");
    }
    return updatedTurf.toObject() as UpdatedTurf;
  }

  async changePassword(id: string | null, password: string): Promise<Turf | null> {
    await TurfModel.updateOne({ _id: id }, { $set: { password } });
    return TurfModel.findOne({ _id: id });
  }

  async generateOtp(email: string, person: number): Promise<void> {
    try {
      let user;
      if (person === 1) {
        user = await UserModel.findOne({ email });
      } else if (person === 0) {
        user = await TurfModel.findOne({ email });
      }
      if (!user) {
        throw new Error("User not found");
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(otp);

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
    let user;
    if (person === 1) {
      user = await UserModel.findOne({ email });
    } else if (person === 0) {
      user = await TurfModel.findOne({ email });
    }

    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt!) {
      throw new Error("Invalid or expired OTP.");
    }
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = 1;
    await user.save();
    const role = person === 1 ? "user" : "turf";
    const token = jwt.sign(
      { email: user.email, role },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    return token;
  }

  async getTurfDetailsFromMail(email: string): Promise<TurfDocument | null> {
    return TurfModel.findOne({ email });
  }
}


export class TurfBookSlotRepositoryImpl implements TurfBookSlotRepository {
  async getTurfDetailsFromMail(email: string): Promise<TurfDocument | null> {
    return TurfModel.findOne({ email });
  }

  async updateSlot(
    turfId: string,
    startDate: Date,
    endDate: Date,
    prices: { [key: string]: string },
    turfSizes: ('5 vs 5' | '7 vs 7' | '11 vs 11')[]
  ): Promise<Slot[]> {
    console.log(turfId, startDate, endDate, prices, turfSizes);

    const turfSizeMultipliers: { [key in '5 vs 5' | '7 vs 7' | '11 vs 11']: number } = {
      '11 vs 11': 1,
      '7 vs 7': 0.9,
      '5 vs 5': 0.8,
    };

    const calculatePrice = (hour: number, day: number, turfSize: '5 vs 5' | '7 vs 7' | '11 vs 11'): number => {
      let basePrice: number;

      if (hour >= 0 && hour < 6) {
        basePrice = Number(prices.slot1);
      } else if (hour >= 6 && hour < 11) {
        basePrice = Number(prices.slot2);
      } else if (hour >= 11 && hour < 18) {
        basePrice = Number(prices.slot3);
      } else {
        basePrice = Number(prices.slot4);
      }

      if (day === 0) {
        basePrice = Number(prices[`slot${hour < 6 ? 9 : hour < 11 ? 10 : hour < 18 ? 11 : 12}`]);
      }
      if (day === 6) {
        basePrice = Number(prices[`slot${hour < 6 ? 5 : hour < 11 ? 6 : hour < 18 ? 7 : 8}`]);
      }

      return basePrice * turfSizeMultipliers[turfSize];
    };

    try {
      const ruleSet = new RRuleSet();
      ruleSet.rrule(
        new RRule({
          freq: RRule.DAILY,
          dtstart: new Date(startDate),
          until: new Date(endDate),
        })
      );

      const saveSlotPromises: Promise<Slot>[] = [];

      for (const date of ruleSet.all()) {
        const day = date.getDay();
        for (let hour = 0; hour < 24; hour++) {
          for (const turfSize of turfSizes) {
            const price = calculatePrice(hour, day, turfSize);
            const slotData = {
              turfId,
              turfSizes: turfSize,
              date: date.toISOString().split('T')[0],
              time: `${hour}:00`,
              price,
            };
            saveSlotPromises.push(new SlotModel(slotData).save());
          }
        }
      }
      return await Promise.all(saveSlotPromises);
    } catch (error) {
      console.error('Error updating slots:', error);
      throw new Error('Failed to update slots');
    }
  }

  async getSlots(turfId: string): Promise<Slot[]> {
    const slots = await SlotModel.find({ turfId }).sort({ date: 1, time: 1 });
    if (!slots.length) {
      throw new Error('No slot Found.');
    }
    return slots;
  }

  async currentSlots(turfId: string, date?: string): Promise<Slot[]> {
    console.log('turfId:', turfId, 'date:', date);
    const slots = await SlotModel.find({ turfId, date: '2024-12-20' });
    if (!slots.length) {
      throw new Error('No slots found.');
    }
    return slots;
  }

  async deleteSlot(id: string): Promise<void> {
    await SlotModel.deleteOne({ _id: id });
  }

  async getBookings(id: string): Promise<any[]> {
    const bookings = await BookingModel.find({ turfId: id })
      .populate('slotId', '_id time slotNumber turfSizes date')
      .populate('userId', 'firstName lastName mobileNumber email')
      .sort({ createdAt: -1 })
      .exec();

    return bookings.map((booking:any) => {
      const user = booking.userId as any;
      const slot = booking.slotId as any;
      
      return {
        _id: booking._id,
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || '',
        status: booking.status || '',
        time: slot?.time || '',
        date: slot?.date || '',
        slotNumber: slot?.slotNumber || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        mobileNumber: user?.mobileNumber ?? '',
        email: user?.email || '',
        turfSizes:slot?.turfSizes || ''
      };
    });
  }

  async cancelBooking(slotId: string, bookingId: string): Promise<void> {
    const slotObjectId = new mongoose.Types.ObjectId(slotId);
    const bookingObjectId = new mongoose.Types.ObjectId(bookingId);
    await SlotModel.updateOne({ _id: slotObjectId }, { $set: { isBooked: false }, $unset: { userId: '' } });
    await BookingModel.updateOne({ _id: bookingObjectId }, { $set: { status: 'cancelled', paid: 0 } });
  }
}

export class TurfInfoRepositoryImpl implements TurfInfoRepository {
  async updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf> {
    const updatedTurf = await TurfModel.findOneAndUpdate(
      { email },
      { $set: turfDetails },
      { new: true }
    );
    if (!updatedTurf) {
      throw new Error("Turf not found with the provided email.");
    }
    return updatedTurf.toObject() as UpdatedTurf;
  }

  async addLocation(id: string, locationName: string, latitude: number, longitude: number): Promise<void> {
    await TurfModel.updateOne(
      { _id: id },
      { locationName, latitude, longitude }
    );
  }

  async getTurfDetailsFromMail(email: string): Promise<TurfDocument | null> {
    return TurfModel.findOne({ email });
  }
}