import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
} from "../controllers/project.controller.js";

const router = Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/members", addProjectMember);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
export default router;