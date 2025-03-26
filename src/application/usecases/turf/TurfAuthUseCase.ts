import { Turf } from "../../../domain/entities/Turf";
import { TurfAuthRepository } from "../../../domain/repositories/TurfRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../../infrastructure/database/models/userModel";
import { TurfModel } from "../../../infrastructure/database/models/turfModel";
import { sendOtpEmail } from "../../../infrastructure/services/emailService";

export class TurfAuthUseCase {
  constructor(private turfRepository: TurfAuthRepository) {}

  async listTurf(turfData: Turf): Promise<Turf> {
    const existingTurf = await this.turfRepository.findByEmail(turfData.email);
    if (existingTurf) throw new Error("Email already exists");
    
    const hashedPassword = await bcrypt.hash(turfData.password, 10);
    turfData.password = hashedPassword;
    
    return this.turfRepository.createTurf(turfData);
  }

  async generateOtp(email: string, person: number): Promise<void> {
    let user;
    if (person === 1) {
      user = await UserModel.findOne({ email });
    } else {
      user = await TurfModel.findOne({ email });
    }

    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp);
  }

  async validateOtp(email: string, otp: string, person: number): Promise<string> {
    let user;
    if (person === 1) {
      user = await UserModel.findOne({ email });
    } else {
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
    return jwt.sign({ email: user.email, role }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" });
  }

  async getTurfByMail(email: string): Promise<Turf | null> {
    return this.turfRepository.findByEmail(email);
  }

  async loginTurf(email: string, password: string): Promise<{ token: string; turf: Turf }> {
    const turf = await this.turfRepository.findByEmail(email);
    if (!turf) throw new Error("Invalid Email or Password");

    const isPasswordValid = await bcrypt.compare(password, turf.password);
    if (!isPasswordValid) throw new Error("Invalid Password");

    const token = jwt.sign({ email: turf.email, role: "turf" }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" });
    return { token, turf };
  }

  async getTurfDetailsFromMail(email: string) {
    return TurfModel.findOne({ email });
  }

  async changePassword(id: string, password: string): Promise<Turf | null> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.turfRepository.changePassword(id, hashedPassword);
  }
}
