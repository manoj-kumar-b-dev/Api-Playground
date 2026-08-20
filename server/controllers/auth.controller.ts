import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateAccessToken } from "../utils/jwt";
import { generateResetToken } from "../utils/crypto";
import { sendResetPasswordEmail } from "../utils/email";
import crypto from "crypto";
import { success } from "zod";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again shortly.",
    });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
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
  catch (error: any) {
    console.error("Login controller error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error during login",
      error: error instanceof Error ? error.message : String(error)
    });
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

export const googleLogin = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again shortly.",
    });
  }

  try {
    const { credential, idToken, accessToken, access_token } = req.body;
    const tokenToVerify = credential || idToken;
    const bearerToken = accessToken || access_token;

    if (!tokenToVerify && !bearerToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token or access token is required",
      });
    }

    let payload: any = null;

    if (tokenToVerify) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        try {
          const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
          if (response.ok) {
            payload = await response.json();
          }
        } catch (fetchErr) {
          console.error("Token verification fallback failed:", fetchErr);
        }
      }
    }

    if (!payload && bearerToken) {
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${bearerToken}` },
        });
        if (response.ok) {
          payload = await response.json();
        }
      } catch (userinfoErr) {
        console.error("Google userinfo fetch failed:", userinfoErr);
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token or email not provided by Google",
      });
    }

    const { email, name, picture, sub, id } = payload;
    const googleId = sub || id;

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        authProvider: "google",
      });
    }

    const jwtToken = generateAccessToken({ userId: user._id.toString() });

    return res.status(200).json({
      success: true,
      message: "Google Sign-In successful!",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider || "google",
      },
      accessToken: jwtToken,
    });
  } catch (error: any) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to authenticate with Google",
      error,
    });
  }
};

