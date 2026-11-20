
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "../controllers/project.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/members", addProjectMember);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.delete("/:id/members/:memberId", removeProjectMember);

export default router;
