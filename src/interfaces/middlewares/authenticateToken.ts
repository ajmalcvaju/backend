import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: Types.ObjectId | string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  }else{ 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string; role: string };
    req.user = decoded;
     next();
  } catch (err) {
     res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
} 
};
