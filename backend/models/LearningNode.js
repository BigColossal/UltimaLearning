import mongoose from "mongoose";

const learningNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  parentContainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ContainerNode",
    required: true,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
    max: 99,
  },
  totalXp: {
    type: Number,
    default: 0,
  },
  milestoneTier: {
    type: String,
    enum: [
      "Novice",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Master",
    ],
    default: "Novice",
  },
  reviewRubric: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate level and milestone tier from totalXp
learningNodeSchema.methods.calculateLevelAndTier = function () {
  // 100 XP per level, max level 100
  const calculatedLevel = Math.min(Math.floor(this.totalXp / 100) + 1, 100);
  this.level = calculatedLevel;
  this.xp = this.totalXp % 100;

  // Calculate milestone tier
  const tiers = [
    { threshold: 0, name: "Novice" },
    { threshold: 1000, name: "Bronze" },
    { threshold: 2000, name: "Silver" },
    { threshold: 3000, name: "Gold" },
    { threshold: 4000, name: "Platinum" },
    { threshold: 5000, name: "Diamond" },
    { threshold: 10000, name: "Master" },
  ];

  let tier = "Novice";
  for (const t of tiers) {
    if (this.totalXp >= t.threshold) {
      tier = t.name;
    }
  }
  this.milestoneTier = tier;
};

// Add XP and update level/tier
learningNodeSchema.methods.addXp = function (amount) {
  this.totalXp += amount;
  this.calculateLevelAndTier();
};

// Pre-save hook to ensure level and tier are always in sync
learningNodeSchema.pre("save", function (next) {
  this.calculateLevelAndTier();
  this.updatedAt = Date.now();
  next();
});

const LearningNode = mongoose.model("LearningNode", learningNodeSchema);

export default LearningNode;
