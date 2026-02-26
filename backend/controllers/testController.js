import {
  generateTest,
  processTestSubmission,
} from "../services/testService.js";
import TestAttempt from "../models/TestAttempt.js";
import LearningNode from "../models/LearningNode.js";

export const generateNewTest = async (req, res) => {
  try {
    const { nodeIds, difficulty } = req.body;
    const { userId } = req;

    if (!nodeIds || nodeIds.length === 0) {
      return res.status(400).json({ message: "nodeIds are required" });
    }

    // Verify all nodes belong to user
    const nodes = await LearningNode.find({
      _id: { $in: nodeIds },
      createdByUser: userId,
    });

    if (nodes.length !== nodeIds.length) {
      return res.status(400).json({ message: "One or more nodes not found" });
    }

    const test = await generateTest(nodeIds, difficulty);

    // Store test metadata (not the full test yet - that's done after submission)
    const testMetadata = {
      userId,
      nodeIds,
      difficulty,
      createdAt: new Date(),
    };

    res.json({
      test,
      metadata: testMetadata,
    });
  } catch (error) {
    console.error("Error generating test:", error);
    if (error.message.includes("API")) {
      return res
        .status(503)
        .json({ message: "AI service temporarily unavailable" });
    }
    res.status(500).json({ message: "Failed to generate test" });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { nodeIds, answers, difficulty, timeSpent } = req.body;
    const { userId } = req;

    if (!nodeIds || nodeIds.length === 0 || !answers) {
      return res
        .status(400)
        .json({ message: "nodeIds and answers are required" });
    }

    // Process submission
    const result = await processTestSubmission(
      userId,
      nodeIds,
      answers,
      difficulty,
    );

    // Store test attempt
    const testAttempt = await TestAttempt.create({
      userId,
      nodeIds,
      questions: result.questions,
      totalScore: result.score,
      xpEarned: result.xpEarned,
      difficulty,
      timeSpent: timeSpent || 0,
      timestamp: new Date(),
    });

    res.json({
      ...result,
      attemptId: testAttempt._id,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Failed to submit test" });
  }
};

export const getTestHistory = async (req, res) => {
  try {
    const { userId } = req;
    const { nodeId, limit = 20, skip = 0 } = req.query;

    const query = { userId };
    if (nodeId) {
      query.nodeIds = nodeId;
    }

    const attempts = await TestAttempt.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await TestAttempt.countDocuments(query);

    res.json({
      attempts,
      total,
      count: attempts.length,
    });
  } catch (error) {
    console.error("Error fetching test history:", error);
    res.status(500).json({ message: "Failed to fetch test history" });
  }
};

export const getNodeTestHistory = async (req, res) => {
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

    const attempts = await TestAttempt.find({
      userId,
      nodeIds: nodeId,
    }).sort({ timestamp: -1 });

    res.json(attempts);
  } catch (error) {
    console.error("Error fetching node test history:", error);
    res.status(500).json({ message: "Failed to fetch node test history" });
  }
};
