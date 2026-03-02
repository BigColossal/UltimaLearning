import Skill from "../models/Skill.js";
import Domain from "../models/Domain.js";
import Subskill from "../models/Subskill.js";

export const importCurriculum = async (curriculumJSON, userId) => {
  const { skill } = curriculumJSON;

  // Create skill
  const createdSkill = await Skill.create({
    name: skill.name,
    description: skill.description,
    userId: userId,
  });

  // Create domains and subskills
  for (const domain of skill.domains) {
    const createdDomain = await Domain.create({
      name: domain.name,
      description: domain.description,
      skillId: createdSkill._id,
    });

    for (const subskill of domain.subskills) {
      await Subskill.create({
        name: subskill.name,
        description: subskill.description,
        domainId: createdDomain._id,
      });
    }
  }

  return createdSkill;
};
