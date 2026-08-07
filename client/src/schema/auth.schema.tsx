import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email()),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
})

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot be exceed 50 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email()),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must have at least one uppercase character")
    .regex(/[a-z]/, "Password must have at least one lowercase character")
    .regex(/[0-9]/, "Password must have at least one number")
})

export type RegisterFormData = z.infer<typeof registerSchema>;