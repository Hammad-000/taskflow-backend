
import type { Response } from "express";
import mongoose from "mongoose";

import Project from "../models/Project.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";

export const createProject = async (
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

    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: validation.error.flatten(),
      });
    }

const project = await new Project({
  ...validation.data,
  owner: new mongoose.Types.ObjectId(req.userId),
}).save();;
await project.save();
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

export const getProjects = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("Logged-in User ID:", req.userId);

    const allProjects = await Project.find({});

    console.log("Total Projects:", allProjects.length);
    console.log("First Project:", allProjects[0]);

    const projects = await Project.find({
      owner: new mongoose.Types.ObjectId(req.userId),
    }).sort({ createdAt: -1 });

    console.log("Matched Projects:", projects.length);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

  const project = await Project.findOne({
  _id: id,
  owner: req.userId,
});

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: validation.error.flatten(),
      });
    }

    if (Object.keys(validation.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

 const project = await Project.findOneAndUpdate(
  {
    _id: id,
    owner: req.userId,
  },
  { $set: validation.data },
  {
    new: true,
    runValidators: true,
  }
);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

 const project = await Project.findOneAndDelete({
  _id: id,
  owner: req.userId,
});

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

const projects = await Project.find({});

console.log("Projects found:", projects.length);
console.log("Projects data:", projects);