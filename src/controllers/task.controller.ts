
import type { Response } from "express";
import mongoose from "mongoose";

import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createTaskSchema } from "../validations/task.validation.js";

export const createTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      status,
      dueDate,
    } = validation.data;

    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (assigneeId) {
      const assignee = await User.findById(assigneeId);

      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: "Assignee not found",
        });
      }
    }

    const task = await Task.create({
      title,
      projectId,
      createdBy: new mongoose.Types.ObjectId(req.userId),

      ...(description !== undefined && { description }),
      ...(assigneeId !== undefined && {
        assigneeId: new mongoose.Types.ObjectId(assigneeId),
      }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate }),
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
