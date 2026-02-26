import express from "express";
import {
  createContainerNode,
  getContainerNodes,
  getContainerNodeById,
  updateContainerNode,
  deleteContainerNode,
  reorderContainerNode,
  createLearningNode,
  getLearningNodes,
  getLearningNodeById,
  updateLearningNode,
  deleteLearningNode,
  addXpToLearningNode,
  getAllNodes,
  deleteNode,
} from "../controllers/nodeController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ==================== CONTAINER NODES ====================

// Create a container node
router.post("/containers", createContainerNode);

// Get container nodes (with optional parentId filter)
router.get("/containers", getContainerNodes);

// Get a specific container node with aggregated progress
router.get("/containers/:id", getContainerNodeById);

// Update a container node
router.patch("/containers/:id", updateContainerNode);

// Delete a container node (cascade deletes children)
router.delete("/containers/:id", deleteContainerNode);

// Reorder/reparent a container node
router.patch("/containers/:id/reorder", reorderContainerNode);

// ==================== LEARNING NODES ====================

// Create a learning node
router.post("/learning", createLearningNode);

// Get learning nodes (with optional parentContainerId filter)
router.get("/learning", getLearningNodes);

// Get a specific learning node
router.get("/learning/:id", getLearningNodeById);

// Update a learning node
router.patch("/learning/:id", updateLearningNode);

// Delete a learning node
router.delete("/learning/:id", deleteLearningNode);

// Add XP to a learning node
router.patch("/learning/:id/xp", addXpToLearningNode);

// ==================== GENERIC NODE OPERATIONS ====================

// Get all nodes (both container and learning)
router.get("/", getAllNodes);

// Delete any node (container or learning)
router.delete("/:id", deleteNode);

export default router;
