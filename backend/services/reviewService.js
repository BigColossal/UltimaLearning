import crypto from "crypto";
import Cache from "../models/Cache.js";
import ProjectReview from "../models/ProjectReview.js";
import LearningNode from "../models/LearningNode.js";

function makeHash(...parts) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function reviewProject({
  userId,
  nodeId,
  submissionType,
  submissionContent,
  submissionMetadata = {},
}) {
  const hash = makeHash(
    "review",
    nodeId.toString(),
    submissionContent || "",
    submissionType,
  );
  const cached = await Cache.findOne({ hash });
  if (cached && new Date(cached.expiresAt) > new Date()) {
    return { fromCache: true, result: cached.result };
  }

  const node = await LearningNode.findById(nodeId);
  const prompt = `You are an automated code reviewer. Respond with a JSON object: { score: number, strengths: [], weaknesses: [], suggestions: [], masteryAchieved: boolean, rubricBreakdown: {...} }\nNode: ${node?.title || "unknown"}\nLevel: ${node?.level || 1}\nSubmission:\n${submissionContent}`;

  const model = node && node.level >= 60 ? "gpt-4o" : "gpt-4o-mini";
  const resp = await openai.createCompletion({
    model,
    prompt,
    max_tokens: 1200,
  });
  let parsed = {};
  try {
    parsed = JSON.parse(resp.data.choices[0].text);
  } catch (e) {
    parsed = {
      score: 75,
      strengths: ["Auto-generated"],
      weaknesses: ["Parsing fallback"],
      suggestions: [],
      masteryAchieved: false,
      rubricBreakdown: { correctness: 75 },
    };
  }

  const xp = Math.round(parsed.score || 0);
  const review = new ProjectReview({
    userId,
    nodeId,
    submissionType,
    submissionContent,
    submissionMetadata,
    rubricUsed: node?.reviewRubric || {},
    reviewResult: parsed,
    xpEarned: xp,
  });
  await review.save();

  const cacheDoc = new Cache({
    cacheType: "review",
    hash,
    nodeId,
    level: node?.level,
    result: parsed,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await cacheDoc.save();

  if (node) {
    const newTotal = (node.level - 1) * 100 + (node.xp || 0) + xp;
    const levelDelta = Math.floor(newTotal / 100) - (node.level - 1);
    node.level = Math.min(100, node.level + levelDelta);
    node.xp = newTotal % 100;
    node.totalXp = (node.level - 1) * 100 + node.xp;
    await node.save();
  }

  return { fromCache: false, result: parsed, xp };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get difficulty and strictness settings based on node level
 */
const getReviewSettings = (level) => {
  if (level <= 20) {
    return {
      strictness: 1, // 1.0x
      model: "gpt-4o-mini",
      expectedScore: 60,
    };
  } else if (level <= 50) {
    return {
      strictness: 1.2, // Higher standards
      model: "gpt-4o-mini",
      expectedScore: 70,
    };
  } else if (level <= 80) {
    return {
      strictness: 1.4, // Even higher
      model: "gpt-4o",
      expectedScore: 80,
    };
  } else {
    return {
      strictness: 1.6, // Very strict
      model: "gpt-4o",
      expectedScore: 85,
    };
  }
};

/**
 * Generate AI code review using OpenAI
 */
export const generateCodeReview = async (
  nodeId,
  userId,
  submissionContent,
  rubric,
  level,
) => {
  try {
    const settings = getReviewSettings(level);

    // Create cache key
    const cacheKey = {
      content: submissionContent,
      nodeId,
      level,
    };

    // Check cache
    const cachedResult = await Cache.findOne({
      cacheType: "review",
      hash: Cache.createHash(cacheKey),
    });

    if (cachedResult) {
      console.log("Returning cached review");
      return cachedResult.result;
    }

    // Build prompt
    const rubricText = rubric
      ? `
Evaluation Rubric:
${JSON.stringify(rubric, null, 2)}
`
      : "";

    const prompt = `
You are an expert code reviewer evaluating code submission for a learning platform.

**Submission Level:** ${level} (out of 100)
**Strictness Factor:** ${settings.strictness}x

${rubricText}

**Code Submission:**
\`\`\`
${submissionContent}
\`\`\`

Please review this code thoroughly and provide:
1. Overall score (0-100) - Be strict: level ${level} should typically score around ${settings.expectedScore}
2. Key strengths (list 2-4 items)
3. Key weaknesses if any (list 2-4 items)
4. Specific suggestions for improvement
5. Whether mastery was achieved (true/false)
6. Rubric breakdown scores (0-10 for each dimension):
   - Correctness: Does it solve the problem correctly?
   - Architecture: Is the design clean and scalable?
   - Readability: Is the code easy to understand?
   - Edge Cases: Are edge cases handled?
   - Best Practices: Does it follow best practices?

Return your response as valid JSON in this exact format:
{
  "score": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "masteryAchieved": true,
  "rubricBreakdown": {
    "correctness": 9,
    "architecture": 8,
    "readability": 9,
    "edgeCases": 8,
    "bestPractices": 9
  }
}

Be critical and fair. Ensure the score reflects the level of work expected for level ${level}.
`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower temperature for consistency
      max_tokens: 1500,
    });

    let reviewData;
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      reviewData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error(
        "Failed to parse review response:",
        response.choices[0].message.content,
      );
      throw new Error("Failed to parse review from AI");
    }

    // Apply strictness modifier to score
    reviewData.score = Math.max(
      0,
      Math.min(100, Math.floor(reviewData.score / settings.strictness)),
    );

    // Cache the result
    await Cache.create({
      cacheType: "review",
      hash: Cache.createHash(cacheKey),
      nodeId,
      level,
      result: reviewData,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return reviewData;
  } catch (error) {
    console.error("Error generating code review:", error);
    throw error;
  }
};

/**
 * Calculate XP awarded based on review score
 */
export const calculateProjectXp = (score, level) => {
  // Base XP: 100 for projects, 200 for master projects
  let baseXp = 100;
  if (level >= 80) {
    baseXp = 200;
  } else if (level >= 60) {
    baseXp = 150;
  }

  // Score multiplier: 100% = 1.0x, 50% = 0.5x, 30% = 0.3x
  const scoreMultiplier = Math.max(0.3, score / 100);

  // Level bonus: higher levels earn more
  const levelBonus = 1 + (level / 100) * 0.5;

  return Math.floor(baseXp * scoreMultiplier * levelBonus);
};
