import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getDomainById,
  updateDomain,
  deleteDomain,
  createSubskill,
} from "../api/api";
import SubskillCard from "../components/SubskillCard";
import "../styles/DomainPage.css";

const DomainPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [showSubskillForm, setShowSubskillForm] = useState(false);
  const [subskillFormData, setSubskillFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadDomain();
  }, [id]);

  const loadDomain = async () => {
    try {
      setLoading(true);
      const response = await getDomainById(id);
      setDomain(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || "",
      });
    } catch (error) {
      console.error("Error loading domain:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    try {
      const response = await updateDomain(id, formData);
      setDomain(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating domain:", error);
      alert("Failed to update domain. Please try again.");
    }
  };

  const handleDeleteDomain = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this domain? This will delete all subskills.",
      )
    ) {
      try {
        await deleteDomain(id);
        navigate(-1);
      } catch (error) {
        console.error("Error deleting domain:", error);
        alert("Failed to delete domain. Please try again.");
      }
    }
  };

  const handleCreateSubskill = async (e) => {
    e.preventDefault();
    try {
      await createSubskill(id, subskillFormData);
      setSubskillFormData({ name: "", description: "" });
      setShowSubskillForm(false);
      await loadDomain();
    } catch (error) {
      console.error("Error creating subskill:", error);
      alert("Failed to create subskill. Please try again.");
    }
  };

  const handleCopyList = () => {
    if (domain.subskills && domain.subskills.length > 0) {
      const subskillNames = domain.subskills.map((s) => s.name).join("\n");
      navigator.clipboard.writeText(subskillNames);
      alert("Subskill list copied to clipboard!");
    }
  };

  const handleGenerateTestPrompt = () => {
    if (domain.subskills && domain.subskills.length > 0) {
      const subskillNames = domain.subskills
        .map((s) => `${s.name}: Level ${s.level}`)
        .join(", ");
      const prompt = `
You are generating a high-quality, rigorous test.

The test must cover ALL of the following subskills, each with an associated level (1–100):
${subskillNames}

Level Meaning:
0–20 = Beginner (basic understanding, foundational concepts)
21–40 = Early Intermediate (guided application)
41–60 = Intermediate (independent application, moderate complexity)
61–80 = Advanced (multi-step reasoning, edge cases, abstraction)
81–100 = Expert (deep understanding, synthesis, optimization, real-world complexity)

Generate a test with EXACTLY 10 questions structured as follows:
- 2 Project-Based Questions (200 XP each)
- 4 Exercise / Problem-Solving Questions (100 XP each)
- 2 Written Answer / Analysis Questions (50 XP each)
- 2 Multiple Choice Questions (25 XP each)

Total Questions: 10
Total Possible XP: 800 XP

STRICT REQUIREMENTS:
- EVERY subskill listed MUST be meaningfully tested at least once.
- Difficulty of each question MUST match the subskill’s level.
- Higher-level subskills must appear in more complex, multi-layered tasks.
- Lower-level subskills should focus on fundamentals but still require thinking.
- Avoid pure definition questions unless level is under 15.
- Projects must require synthesis of multiple subskills.
- Exercises must require application, not memorization.
- Multiple choice questions must include plausible distractors.
- Do NOT include answers or solutions.

Formatting Requirements:
- Clearly label each question as:
  - [Project – 200 XP]
  - [Exercise – 100 XP]
  - [Written – 50 XP]
  - [Multiple Choice – 25 XP]
- Clearly indicate which subskills are being tested in each question.

After the 10 questions, include:

1) An XP Breakdown Table:
   - Each subskill
   - XP available for that subskill
   - XP earned (leave blank for grading system to fill)

Do NOT provide solutions.
Do NOT grade the test.
Only generate the test and XP structure.
`;
      navigator.clipboard.writeText(prompt);
      alert("Test prompt copied to clipboard!");
    }
  };

  if (loading) {
    return <div className="loading">Loading domain...</div>;
  }

  if (!domain) {
    return <div className="error">Domain not found</div>;
  }

  return (
    <div className="domain-page">
      <div className="domain-page-header">
        {editing ? (
          <form onSubmit={handleUpdateDomain} className="domain-edit-form">
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
              <h1>{domain.name}</h1>
              <p className="domain-description">
                {domain.description || "No description"}
              </p>
            </div>
            <div className="domain-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDeleteDomain}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="domain-utility-buttons">
        <button
          className="btn btn-secondary"
          onClick={handleCopyList}
          disabled={!domain.subskills || domain.subskills.length === 0}
        >
          📋 Copy List
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleGenerateTestPrompt}
          disabled={!domain.subskills || domain.subskills.length === 0}
        >
          🧪 Generate Test Prompt
        </button>
      </div>

      <div className="subskills-section">
        <div className="subskills-header">
          <h2>Subskills ({domain.subskills?.length || 0})</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowSubskillForm(!showSubskillForm)}
          >
            {showSubskillForm ? "Cancel" : "+ Add Subskill"}
          </button>
        </div>

        {showSubskillForm && (
          <div className="create-subskill-form card">
            <h3>Create New Subskill</h3>
            <form onSubmit={handleCreateSubskill}>
              <div className="form-group">
                <label className="form-label">Subskill Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={subskillFormData.name}
                  onChange={(e) =>
                    setSubskillFormData({
                      ...subskillFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., React Hooks"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={subskillFormData.description}
                  onChange={(e) =>
                    setSubskillFormData({
                      ...subskillFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this subskill..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Subskill
              </button>
            </form>
          </div>
        )}

        {domain.subskills && domain.subskills.length > 0 ? (
          <div className="subskills-grid">
            {domain.subskills.map((subskill) => (
              <SubskillCard key={subskill._id} subskill={subskill} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No subskills yet. Create your first subskill to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainPage;
