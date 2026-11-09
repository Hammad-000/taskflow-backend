import { Router } from "express";

import {signup,login,logout,
} from "../controllers/auth.controller.js";
import { getMe } from "../controllers/auth.controller.js";


import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);
export default router;