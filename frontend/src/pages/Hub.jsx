import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { getSkills, createSkill, deleteSkill, getSkillById } from "../api/api";
import ConfirmModal from "../components/confirmModal";
import SkillCard from "../components/SkillCard";
import "../styles/Hub.css";

const Hub = () => {
  const { refreshSkills } = useUser();
  const [skillsWithDomains, setSkillsWithDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);

      await refreshSkills();
      const updatedSkills = await getSkills("Jeremy");

      const skillsData = await Promise.all(
        updatedSkills.data.map(async (skill) => {
          try {
            const skillData = await getSkillById(skill._id);
            return skillData.data;
          } catch (error) {
            console.error(`Error loading skill ${skill._id}:`, error);
            return { ...skill, domains: [] };
          }
        }),
      );

      setSkillsWithDomains(skillsData);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();

    try {
      await createSkill({
        name: formData.name,
        description: formData.description,
        userId: "Jeremy",
      });

      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      await loadSkills();
    } catch (error) {
      console.error("Error creating skill:", error);
      alert("Failed to create skill. Please try again.");
    }
  };

  const handleDeleteSkill = (skillId) => {
    setDeleteTarget(skillId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSkill(deleteTarget);
      await loadSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="hub">
      <div className="hub-header">
        <h1>Learning Hub</h1>
        <p className="hub-subtitle">Manage your learning skills and roadmaps</p>

        <button
          className="btn btn-primary create-confirmation-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "+ Create New Skill"}
        </button>
      </div>
      {showCreateForm && (
        <div className="create-skill-form card">
          <h2>Create New Skill</h2>

          <form onSubmit={handleCreateSkill}>
            <div className="form-group">
              <label className="form-label">Skill Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Web Development"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this skill encompasses..."
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Skill
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <div className="loading">Loading skills...</div>
      ) : skillsWithDomains.length > 0 ? (
        <div className="skills-grid">
          {skillsWithDomains.map((skill, index) => (
            <div
              key={skill._id}
              className="skill-card-wrapper"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <SkillCard skill={skill} domains={skill.domains || []} />

              <div className="skill-card-actions-hub">
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteSkill(skill._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No skills yet</h2>
          <p>Create your first skill to get started!</p>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Skill?"
        message="This will permanently delete this skill, including all domains and subskills. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Hub;
