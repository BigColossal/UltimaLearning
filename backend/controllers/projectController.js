import {
  generateCodeReview,
  calculateProjectXp,
} from "../services/reviewService.js";
import ProjectReview from "../models/ProjectReview.js";
import LearningNode from "../models/LearningNode.js";
import { authMiddleware } from "../middleware/auth.js";

// Rate limiting helper
const reviewLimitMap = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (!reviewLimitMap.has(userId)) {
    reviewLimitMap.set(userId, { count: 0, resetTime: now + dayMs });
    return true;
  }

  const userLimit = reviewLimitMap.get(userId);
  if (now > userLimit.resetTime) {
    // Reset
    reviewLimitMap.set(userId, { count: 1, resetTime: now + dayMs });
    return true;
  }

  if (userLimit.count >= 10) {
    return false;
  }

  userLimit.count++;
  return true;
};

export const submitProject = async (req, res) => {
  try {
    const { nodeId, submissionType, content, metadata } = req.body;
    const { userId } = req;

    // Validate input
    if (!nodeId || !submissionType || !content) {
      return res.status(400).json({
        message: "nodeId, submissionType, and content are required",
      });
    }

    if (!["code", "editor", "github", "upload"].includes(submissionType)) {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        message: "You have reached the daily submission limit (10 per day)",
      });
    }

    // Verify node exists and belongs to user
    const node = await LearningNode.findOne({
      _id: nodeId,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Generate review
    const reviewResult = await generateCodeReview(
      nodeId,
      userId,
      content,
      node.reviewRubric,
      node.level,
    );

    // Calculate XP
    const xpEarned = calculateProjectXp(reviewResult.score, node.level);

    // Award XP to node
    node.addXp(xpEarned);
    await node.save();

    // Store review
    const review = await ProjectReview.create({
      userId,
      nodeId,
      submissionType,
      submissionContent: content,
      submissionMetadata: metadata || {},
      rubricUsed: node.reviewRubric,
      reviewResult,
      xpEarned,
      timestamp: new Date(),
    });

    res.status(201).json({
      ...reviewResult,
      xpEarned,
      reviewId: review._id,
      masteryAchieved: reviewResult.masteryAchieved,
    });
  } catch (error) {
    console.error("Error submitting project:", error);
    if (error.message.includes("API")) {
      return res
        .status(503)
        .json({ message: "AI service temporarily unavailable" });
    }
    res.status(500).json({ message: "Failed to review project" });
  }
};

export const getProjectReviews = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { userId } = req;

    // Verify node belongs to user
    const node = await LearningNode.findOne({
      _id: nodeId,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    const reviews = await ProjectReview.find({
      userId,
      nodeId,
    }).sort({ timestamp: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching project reviews:", error);
    res.status(500).json({ message: "Failed to fetch project reviews" });
  }
};

export const getProjectReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req;

    const review = await ProjectReview.findOne({
      _id: reviewId,
      userId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error fetching project review:", error);
    res.status(500).json({ message: "Failed to fetch project review" });
  }
};

export const getUserProjectHistory = async (req, res) => {
  try {
    const { userId } = req;
    const { limit = 20, skip = 0 } = req.query;

    const reviews = await ProjectReview.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ProjectReview.countDocuments({ userId });

    res.json({
      reviews,
      total,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching user project history:", error);
    res.status(500).json({ message: "Failed to fetch project history" });
  }
};

export const deleteProjectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req;

    const review = await ProjectReview.findOne({
      _id: reviewId,
      userId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await ProjectReview.findByIdAndDelete(reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting project review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
