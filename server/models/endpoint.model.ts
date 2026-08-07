import { Schema, model, Document, Types } from "mongoose";

export interface IKeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface IEndpointRequest {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  url: string;
  headers: IKeyValuePair[];
  queryParams: IKeyValuePair[];
  pathParams: IKeyValuePair[];
  body: {
    mode: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw";
    raw: string;
  };
  authorization: {
    type: "none" | "bearer" | "basic" | "apiKey";
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    addTo?: "header" | "query";
  };
}

export interface IEndpoint extends Document {
  name: string;
  projectId: Types.ObjectId;
  collectionId: Types.ObjectId;
  folderId?: Types.ObjectId | null;
  ownerId: Types.ObjectId;
  request: IEndpointRequest;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const keyValuePairSchema = new Schema<IKeyValuePair>(
  {
    key: { type: String, default: "" },
    value: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const endpointRequestSchema = new Schema<IEndpointRequest>(
  {
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      default: "GET",
    },
    url: { type: String, default: "" },
    headers: { type: [keyValuePairSchema], default: [] },
    queryParams: { type: [keyValuePairSchema], default: [] },
    pathParams: { type: [keyValuePairSchema], default: [] },
    body: {
      mode: {
        type: String,
        enum: ["none", "json", "form-data", "x-www-form-urlencoded", "raw"],
        default: "none",
      },
      raw: { type: String, default: "" },
    },
    authorization: {
      type: {
        type: String,
        enum: ["none", "bearer", "basic", "apiKey"],
        default: "none",
      },
      token: { type: String, default: "" },
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      key: { type: String, default: "" },
      value: { type: String, default: "" },
      addTo: { type: String, enum: ["header", "query"], default: "header" },
    },
  },
  { _id: false }
);

export const endpointSchema = new Schema<IEndpoint>(
  {
    name: {
      type: String,
      required: [true, "Endpoint name is required"],
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },
    folderId: {
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
    request: {
      type: endpointRequestSchema,
      required: true,
      default: () => ({
        method: "GET",
        url: "",
        headers: [],
        queryParams: [],
        pathParams: [],
        body: { mode: "none", raw: "" },
        authorization: { type: "none" },
      }),
    },
    tags: {
      type: [String],
      default: [],
      index: true,
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

const Endpoint = model<IEndpoint>("Endpoint", endpointSchema);
export default Endpoint;
