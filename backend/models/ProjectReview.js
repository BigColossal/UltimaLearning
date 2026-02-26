import mongoose from "mongoose";

const projectReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningNode",
    required: true,
  },
  submissionType: {
    type: String,
    enum: ["code", "editor", "github", "upload"],
    required: true,
  },
  submissionContent: {
    type: String,
  },
  submissionMetadata: {
    filename: String,
    language: String,
    github_url: String,
    file_size: Number,
  },
  rubricUsed: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  reviewResult: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    masteryAchieved: Boolean,
    rubricBreakdown: {
      correctness: Number,
      architecture: Number,
      readability: Number,
      edgeCases: Number,
      bestPractices: Number,
    },
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast lookups
projectReviewSchema.index({ userId: 1, timestamp: -1 });
projectReviewSchema.index({ nodeId: 1 });

const ProjectReview = mongoose.model("ProjectReview", projectReviewSchema);

export default ProjectReview;
