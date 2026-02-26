import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nodeIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningNode",
    },
  ],
  questions: [
    {
      question: String,
      userAnswer: String,
      correctAnswer: String,
      score: Number, // 0-100, percentage
      explanation: String,
    },
  ],
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ["basic", "application", "integration", "mastery"],
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast lookups
testAttemptSchema.index({ userId: 1, timestamp: -1 });
testAttemptSchema.index({ nodeIds: 1 });

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;
