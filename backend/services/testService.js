import crypto from "crypto";
import Cache from "../models/Cache.js";
import TestAttempt from "../models/TestAttempt.js";
import LearningNode from "../models/LearningNode.js";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
function makeHash(...parts) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function generateTestForNode(node) {
  const level = node.level || 1;
  const hash = makeHash("test", node._id.toString(), String(level));
  const cached = await Cache.findOne({ hash });
  if (cached && new Date(cached.expiresAt) > new Date()) return cached.result;

  const difficultyStage =
    level <= 10
      ? "basic"
      : level <= 40
        ? "application"
        : level <= 70
          ? "integration"
          : "mastery";
  const prompt = `Create 5 multiple-choice questions (JSON) for a ${difficultyStage} topic.\nTitle: ${node.title}\nDescription: ${node.description}\nReturn strictly a JSON object like: { "questions": [ { "question": "", "options": ["",...], "correctIndex": 0, "explanation": "" } ] }`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  });
  const text = resp.choices?.[0]?.message?.content || "{}";
  let parsed = { questions: [] };
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = {
      questions: [
        {
          question: `${node.title} (auto)`,
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
          explanation: "",
        },
      ],
    };
  }

  const cacheDoc = new Cache({
    cacheType: "test",
    hash,
    nodeId: node._id,
    level,
    result: parsed,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await cacheDoc.save();
  return parsed;
}

export async function gradeAndRecord(userId, nodeIds, answers) {
  // answers expected: { questions: [{ correctIndex, userIndex, score }] }
  const questions = answers.questions || [];
  let totalScore = 0;
  questions.forEach((q) => {
    totalScore += q.score || 0;
  });
  const avgScore = questions.length
    ? Math.round(totalScore / questions.length)
    : 0;

  const nodes = await LearningNode.find({ _id: { $in: nodeIds } });
  let xpEarned = 0;
  for (const n of nodes) {
    const base = 20;
    const modifier = 1 + (n.level || 1) / 100;
    const nodeXp = Math.round(base * (avgScore / 100) * modifier);
    const newTotal = (n.level - 1) * 100 + (n.xp || 0) + nodeXp;
    const levelDelta = Math.floor(newTotal / 100) - (n.level - 1);
    n.level = Math.min(100, n.level + levelDelta);
    n.xp = newTotal % 100;
    n.totalXp = (n.level - 1) * 100 + n.xp;
    xpEarned += nodeXp;
    await n.save();
  }

  const attempt = new TestAttempt({
    userId,
    nodeIds,
    questions,
    totalScore: avgScore,
    xpEarned,
  });
  await attempt.save();
  return { totalScore: avgScore, xpEarned, attemptId: attempt._id };
}

/**
 * Map skill level to difficulty and test parameters
 */
const getDifficultyFromLevel = (level) => {
  if (level <= 10) {
    return {
      difficulty: "basic",
      description: "Basic recall and fundamental concepts",
      questionCount: 5,
    };
  } else if (level <= 40) {
    return {
      difficulty: "application",
      description: "Application of concepts to scenarios",
      questionCount: 7,
    };
  } else if (level <= 70) {
    return {
      difficulty: "integration",
      description: "Integration of multiple concepts",
      questionCount: 8,
    };
  } else {
    return {
      difficulty: "mastery",
      description: "Mastery level with edge cases and complex problems",
      questionCount: 10,
    };
  }
};

/**
 * Generate a test using OpenAI API with caching
 */
export const generateTest = async (nodeIds, difficulty) => {
  try {
    // Fetch node details
    const nodes = await LearningNode.find({ _id: { $in: nodeIds } });

    if (nodes.length === 0) {
      throw new Error("No learning nodes found");
    }

    // Build prompt content
    const nodeDescriptions = nodes
      .map(
        (node) =>
          `- **${node.title}** (Level ${node.level}): ${node.description}`,
      )
      .join("\n");

    const difficultyInfo = getDifficultyFromLevel(nodes[0].level);

    // Create cache key from nodes and difficulty
    const cacheKey = {
      nodeIds: nodeIds.sort().join(","),
      difficulty: difficulty || difficultyInfo.difficulty,
    };

    // Check cache first
    const cachedResult = await Cache.findOne({
      cacheType: "test",
      hash: Cache.createHash(cacheKey),
    });

    if (cachedResult) {
      console.log("Returning cached test");
      return cachedResult.result;
    }

    // Generate new test
    const prompt = `
You are an expert educator creating an adaptive test for mastering technical skills.

**Learning Nodes:**
${nodeDescriptions}

**Difficulty Level:** ${difficultyInfo.difficulty}
**Description:** ${difficultyInfo.description}
**Question Count:** ${difficultyInfo.questionCount}

Generate exactly ${difficultyInfo.questionCount} multiple-choice questions that test the above concepts at the ${difficultyInfo.difficulty} level.

For each question, include:
- A clear, focused question
- 4 multiple-choice options
- The index of the correct answer (0-3)
- A brief explanation of why the correct answer is right

Return your response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0,
      "explanation": "Why option 0 is correct..."
    }
  ]
}

Ensure the JSON is valid and properly formatted.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cheaper model for test generation
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let testData;
    try {
      // Extract JSON from response
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      testData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error(
        "Failed to parse OpenAI response:",
        response.choices[0].message.content,
      );
      throw new Error("Failed to parse test from AI response");
    }

    // Cache the result
    await Cache.create({
      cacheType: "test",
      hash: Cache.createHash(cacheKey),
      nodeIds,
      level: nodes[0].level,
      result: testData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return testData;
  } catch (error) {
    console.error("Error generating test:", error);
    throw error;
  }
};

/**
 * Calculate XP earned from test score
 */
export const calculateTestXp = (score, baseXp = 20, levelBonus = 1) => {
  // Score-based multiplier: 100% = 1.0x, 50% = 0.25x
  const scoreMultiplier = Math.max(0.25, score / 100);

  // Level bonus: higher levels earn more XP (scales up to 1.5x at level 100)
  const bonusMultiplier = 1 + (levelBonus - 1) * 0.005;

  return Math.floor(baseXp * scoreMultiplier * bonusMultiplier);
};

/**
 * Process test submission: validate answers and award XP
 */
export const processTestSubmission = async (
  userId,
  nodeIds,
  answers,
  difficulty,
) => {
  try {
    const nodes = await LearningNode.find({
      _id: { $in: nodeIds },
      createdByUser: userId,
    });

    if (nodes.length === 0) {
      throw new Error("Nodes not found or unauthorized");
    }

    // Generate the test to get correct answers
    const test = await generateTest(nodeIds, difficulty);

    // Score the submission
    let correctCount = 0;
    const scoredQuestions = test.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        score: isCorrect ? 100 : 0,
        explanation: question.explanation,
      };
    });

    const totalScore = Math.round((correctCount / test.questions.length) * 100);

    // Calculate XP for each node
    const xpPerNode = calculateTestXp(totalScore, 20, nodes[0].level);

    // Award XP to each node
    for (const node of nodes) {
      node.addXp(xpPerNode);
      await node.save();
    }

    return {
      score: totalScore,
      correctCount,
      totalQuestions: test.questions.length,
      questions: scoredQuestions,
      xpEarned: xpPerNode,
      breakdown: {
        correct: correctCount,
        incorrect: test.questions.length - correctCount,
        percentage: totalScore,
      },
    };
  } catch (error) {
    console.error("Error processing test submission:", error);
    throw error;
  }
};
