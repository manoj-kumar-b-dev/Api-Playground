import { Schema, model, Document, Types } from "mongoose";

export interface ICollection extends Document {
  projectId: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const collectionSchema = new Schema<ICollection>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
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

const Collection = model<ICollection>("Collection", collectionSchema);
export default Collection;