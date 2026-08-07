import { email, z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string("Name is required")
      .trim()
      .min(2, "Name must be atleast 2 charcaters long")
      .max(50, "Name cannot exceed 50 characters"),
    email: z
      .string("Email is required")
      .trim()
      .pipe(z.email("please enter a valid email address")),
    password: z
      .string("Password is required")
      .min(8, "password at least 8 characters long")
      .regex(/[A-Z]/, "password mush have at least one uppercase character")
      .regex(/[a-z]/, "password mush have at least one lowercase character")
      .regex(/[0-9]/, "password mush have at least one number")
  })
})


export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .trim()
      .pipe(z.email("Enter a valid email address")),
    password: z
      .string()
      .trim()
      .min(1, "password is required")

  })
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .pipe(z.email())
  })
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string("Token is required")
      .min(1, "Token is required")
    ,
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must have at least one uppercase character")
      .regex(/[a-z]/, "Password must have at least one lowercase character")
      .regex(/[0-9]/, "Password must have at least one number")
  })
})



