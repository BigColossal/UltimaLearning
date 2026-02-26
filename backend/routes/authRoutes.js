import express from "express";
import {
  signup,
  login,
  googleAuth,
  refresh,
  logout,
  getMe,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);

// Protected routes
router.get("/me", authMiddleware, getMe);
router.post("/refresh", authMiddleware, refresh);

export default router;
