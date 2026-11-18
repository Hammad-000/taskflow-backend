
import type { Response } from "express";
import mongoose from "mongoose";

import Project from "../models/Project.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import User from "../models/User.js";

import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
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
  members: [],
}).save();
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
    if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId },
      ],
    }).sort({ createdAt: -1 });

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


export const addProjectMember = async (
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

    const validation = addProjectMemberSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        errors: validation.error.flatten(),
      });
    }

    const project = await Project.findOne({
      _id: id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you are not the owner",
      });
    }

    const user = await User.findOne({
      email: validation.data.email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    if (user._id.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You are already the project owner",
      });
    }

    const alreadyMember = project.members.some(
      (member) => member.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    console.error("Add project member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add project member",
    });
  }
};

const projects = await Project.find({});

