import { NextFunction, Request, Response } from "express";
// import { TurfRepositoryImpl } from "../../infrastructure/database/repositories/TurfRepositoryImpl";
import { uploadedImage } from "../../application/usecases/UploadImage";
// import { getSlots } from "../../application/usecases/getSlots";
import { getMessages } from "../../application/usecases/getMessages";
import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";
import { getUsers } from "../../application/usecases/turf/getUsers";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../infrastructure/services/token";

interface CustomRequest extends Request {
  files?: Express.Multer.File[];
}

import { TurfAuthUseCase } from "../../application/usecases/turf/TurfAuthUseCase";
import { TurfAuthRepositoryImpl, TurfInfoRepositoryImpl, TurfRepositoryImpl } from "../../infrastructure/database/repositories/TurfRepositoryImpl";
import { TurfBookSlotUseCase } from "../../application/usecases/turf/TurfBookSlotUseCase";
import { TurfBookSlotRepositoryImpl } from "../../infrastructure/database/repositories/TurfRepositoryImpl";
import { TurfInfoUseCase } from "../../application/usecases/turf/TurfInfoUseCase";

export class TurfController {
  private turfAuthUseCase: TurfAuthUseCase;

  constructor() {
    this.turfAuthUseCase = new TurfAuthUseCase(new TurfAuthRepositoryImpl());
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const turf = await this.turfAuthUseCase.listTurf(req.body);
      console.log(turf.email);
      await this.turfAuthUseCase.generateOtp(turf.email, 0);
      res.status(200).json({ message: "Turf registered. OTP sent to your email." });
    } catch (error: any) {
      next(error);
    }
  }

  async validateOtp(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const token = await this.turfAuthUseCase.validateOtp(email, otp, 0);
      const turf = await this.turfAuthUseCase.getTurfByMail(email);
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      const refreshToken = generateRefreshToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 5 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json({ message: "OTP verified successfully.", token, turf });
    } catch (error: any) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response,next: NextFunction) {
    try {
      await this.turfAuthUseCase.generateOtp(req.body.email, 0);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { turf, token } = await this.turfAuthUseCase.loginTurf(email, password);
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      const refreshToken = generateRefreshToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 5 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json({ message: "Login successful.", token, turf });
    } catch (error: any) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response,next: NextFunction) {
    try {
      await this.turfAuthUseCase.generateOtp(req.body.email, 0);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyOtpForgotPassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const token = await this.turfAuthUseCase.validateOtp(email, otp, 0);
      res.status(200).json({ message: "OTP verified successfully.", token });
    } catch (error: any) {
      next(error);
    }
  }

  async changeForgottenPassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, password } = req.body;
      const turfDetails = await this.turfAuthUseCase.getTurfDetailsFromMail(email);
      const turfId = turfDetails?._id as string;
      const turf = await this.turfAuthUseCase.changePassword(turfId, password);
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      const refreshToken = generateRefreshToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 24 * 5 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: false, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json({ message: "Password changed successfully.", accessToken, turf });
    } catch (error: any) {
      next(error);
    }
  }
}

export const turfController = new TurfController();


export const turfChatController = {
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
  getUserForChat: async (req: Request, res: Response,next: NextFunction) => {
    try {
      const users = await getUsers(TurfRepositoryImpl);
      res.status(200).json({ users });
    } catch (error: any) {
      next(error);
    }
  }
};


export class TurfBookingController {
  private turfBookSlotUseCase: TurfBookSlotUseCase;

  constructor() {
    const turfBookSlotRepository = new TurfBookSlotRepositoryImpl();
    this.turfBookSlotUseCase = new TurfBookSlotUseCase(turfBookSlotRepository);
  }

  async slotUpdate(req: Request, res: Response,next: NextFunction) {
    try {
      const email = req.body.email;
      const { startDate, endDate, turfSizes, ...prices } = req.body.data;
      const turfDetails = await this.turfBookSlotUseCase.getTurfDetails(email);
      const id = turfDetails?._id as string;

      const slots = await this.turfBookSlotUseCase.updateSlots(
        id,
        startDate,
        endDate,
        prices,
        turfSizes
      );

      res.status(200).json({ slots });
    } catch (error: any) {
      next(error);
    }
  }

  async getSlots(req: Request, res: Response,next: NextFunction) {
    try {
      const email = req.params.email;
      const turfDetails = await this.turfBookSlotUseCase.getTurfDetails(email);
      const id = turfDetails?._id as string;

      console.log(id);
      const slots = await this.turfBookSlotUseCase.fetchSlots(id);
      res.status(200).json({ slots });
    } catch (error: any) {
      next(error);
    }
  }

  async currentSlots(req: Request, res: Response,next: NextFunction) {
    try {
      const { email, date } = req.params;
      const turfDetails = await this.turfBookSlotUseCase.getTurfDetails(email);
      const id = turfDetails?._id as string;

      console.log(id);
      const slots = await this.turfBookSlotUseCase.fetchCurrentSlots(id, date);
      console.log(slots);
      res.status(200).json({ slots });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteSlot(req: Request, res: Response,next: NextFunction) {
    try {
      const id = req.params.id;
      await this.turfBookSlotUseCase.removeSlot(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      next(error);
    }
  }

  async getBookings(req: Request, res: Response,next: NextFunction) {
    try {
      const { email } = req.params;
      const turfDetails = await this.turfBookSlotUseCase.getTurfDetails(email);
      const id = turfDetails?._id as string;

      const bookings = await this.turfBookSlotUseCase.fetchBookings(id);
      res.status(200).json(bookings);
    } catch (error: any) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response,next: NextFunction) {
    try {
      console.log(req.body)
      const slotId = req.body.slotId as string;
      const bookingId = req.body.bookingId as string;
      await this.turfBookSlotUseCase.cancelUserBooking(slotId, bookingId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      next(error);
    }
  }
}

export const turfBookingController = new TurfBookingController();





const turfInfoRepository = new TurfInfoRepositoryImpl();
const turfInfoUseCase = new TurfInfoUseCase(turfInfoRepository);

export class TurfInfoController {
  async updateTurfDetails(req: Request, res: Response) {
    try {
      const customReq = req as CustomRequest;
      if (!customReq.files) throw new Error("No files uploaded");

      const uploadedImages = await uploadedImage(customReq.files);
      const { email, ...data } = customReq.body;
      const updatedData = { ...data, gallery: uploadedImages };

      const updatedTurf = await turfInfoUseCase.updateTurfDetails(email, updatedData);

      res.status(200).json(updatedTurf);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addLocation(req: Request, res: Response) {
    try {
      const { email, locationName, latitude, longitude } = req.body;
      const turfDetails = await turfInfoUseCase.fetchTurfDetails(email);

      if (!turfDetails) {
        throw new Error("Turf not found.");
      }

      await turfInfoUseCase.addTurfLocation(String(turfDetails._id), locationName, latitude, longitude);

      res.status(200).json({ message: "Location added successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getTurfDetails(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const turfDetails = await turfInfoUseCase.fetchTurfDetails(email);

      res.status(200).json(turfDetails);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const turfInfoController = new TurfInfoController();

