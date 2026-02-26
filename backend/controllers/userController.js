import User from "../models/User.js";
import LearningNode from "../models/LearningNode.js";
import ContainerNode from "../models/ContainerNode.js";

// Get or create user (for demo purposes, we'll use a default user)
export const getOrCreateUser = async (req, res) => {
  try {
    let user = await User.findOne({ username: "Jeremy" });

    if (!user) {
      user = await User.create({
        username: "Jeremy",
        email: "user@ultimalearning.com",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get all learning nodes for this user
    const learningNodes = await LearningNode.find({ createdByUser: userId });
    const containerNodes = await ContainerNode.find({ createdByUser: userId });

    // Calculate stats
    const totalXp = learningNodes.reduce(
      (sum, node) => sum + (node.totalXp || 0),
      0,
    );
    const maxLevel = Math.max(0, ...learningNodes.map((n) => n.level || 0));
    const nodeCount = learningNodes.length + containerNodes.length;
    const completedNodes = learningNodes.filter((n) => n.level === 100).length;

    res.json({
      totalXp,
      maxLevel,
      nodeCount,
      completedNodes,
      learningNodes: learningNodes.length,
      containerNodes: containerNodes.length,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Failed to get user stats" });
  }
};
