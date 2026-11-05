import { Router } from "express";

import {
  signup,
  login,
  logout,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated!",
    userId: req.userId,
  });
});

export default router;