import express from "express";
import LearningNode from "../models/LearningNode.js";
import { authMiddleware } from "../middleware/auth.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Generate a new test
router.post(
  "/generate",
  rateLimiter({ keyPrefix: "tests", limit: 50 }),
  generateNewTest,
);

// Submit test answers
router.post("/submit", submitTest);

// Get test history for user
router.get("/history", getTestHistory);

// Get test history for a specific node
router.get("/history/:nodeId", getNodeTestHistory);

export default router;
