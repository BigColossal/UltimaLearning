import mongoose from "mongoose";

const containerNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: ["Computer Science", "Math", "General"],
    default: "General",
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ContainerNode",
    default: null,
  },
  childIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContainerNode",
    },
  ],
  orderIndex: {
    type: Number,
    default: 0,
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

// Update the updatedAt timestamp before saving
containerNodeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get aggregated progress from all child learning nodes
containerNodeSchema.methods.getAggregatedProgress = async function () {
  const LearningNode = mongoose.model("LearningNode");
  const learningNodes = await LearningNode.find({
    parentContainerId: this._id,
  });

  if (learningNodes.length === 0) {
    return { totalXp: 0, averageLevel: 0, nodeCount: 0 };
  }

  const totalXp = learningNodes.reduce((sum, node) => sum + node.totalXp, 0);
  const averageLevel =
    learningNodes.reduce((sum, node) => sum + node.level, 0) /
    learningNodes.length;

  return {
    totalXp,
    averageLevel: Math.round(averageLevel),
    nodeCount: learningNodes.length,
  };
};

const ContainerNode = mongoose.model("ContainerNode", containerNodeSchema);

export default ContainerNode;
