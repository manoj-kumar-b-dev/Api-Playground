import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateAccessToken } from "../utils/jwt";
import { generateResetToken } from "../utils/crypto";
import { sendResetPasswordEmail } from "../utils/email";
import crypto from "crypto";
import { success } from "zod";

export const register = async (req: Request, res: Response) => {

  // Guard: fail fast if DB is not connected instead of hanging
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again shortly.",
    });
  }

  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered"
      })
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })
    const accessToken = generateAccessToken({ userId: user._id.toString() })
    return res.status(201).json({
      success: true,
      message: "User registered succesfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      accessToken
    })
  }
  catch (error) {
    return res.status(500).json({
      message: "Server Error",
      success: false,
      error
    })
  }

}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    const accessToken = generateAccessToken({ userId: user._id.toString() })

    return res.status(200).json({
      success: true,
      message: "Login Successfull! Credentials verified",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      accessToken
    })

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error", error
    })
  }

}
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email doesn't exist"
      })
    }

    // Replace lines 105-106 with:
    const { resetToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || `http://localhost:5175`
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`
    await sendResetPasswordEmail(email, resetUrl)
    return res.status(200).json({
      success: true,
      message: "Password Reset Email is Sent✅ "
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error
    })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date()
      }
    })

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      })
      return
    }
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save()
    return res.status(200).json({
      success: true,
      message: "Password reset successfull! You can log in with new password"
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error
    })
  }

}

