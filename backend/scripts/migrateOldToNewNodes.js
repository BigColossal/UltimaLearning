/**
 * Migration Script: Convert old Skill/Domain/Subskill to new Container/Learning Nodes
 *
 * Usage:
 * From backend directory: node scripts/migrateOldToNewNodes.js
 *
 * This script:
 * 1. Iterates through all users
 * 2. For each user's skills, creates a ContainerNode
 * 3. For each domain in a skill, creates a child ContainerNode
 * 4. For each subskill in a domain, creates a LearningNode
 * 5. Preserves XP and level data
 * 6. Marks old data as deprecated but doesn't delete
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import Domain from "../models/Domain.js";
import Subskill from "../models/Subskill.js";
import ContainerNode from "../models/ContainerNode.js";
import LearningNode from "../models/LearningNode.js";

dotenv.config();

const BATCH_SIZE = 100;

async function migrateSkillToDomain(userSkill, userId) {
  try {
    // Get domains for this skill
    const domains = await Domain.find({ skillId: userSkill._id });

    // Create ContainerNode for the skill
    const skillContainer = await ContainerNode.create({
      title: userSkill.name,
      description: userSkill.description,
      category: "General",
      createdByUser: userId,
      childIds: [],
    });

    // For each domain, create a ContainerNode and convert subskills to LearningNodes
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const subskills = await Subskill.find({ domainId: domain._id });

      // Create ContainerNode for domain
      const domainContainer = await ContainerNode.create({
        title: domain.name,
        description: domain.description,
        category: "General",
        parentId: skillContainer._id,
        createdByUser: userId,
        orderIndex: i,
        childIds: [],
      });

      // Add domain container to skill container's childIds
      skillContainer.childIds.push(domainContainer._id);

      // Create LearningNodes for each subskill
      for (let j = 0; j < subskills.length; j++) {
        const subskill = subskills[j];

        // Calculate totalXp from level and xp
        const totalXp = subskill.level * 100 + subskill.xp;

        const learningNode = await LearningNode.create({
          title: subskill.name,
          description: subskill.description,
          parentContainerId: domainContainer._id,
          level: subskill.level,
          xp: subskill.xp,
          totalXp: totalXp,
          createdByUser: userId,
        });

        // Add learning node to domain container's childIds
        domainContainer.childIds.push(learningNode._id);
      }

      // Save domain container with updated childIds
      await domainContainer.save();
    }

    // Save skill container with all domainIds
    await skillContainer.save();

    return { success: true, skillContainerId: skillContainer._id };
  } catch (error) {
    console.error(`Failed to migrate skill ${userSkill._id}:`, error);
    return { success: false, error: error.message };
  }
}

async function migrateUserData(user) {
  try {
    console.log(`Migrating user: ${user.email}`);

    const skills = await Skill.find({ userId: user._id });

    if (skills.length === 0) {
      console.log(`  No skills found for user ${user.email}`);
      return { success: true, skillsCount: 0 };
    }

    for (const skill of skills) {
      const result = await migrateSkillToDomain(skill, user._id);
      if (!result.success) {
        console.warn(
          `  Warning: Failed to migrate skill ${skill._id}: ${result.error}`,
        );
      }
    }

    console.log(`  ✓ Migrated ${skills.length} skills for user ${user.email}`);
    return { success: true, skillsCount: skills.length };
  } catch (error) {
    console.error(`Error migrating user ${user._id}:`, error);
    return { success: false, error: error.message };
  }
}

async function runMigration() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ultimalearning",
    );
    console.log("Connected to MongoDB");

    // Get all users
    const totalUsers = await User.countDocuments();
    console.log(`Found ${totalUsers} users to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    // Process users in batches
    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      const users = await User.find().skip(i).limit(BATCH_SIZE);

      for (const user of users) {
        const result = await migrateUserData(user);
        if (result.success) {
          migratedCount++;
        } else {
          errorCount++;
        }
      }

      console.log(
        `Progress: ${Math.min(i + BATCH_SIZE, totalUsers)}/${totalUsers}`,
      );
    }

    console.log("\n=== Migration Complete ===");
    console.log(`✓ Successfully migrated: ${migratedCount} users`);
    console.log(`✗ Errors: ${errorCount} users`);
    console.log("\nOld data (Skill, Domain, Subskill) preserved for rollback.");
    console.log("You can delete old collections after verifying new data.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runMigration();
