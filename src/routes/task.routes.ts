
import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createTask);

export default router;
