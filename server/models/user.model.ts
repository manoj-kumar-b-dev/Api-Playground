import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  authProvider?: "local" | "google";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minLength: [2, "Name must be at least 2 charcaters long"],
    maxLength: [50, "Name cannot exceed 50 charcters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId && this.authProvider !== "google";
    },
    minLength: [8, "Password must be at least 8 characters long"]
  },
  googleId: {
    type: String,
    default: undefined
  },
  avatar: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
},
  {
    timestamps: true
  });

const User = model<IUser>("User", userSchema)

export default User;