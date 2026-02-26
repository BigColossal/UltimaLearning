import mongoose from "mongoose";
import crypto from "crypto";

const cacheSchema = new mongoose.Schema({
  cacheType: {
    type: String,
    enum: ["test", "review"],
    required: true,
  },
  hash: {
    type: String,
    required: true,
    index: true,
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningNode",
  },
  level: {
    type: Number,
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index - automatically delete documents 7 days after creation (604800 seconds)
cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create a hash from input
cacheSchema.statics.createHash = function (input) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
};

// Static method to get or create cache
cacheSchema.statics.getOrCreate = async function (
  cacheType,
  hashInput,
  nodeId,
  level,
  resultFn,
  ttlDays = 7,
) {
  const hash = this.createHash(hashInput);
  const existing = await this.findOne({ hash, cacheType });

  if (existing) {
    return existing.result;
  }

  // Generate new result
  const result = await resultFn();

  // Store in cache
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await this.create({
    cacheType,
    hash,
    nodeId,
    level,
    result,
    expiresAt,
  });

  return result;
};

const Cache = mongoose.model("Cache", cacheSchema);

export default Cache;
