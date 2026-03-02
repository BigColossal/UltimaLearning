import { useState, useEffect } from "react";
import { useParams, useNavigate, Router } from "react-router-dom";
import {
  getSkillById,
  updateSkill,
  deleteSkill,
  createDomain,
} from "../api/api";
import DomainAccordion from "../components/DomainAccordion";
import ConfirmModal from "../components/confirmModal";
import EditSkillCard from "../components/EditSkillCard";
import CreateDomainCard from "../components/CreateDomainCard";
import "../styles/SkillPage.css";

const SkillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [domainFormData, setDomainFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadSkill();
  }, [id]);

  const loadSkill = async () => {
    try {
      setLoading(true);
      const response = await getSkillById(id);
      setSkill(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || "",
      });
    } catch (error) {
      console.error("Error loading skill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await updateSkill(id, formData);
      setSkill(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating skill:", error);
      alert("Failed to update skill. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSkill(deleteTarget);

      setDeleteTarget(null);

      // Redirect back to hub after deletion
      navigate("/hub");
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const handleCreateDomain = async (data) => {
    try {
      await createDomain(id, data);
      setShowDomainForm(false);
      await loadSkill();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Loading skill...</div>;
  }

  if (!skill) {
    return <div className="error">Skill not found</div>;
  }

  return (
    <div
      className={`skill-page ${editing || showDomainForm ? "modal-open-bg" : ""}`}
    >
      <div className="volcanic-particles" />
      <div className={`skill-page-content ${editing ? "modal-open" : ""}`}>
        <div className="skill-page-header">
          <div className="back-button-wrapper">
            <button className="btn btn-danger" onClick={() => navigate("/hub")}>
              Back to Hub
            </button>
          </div>
          <div>
            <h1>{skill.name}</h1>
            <p className="skill-description">
              {skill.description || "No description"}
            </p>
          </div>

          <div className="skill-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setDeleteTarget(id)}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="domains-section">
          <div className="domains-header">
            <h2>Domains ({skill.domains?.length || 0})</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowDomainForm(true)}
            >
              Add Domain
            </button>
          </div>

          {skill.domains && skill.domains.length > 0 ? (
            <div className="domains-list">
              {skill.domains.map((domain) => (
                <DomainAccordion
                  key={domain._id}
                  domain={domain}
                  subskills={domain.subskills || []}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No domains yet. Create your first domain to get started!</p>
            </div>
          )}
        </div>
      </div>{" "}
      <CreateDomainCard
        isOpen={showDomainForm}
        onCreate={handleCreateDomain}
        onCancel={() => setShowDomainForm(false)}
      />
      <EditSkillCard
        isOpen={editing}
        formData={formData}
        setFormData={setFormData}
        onSave={handleUpdateSkill}
        onCancel={() => setEditing(false)}
      />
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

export default SkillPage;
