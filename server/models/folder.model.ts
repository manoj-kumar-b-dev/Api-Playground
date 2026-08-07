import { Schema, model, Document, Types } from "mongoose";

export interface IFolder extends Document {
  collectionId: Types.ObjectId;
  parentFolderId?: Types.ObjectId | null;
  ownerId: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const folderSchema = new Schema<IFolder>(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },
    parentFolderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
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
      required: [true, "Folder name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Folder = model<IFolder>("Folder", folderSchema);
export default Folder;
