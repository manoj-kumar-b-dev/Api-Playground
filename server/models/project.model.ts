import { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  color: string;
  icon: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const projectSchema = new Schema<IProject>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    icon: {
      type: String,
      default: "FolderKanban",
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
projectSchema.index({ ownerId: 1, favorite: 1 });
projectSchema.index({ ownerId: 1, name: 1 });
projectSchema.index({ ownerId: 1, updatedAt: -1 });

const Project = model<IProject>("Project", projectSchema);
export default Project;