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
      const subskillNames = domain.subskills
        .map((s) => `${s.name}: Level ${s.level}. ${s.description}`)
        .join("\n");
      navigator.clipboard.writeText(subskillNames);
      alert("Subskill list copied to clipboard!");
    }
  };

  const handleGenerateProjectPrompt = () => {
    if (domain.subskills && domain.subskills.length > 0) {
      const subskillNames = domain.subskills
        .map((s) => `${s.name}: Level ${s.level}. ${s.description}`)
        .join("\n\n");

      const prompt = `
You are generating a high-quality PROJECT challenge.

The project must cover ALL of the following subskills, each with an associated level (1–100):

${subskillNames}

Level Meaning:
0–20 = Beginner
21–40 = Early Intermediate
41–60 = Intermediate
61–80 = Advanced
81–100 = Expert

Generate ONE substantial project that meaningfully tests these subskills.

STRICT REQUIREMENTS:
- The project must integrate MULTIPLE subskills together.
- Difficulty must reflect the level of each subskill.
- Higher level subskills must appear in deeper architecture or complex logic.
- Lower level subskills should still be required but in simpler forms.
- The project must require real problem solving and implementation.
- Do NOT include any multiple choice, theory questions, or written analysis.
- Do NOT include answers or solutions.

Output format:

Project Title

Project Description

Project Requirements (clear bullet list)

Subskills Being Tested:
(list each subskill used)

After the project description, include an XP BREAKDOWN TABLE:

- Each subskill listed
- XP Available for that subskill
- XP Earned (leave blank)

XP RULES:
- Each subskill used should have atleast 500 exp available.
- Upper limit for a subskill is 1500. This depends heavily on how much and how in depth its used within the project.
- Higher-level subskills should have higher XP allocations.
- Lower-level subskills should have smaller XP allocations.
- XP should be distributed logically based on project difficulty.

Example table format:

Subskill | XP Available | XP Earned
HTML Document Structure | 500 | 
DOM Tree Representation | 1000 | 
Attributes and Attribute Parsing | 500 | 
... | ... | ...

At the bottom include:

Total XP Possible: [total exp available]

Do NOT provide solutions.
Only generate the project.
`;

      navigator.clipboard.writeText(prompt);
      alert("Project prompt copied to clipboard!");
    }
  };

  const handleGenerateExercisePrompt = () => {
    if (domain.subskills && domain.subskills.length > 0) {
      const subskillNames = domain.subskills
        .map((s) => `${s.name}: Level ${s.level}. ${s.description}`)
        .join("\n\n");

      const prompt = `
You are generating rigorous technical EXERCISES.

The exercises must cover ALL of the following subskills, each with an associated level (1–100):

${subskillNames}

Level Meaning:
0–20 = Beginner
21–40 = Early Intermediate
41–60 = Intermediate
61–80 = Advanced
81–100 = Expert

Generate EXACTLY 10 practical coding / technical exercises.

STRICT REQUIREMENTS:

* Exercises must require solving problems or implementing logic.
* No multiple choice questions.
* No written theory questions.
* No definition questions.
* All exercises must involve applying the skill.
* Difficulty must match the level of the subskill.
* Every subskill must be tested at least once.
* Exercises should increase slightly in difficulty from 1 → 10.

Formatting:

[Exercise 1]
Problem description

Subskills tested: ___

[Exercise 2]
Problem description

Subskills tested: ___

(Continue until Exercise 10)

There must be EXACTLY 10 exercises.

After the exercises, include an XP SUMMARY TABLE with:

* Exercise Number
* XP Available
* XP Earned (leave blank for grading)

Example:

Exercise | XP Available | XP Earned
1 | 200 |
2 | 200 |
3 | 200 |
4 | 300 |
5 | 300 |
6 | 300 |
7 | 300 |
8 | 400 |
9 | 400 |
10 | 500 |

After the XP SUMMARY TABLE, include a SUBSKILL XP TABLE.

Rules for the SUBSKILL XP TABLE:

* List every subskill that appeared in the exercises.
* If a subskill appears in an exercise, it receives the FULL XP value of that exercise.
* Do NOT divide or spread XP between subskills.
* If a subskill appears in multiple exercises, its XP should accumulate from each exercise.

Example:

Subskill | XP Earned
1.1 HTML Document Structure |
1.2 Browser HTML Parsing Process |
1.3 DOM Tree Representation |
1.4 Elements and Tag Syntax |

Do NOT include solutions.
Only generate the exercises and the two tables.`;

      navigator.clipboard.writeText(prompt);
      alert("Exercise prompt copied to clipboard!");
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
      <div className="back-button-wrapper">
        <button className="btn btn-danger" onClick={() => navigate(-1)}>
          Back to Skill Page
        </button>
      </div>
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
          onClick={handleGenerateProjectPrompt}
          disabled={!domain.subskills || domain.subskills.length === 0}
        >
          🏗 Generate Project Prompt
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleGenerateExercisePrompt}
          disabled={!domain.subskills || domain.subskills.length === 0}
        >
          🧩 Generate Exercise Prompt
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
