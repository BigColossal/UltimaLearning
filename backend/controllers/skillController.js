import Skill from "../models/Skill.js";
import Domain from "../models/Domain.js";
import Subskill from "../models/Subskill.js";

// Get all skills for the currently authenticated user
export const getSkills = async (req, res) => {
  try {
    const userId = req.user._id; // <- assumes req.user is set by auth middleware
    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single skill by ID, including domains and subskills
export const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    const domains = await Domain.find({ skillId: skill._id }).sort({
      createdAt: 1,
    });

    const domainsWithSubskills = await Promise.all(
      domains.map(async (domain) => {
        const subskills = await Subskill.find({ domainId: domain._id }).sort({
          createdAt: 1,
        });
        return { ...domain.toObject(), subskills };
      }),
    );

    res.json({ ...skill.toObject(), domains: domainsWithSubskills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new skill for the authenticated user
export const createSkill = async (req, res) => {
  try {
    const userId = req.user._id; // <- real logged-in user
    const skill = await Skill.create({
      name: req.body.name,
      description: req.body.description || "",
      userId,
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing skill
export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
      },
      { new: true, runValidators: true },
    );

    if (!skill) return res.status(404).json({ error: "Skill not found" });

    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a skill, its domains, and subskills
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    // Delete all domains and subskills
    const domains = await Domain.find({ skillId: skill._id });
    for (const domain of domains) {
      await Subskill.deleteMany({ domainId: domain._id });
    }
    await Domain.deleteMany({ skillId: skill._id });
    await Skill.findByIdAndDelete(req.params.id);

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
