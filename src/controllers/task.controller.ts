
import type { Response } from "express";
import mongoose from "mongoose";

import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validations/task.validation.js";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    if (
      !req.userId ||
      !mongoose.isValidObjectId(req.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = validation.data;

  const project = await Project.findOne({
  _id: data.projectId,
  owner: req.userId,
});

if (!project) {
  return res.status(404).json({
    success: false,
    message: "Project not found or access denied",
  });
}

    if (data.assigneeId) {
      const assignee = await User.findById(data.assigneeId);

      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: "Assignee not found",
        });
      }
    }

    const task = await Task.create({
      title: data.title,
      projectId: new mongoose.Types.ObjectId(data.projectId),
      createdBy: new mongoose.Types.ObjectId(req.userId),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.assigneeId !== undefined && {
        assigneeId: new mongoose.Types.ObjectId(data.assigneeId),
      }),

      priority: data.priority,
      status: data.status,

      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate,
      }),
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

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (
      !req.userId ||
      !mongoose.isValidObjectId(req.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tasks = await Task.find({
      createdBy: new mongoose.Types.ObjectId(req.userId),
    })
      .populate("projectId", "name")
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    if (
      !req.userId ||
      !mongoose.isValidObjectId(req.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      typeof taskId !== "string" ||
      !mongoose.isValidObjectId(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      createdBy: new mongoose.Types.ObjectId(req.userId),
    })
      .populate("projectId", "name")
      .populate("assigneeId", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    if (
      !req.userId ||
      !mongoose.isValidObjectId(req.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      typeof taskId !== "string" ||
      !mongoose.isValidObjectId(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const validation = updateTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

   if (data.projectId) {
  const project = await Project.findOne({
    _id: data.projectId,
    owner: req.userId,
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found or access denied",
    });
  }
}

    if (data.assigneeId) {
      const assignee = await User.findById(data.assigneeId);

      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: "Assignee not found",
        });
      }
    }

    const cleanUpdateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      cleanUpdateData.title = data.title;
    }

    if (data.description !== undefined) {
      cleanUpdateData.description = data.description;
    }

    if (data.projectId !== undefined) {
      cleanUpdateData.projectId =
        new mongoose.Types.ObjectId(data.projectId);
    }

    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      cleanUpdateData.assigneeId =
        new mongoose.Types.ObjectId(data.assigneeId);
    }

    if (data.priority !== undefined) {
      cleanUpdateData.priority = data.priority;
    }

    if (data.status !== undefined) {
      cleanUpdateData.status = data.status;
    }

    if (data.dueDate !== undefined && data.dueDate !== null) {
      cleanUpdateData.dueDate = data.dueDate;
    }

    const unsetData: Record<string, number> = {};

    if (data.assigneeId === null) {
      unsetData.assigneeId = 1;
    }

    if (data.dueDate === null) {
      unsetData.dueDate = 1;
    }

    const updateQuery: Record<string, unknown> = {};

    if (Object.keys(cleanUpdateData).length > 0) {
      updateQuery.$set = cleanUpdateData;
    }

    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.userId),
      },
      updateQuery,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("projectId", "name")
      .populate("assigneeId", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    if (
      !req.userId ||
      !mongoose.isValidObjectId(req.userId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      typeof taskId !== "string" ||
      !mongoose.isValidObjectId(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(taskId),
      createdBy: new mongoose.Types.ObjectId(req.userId),
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
