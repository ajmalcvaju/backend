import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { User } from "../../../domain/entities/User";
import { sendOtpEmail } from "../../../infrastructure/services/emailService";
import { UserModel } from "../../../infrastructure/database/models/userModel";
import { TurfModel } from "../../../infrastructure/database/models/turfModel";



export class AuthUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(userData: User): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    return this.userRepository.createUser(userData);
  }

  async loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid Email or Password");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid Password");

    const token = jwt.sign({ email: user.email, role: "user" }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: "1d",
    });

    return { token, user };
  }

  async generateOtp(email: string, person: number): Promise<void> {
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
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp);
  }

  async validateOtp(email: string, otp: string, person: number): Promise<void | string> {
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
    const token = jwt.sign({ email: user.email, role }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: "1d",
    });

    return token;
  }

  async getUserByMail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserDetails(id: string | null): Promise<User | null> {
    return await this.userRepository.getUserDetails(id);
  }

  async changePassword(id: string, password: string): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.userRepository.changePassword(id, hashedPassword);
  }

  async googleAuthentication(email: string, userName: string): Promise<User | null> {
    const password = process.env.RANDOM_PASSWORD + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.googleAuthentication(email, userName, hashedPassword);
  }
}
