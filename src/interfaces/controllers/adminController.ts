import { NextFunction, Request, Response } from "express";
import { loginAdmin } from "../../application/usecases/admin/loginAdmin";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../infrastructure/services/token";
import { TurfUserAdmin } from "../../application/usecases/admin/TurfUserAdminUseCases";
import { TurfUserAdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryImpl";
import { AdminBookingUseCase } from "../../application/usecases/admin/AdminBookingUseCase";
import { AdminBookingRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryImpl";

export const adminAuthController = {
  login: async (req: Request, res: Response,next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const token = await loginAdmin(email, password);
      const accessToken = generateAccessToken({ id: email, role: "admin" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
      const refreshToken = generateRefreshToken({
        id: email,
        role: "admin",
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      // res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
      res.status(200).json({ message: "you can login now", token });
    } catch (error: any) {
      next(error);
    }
  },
  refreshToken: async (req: Request, res: Response,next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log(refreshToken);
      if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
      } else {
        const decoded = verifyRefreshToken(refreshToken);
        const data = decoded?.data as string;
        const role = decoded?.role as string;
        console.log(role);
        const newAccessToken = generateAccessToken({ id: data, role: role });
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
        });
        res.status(200).json({ accessToken: newAccessToken });
      }
    } catch (error: any) {
      next(error);
    }
  },
};

export class AdminController {
  private adminUseCase: TurfUserAdmin;

  constructor() {
    const adminRepo = new TurfUserAdminRepositoryImpl();
    this.adminUseCase = new TurfUserAdmin(adminRepo);
  }

  async getUsers(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const users = await this.adminUseCase.getUsers();
      const user = Array.isArray(users) && users[0] ? users[0] : [];
      const booking = Array.isArray(users) && users[1] ? users[1] : [];
      res.status(200).json({ users: user, bookings: booking });
    } catch (error: any) {
      next(error);
    }
  }

  async getTurfs(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const turfs = await this.adminUseCase.getTurfs();
      const turf = Array.isArray(turfs) && turfs[0] ? turfs[0] : [];
      const report = Array.isArray(turfs) && turfs[1] ? turfs[1] : [];
      const booking = Array.isArray(turfs) && turfs[2] ? turfs[2] : [];
      res.status(200).json({ turfs: turf, reports: report, bookings: booking });
    } catch (error: any) {
      next(error);
    }
  }

  async blockUser(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const { id, block } = req.body;
      console.log(req.body);
      const users = await this.adminUseCase.toggleUserBlock(
        id,
        Boolean(parseInt(block))
      );
      res.status(200).json(users);
    } catch (error: any) {
      next(error);
    }
  }

  async blockTurf(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const { id, block } = req.body;
      console.log(req.body);
      const turfs = await this.adminUseCase.toggleTurfBlock(
        id,
        Boolean(parseInt(block))
      );
      res.status(200).json(turfs);
    } catch (error: any) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

export class AdminBookingController {
  private readonly adminBookingUseCase: AdminBookingUseCase;

  constructor() {
    const adminBookingRepo = new AdminBookingRepositoryImpl();
    this.adminBookingUseCase = new AdminBookingUseCase(adminBookingRepo);
  }

  async getBookings(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const bookings = await this.adminBookingUseCase.fetchBookings();
      res.status(200).json({ bookings });
    } catch (error: any) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const reviews = await this.adminBookingUseCase.fetchReviews();
      res.status(200).json(reviews);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.adminBookingUseCase.removeReview(id);
      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error: any) {
      next(error);
    }
  }

  async payBalance(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const { turfId, balance } = req.body;
      const turf = await this.adminBookingUseCase.processPayment(
        turfId,
        balance
      );
      res
        .status(200)
        .json({ turf, message: "Turf's balance updated successfully" });
    } catch (error: any) {
      next(error);
    }
  }
}
