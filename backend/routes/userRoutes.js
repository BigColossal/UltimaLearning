import express from "express";
import {
  getOrCreateUser,
  getUserById,
  getUserStats,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getOrCreateUser);

// Get user stats (requires authentication) - must come before /:id route
router.get("/stats", authMiddleware, getUserStats);

// Get specific user by ID
router.get("/:id", getUserById);

export default router;
