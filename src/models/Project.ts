
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
