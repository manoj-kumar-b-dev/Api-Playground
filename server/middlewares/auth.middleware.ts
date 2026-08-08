import { AuthenticatedRequest } from "../types";
import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { verify } from "node:crypto";

import User from "../models/user.model";

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401).json({
      status: false,
      message: "Access Denied. No token provided."
    });
    return;
  }

  let token: string | undefined;
  try {
    token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Access Denied, Token is missing." });
      return;
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        status: false,
        message: "Invalid token payload."
      });
      return;
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({
        status: false,
        message: "User no longer exists."
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Token is invalid or expired"
    });
  }
};