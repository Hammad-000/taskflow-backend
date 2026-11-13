
import type { Response } from "express";
import mongoose from "mongoose";

import Project from "../models/Project.js";
import Task from "../models/Task.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      recentProjects,
    ] = await Promise.all([
      Project.countDocuments({ owner: userId }),

      Task.countDocuments({ createdBy: userId }),

      Task.countDocuments({
        createdBy: userId,
        status: "done",
      }),

      Project.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name status createdAt"),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        totalTasks,
        teamMembers: 0,
        completedTasks,
      },
      recentProjects,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
