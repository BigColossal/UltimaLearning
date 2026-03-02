import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSubskillById,
  updateSubskill,
  deleteSubskill,
  addXP,
} from "../api/api";
import LevelProgressBar from "../components/LevelProgressBar";
import ProjectXPForm from "../components/ProjectXPForm";
import { getTier, getTierClass } from "../utils/levelUtils";
import "../styles/SubskillPage.css";

const SubskillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subskill, setSubskill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadSubskill();
  }, [id]);

  const loadSubskill = async () => {
    try {
      setLoading(true);
      const response = await getSubskillById(id);
      setSubskill(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || "",
      });
    } catch (error) {
      console.error("Error loading subskill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubskill = async (e) => {
    e.preventDefault();
    try {
      const response = await updateSubskill(id, formData);
      setSubskill(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating subskill:", error);
      alert("Failed to update subskill. Please try again.");
    }
  };

  const handleDeleteSubskill = async () => {
    if (window.confirm("Are you sure you want to delete this subskill?")) {
      try {
        await deleteSubskill(id);
        navigate(-1);
      } catch (error) {
        console.error("Error deleting subskill:", error);
        alert("Failed to delete subskill. Please try again.");
      }
    }
  };

  const handleAddXP = async (amount) => {
    try {
      const response = await addXP(id, amount);
      setSubskill(response.data);
    } catch (error) {
      console.error("Error adding XP:", error);
      alert("Failed to add XP. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading subskill...</div>;
  }

  if (!subskill) {
    return <div className="error">Subskill not found</div>;
  }

  const tier = getTier(subskill.level);
  const tierClass = getTierClass(subskill.level);

  return (
    <div className="subskill-page">
      <div className="subskill-page-header">
        <div className="back-button-wrapper">
          <button className="btn btn-danger" onClick={() => navigate(-1)}>
            Back to Domain Page
          </button>
        </div>
        {editing ? (
          <form onSubmit={handleUpdateSubskill} className="subskill-edit-form">
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <textarea
              className="form-input form-textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <h1>{subskill.name}</h1>
              <p className="subskill-description">
                {subskill.description || "No description"}
              </p>
            </div>
            <div className="subskill-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDeleteSubskill}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="subskill-progress card">
        <LevelProgressBar xp={subskill.xp} level={subskill.level} />
      </div>

      <ProjectXPForm onAddXP={handleAddXP} currentXP={subskill.xp} />
    </div>
  );
};

export default SubskillPage;
