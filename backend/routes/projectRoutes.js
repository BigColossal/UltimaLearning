import express from "express";
import {
  submitProject,
  getProjectReviews,
  getProjectReviewById,
  getUserProjectHistory,
  deleteProjectReview,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Submit a project for review
router.post("/submit", submitProject);

// Get all reviews for a specific node
router.get("/reviews/:nodeId", getProjectReviews);

// Get a specific review
router.get("/:reviewId", getProjectReviewById);

// Get user's project submission history
router.get("/history", getUserProjectHistory);

// Delete a review
router.delete("/:reviewId", deleteProjectReview);

export default router;
