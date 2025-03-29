import { NextFunction, Request, Response } from "express";
// import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";

import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";
import { getMessages } from "../../application/usecases/getMessages";
import { generateAccessToken, generateRefreshToken } from "../../infrastructure/services/token";



import { AuthUseCase } from "../../application/usecases/user/AuthUseCase";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { TurfRelatedUserSideUseCases } from "../../application/usecases/user/TurfRelatedUserSideUseCases";
import { TurfRelatedUserSideRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { BookingRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { BookingUseCases } from "../../application/usecases/user/BookingUseCases";
import { TeamRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { TeamUseCase } from "../../application/usecases/user/TeamUseCase";

const bookingRepository = new BookingRepositoryImpl();
const bookingUseCases = new BookingUseCases(bookingRepository);
const authUseCase = new AuthUseCase(new UserRepositoryImpl());
const turfUseCases = new TurfRelatedUserSideUseCases(new TurfRelatedUserSideRepositoryImpl());
const teamRepository = new TeamRepositoryImpl();
const teamUseCase = new TeamUseCase(teamRepository);


export class userController {
  static async register(req: Request, res: Response,next: NextFunction) {
    try {
      const user = await authUseCase.registerUser(req.body);
      await authUseCase.generateOtp(user.email, 1);
      res.status(200).json({ message: "User registered. OTP sent to your email." });
    } catch (error: any) {
      next(error);
    }
  }

  static async validateOtp(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, otp } = req.body;
      console.log(req.body);
      const token = await authUseCase.validateOtp(email, otp, 1);
      const user = await authUseCase.getUserByMail(email);

      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "OTP verified successfully. You can now log in.",
        token,
        user,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authUseCase.loginUser(email, password);

      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ message: "You can now log in.", accessToken, user });
    } catch (error: any) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { email } = req.body;
      await authUseCase.generateOtp(email, 1);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyOtpForgotPassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, otp } = req.body;
      console.log(req.body)
      await authUseCase.validateOtp(email, otp, 1);
      res.status(200).json({ message: "OTP Verified Successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async changeForgottenPassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await authUseCase.getUserByMail(email);
      if (!user) throw new Error("User not found");
      await authUseCase.changePassword(user._id,password);
      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({user,message: "Password changed successfully. You can now log in." });
    } catch (error: any) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { id, password } = req.body;
      await authUseCase.changePassword(id,password);
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error: any) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response,next: NextFunction) {
    try {
      await authUseCase.generateOtp(req.body.email, 1);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response,next: NextFunction) {
    try {
      const { fullname, email } = req.body;
      const user = await authUseCase.googleAuthentication(email, fullname);
      console.log(user);
      const accessToken = generateAccessToken({ id: user?.email as string, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      const refreshToken = generateRefreshToken({ id: user?.email as string, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ user, message: "You logged in successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getTurf(req: Request, res: Response,next: NextFunction) {
    try {
      const turfs = await turfUseCases.getTurfs();
      res.status(200).json({ turfs });
    } catch (error: any) {
      next(error);
    }
  }

  static async getTurfDetails(req: Request, res: Response,next: NextFunction) {
    try {
      const { id } = req.params;
      const turfDetails = await turfUseCases.getTurfDetails(id);
      if (!turfDetails) {
        throw new Error("Turf not found");
      }
      res.status(200).json({ turfDetails });
    } catch (error: any) {
      next(error);
    }
  }

  static async addLocation(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, locationName, latitude, longitude } = req.body;
      const userId = await turfUseCases.getIdByMail(email);
      if (!userId) {
        throw new Error("User not found");
      }
      await turfUseCases.addLocation(userId, locationName, latitude, longitude);
      res.status(200).json({ message: "Location added successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getLocation(req: Request, res: Response,next: NextFunction) {
    try {
      const { email } = req.query as { email: string };
      const userId = await turfUseCases.getIdByMail(email);
      if (!userId) {
       throw new Error("User not found");
      }
      const user = await turfUseCases.getUserDetails(userId);
      res.status(200).json({ user });
    } catch (error: any) {
      next(error);
    }
  }

  static async giveRatings(req: Request, res: Response,next: NextFunction) {
    try {
      const review = await turfUseCases.updateRatings(req.body);
      res.status(200).json({ review, message: "Review updated successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getRatings(req: Request, res: Response,next: NextFunction) {
    try {
      const { id } = req.params;
      const [reviews, rating, votes] = await turfUseCases.getReviews(id);
      res.status(200).json({ Review: reviews, rating, votes });
    } catch (error: any) {
      next(error);
    }
  }

  static async report(req: Request, res: Response,next: NextFunction) {
    try {
      const { issue, turfId, userId } = req.body;
      await turfUseCases.report(turfId, userId, issue);
      res.status(200).json({ message: "Turf reported successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getSlots(req: Request, res: Response,next: NextFunction) {
    try {
      const { id } = req.query;
      const slots = await bookingUseCases.getSlots(id as string);
      res.status(200).json({ slots });
    } catch (error: any) {
      next(error);
    }
  }

  static async confirmBooking(req: Request, res: Response,next: NextFunction) {
    try {
      const { slotId, email, turfId } = req.body;
      const userId = await bookingUseCases.getIdByMail(email);
      await bookingUseCases.confirmBooking(slotId, userId, turfId);
      res.status(200).json({ message: "Slot Booked successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getBookings(req: Request, res: Response,next: NextFunction) {
    try {
      const { email } = req.params;
      const userId = await bookingUseCases.getIdByMail(email);
      const bookings = await bookingUseCases.getBookings(userId as string);
      res.status(200).json(bookings);
    } catch (error: any) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response,next: NextFunction) {
    try {
      const { slotId, bookingId, refundPercentage } = req.body;
      await bookingUseCases.cancelBooking(slotId, bookingId, refundPercentage);
      res.status(200).json({ success: true });
    } catch (error: any) {
      next(error);
    }
  }
  
  static async getTeams(req: Request, res: Response,next: NextFunction) {
    try {
      const teams = await teamUseCase.getTeams();
      res.status(200).json({ teams, message: "Fetched teams successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async createTeam(req: Request, res: Response,next: NextFunction) {
    try {
      const { teamName, maxMembers, privacy, userId } = req.body;
      const team = await teamUseCase.createTeam(teamName, maxMembers, privacy, userId);
      res.status(200).json({ team, message: "Created team successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async joinTeam(req: Request, res: Response,next: NextFunction) {
    try {
      const { teamId, userId } = req.body;
      console.log(req.body);
      const teams = await teamUseCase.joinTeam(teamId, userId);
      res.status(200).json({ teams, message: "Joined team successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getTeam(req: Request, res: Response,next: NextFunction) {
    try {
      const { id } = req.params;
      const team = await teamUseCase.getTeam(id);
      res.status(200).json({ team, message: "Fetched team successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async getSlotForSell(req: Request, res: Response,next: NextFunction) {
    try {
      const { email } = req.params;
      const userId = await teamUseCase.getIdByMail(email);
      if (!userId) throw new Error("User not found");
      
      const bookings = await teamUseCase.getSlotsForSell(userId);
      res.status(200).json(bookings);
    } catch (error: any) {
      next(error);
    }
  }

  static async leftRemoveTeam(req: Request, res: Response,next: NextFunction) {
    try {
      const { teamId, userId } = req.body;
      console.log(req.body);
      const team = await teamUseCase.leftRemoveTeam(teamId, userId);
      res.status(200).json({ team, message: "Removed/left successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async sellSlot(req: Request, res: Response,next: NextFunction) {
    try {
      console.log(req.body);
      const { teamId, userId, vacancy, slotId } = req.body;
      const team = await teamUseCase.sellSlot(teamId, userId, vacancy, slotId);
      res.status(200).json({ team, message: "Your slot sold successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  static async joinSlot(req: Request, res: Response,next: NextFunction) {
    try {
      const { teamId, slotId, userId } = req.body;
      const team = await teamUseCase.joinSlot(teamId, slotId, userId);
      res.status(200).json({ team, message: "Joined slot successfully" });
    } catch (error: any) {
      next(error);
    }
  }
}

export const userOtherController = {
  getMessages: async (req: Request, res: Response,next: NextFunction) => {
    try {
      const sender = req.query.sender as string;
      const reciever = req.query.reciever as string;
      const messages = await getMessages(
        MessageRepositoryImpl,
        sender,
        reciever
      );
      res.status(200).json({ messages });
    } catch (error: any) {
      next(error);
    }
  },
};

