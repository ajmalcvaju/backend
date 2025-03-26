import { Request, Response, NextFunction } from "express";


export const authorizeRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: You don't have the required role" });
    }else{
          next();
    }
  };
};

 
 