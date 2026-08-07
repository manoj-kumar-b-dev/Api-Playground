import { AuthenticatedRequest } from "../types";
import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { verify } from "node:crypto";

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {

  let authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer")) {

    res.status(401).json({
      status: false,
      message: "Access Denied. No token provided."
    })
    return
  }

  let token: string | undefined
  try {
    token = authHeader.split(" ")[1]
    if (!token) {
      res.status(401).json({ message: "Access Denied, Token is missing." });
      return;
    }
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        status: false,
        message: "Invalid token payload."
      })
      return
    }
    req.user = { id: decoded.userId }
    next()
  }
  catch (error) {
    res.status(401).json({
      status: false,
      message: "Token is invalid or expired"
    })
  }

}