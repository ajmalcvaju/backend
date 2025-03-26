import jwt from "jsonwebtoken";
import { Types } from "mongoose";

// Generate Access Token
export const generateAccessToken = (
  payload: { id: Types.ObjectId | string; role: string }
): string => {
  try {
    const secret = process.env.JWT_SECRET_KEY || "defaultSecretKey"; // Use a fallback in case env var is missing
    const token = jwt.sign(
      { data: payload.id, role: payload.role },
      secret,
      { expiresIn: "5m" }
    );
    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};

// Generate Refresh Token
export const generateRefreshToken = (
  payload: { id: Types.ObjectId | string; role: string }
): string => {
  try {
    const secret = process.env.JWT_SECRET_KEY || "defaultSecretKey"; // Use a fallback in case env var is missing
    const token = jwt.sign(
      { data: payload.id, role: payload.role },
      secret,
      { expiresIn: "48h" }
    );
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
};

// Verify Token (Access or Refresh)
export const verifyToken = (token: string): { data: string; role: string } | null => {
  try {
    const secret = process.env.JWT_SECRET_KEY || "defaultSecretKey"; // Use a fallback in case env var is missing
    const decoded = jwt.verify(token, secret) as { data: string; role: string };
    return decoded;
  } catch (error) {
    console.error("Error while verifying token:", error);
    return null; // Return null for invalid/expired tokens
  }
};

export const verifyRefreshToken = (token: string): { data: string; role: string } | null => {
  try {
    const secret = process.env.JWT_SECRET_KEY || "defaultSecretKey"; // Use a fallback in case env var is missing
    const decoded = jwt.verify(token, secret) as { data: string; role: string };
    return decoded;
  } catch (error) {
    console.error("Error while verifying refresh token:", error);
    return null; // Return null for invalid/expired tokens
  }
};


