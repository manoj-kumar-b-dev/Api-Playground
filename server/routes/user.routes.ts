import Router from "express";
import { protect } from "../middlewares/auth.middleware";
import { AuthenticatedRequest } from "../types";
import { Response } from "express"

const router = Router()

router.get("/me", protect, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  return res.status(200).json({
    success: true,
    message: "you are accessing protected routes",
    userId: req.user.id
  })
})

export default router;