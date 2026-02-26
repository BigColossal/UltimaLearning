import { useState } from "react";
import { submitProject } from "../../api/api";
import "../../styles/learning-hub/ProjectSubmission.css";

const ProjectSubmission = ({ nodeId, onSubmit, onClose }) => {
  const [submissionType, setSubmissionType] = useState("code");
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submissionTypes = [
    { id: "code", label: "Code Snippet", icon: "📝" },
    { id: "editor", label: "Code Editor", icon: "✏️" },
    { id: "github", label: "GitHub Link", icon: "🔗" },
    { id: "upload", label: "File Upload", icon: "📁" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError(
        `Please provide ${submissionTypes.find((st) => st.id === submissionType)?.label.toLowerCase()}`,
      );
      return;
    }

    try {
      setLoading(true);
      const response = await submitProject(
        nodeId,
        submissionType,
        content,
        metadata,
      );
      setResult(response.data);
      setSubmitted(true);
      onSubmit?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit project");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="project-result">
        <div className="result-header">
          <h2>Review Complete! 🎉</h2>
          <p className="result-subtitle">Your code has been reviewed</p>
        </div>

        <div className="review-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span
              className={`stat-value score-${Math.floor(result.score / 20)}`}
            >
              {result.score}%
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">XP Earned</span>
            <span className="stat-value xp-earned">+{result.xpEarned}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Mastery</span>
            <span
              className={`stat-value ${result.masteryAchieved ? "achieved" : ""}`}
            >
              {result.masteryAchieved ? "✓ Yes" : "✗ Not Yet"}
            </span>
          </div>
        </div>

        <div className="review-content">
          <div className="review-section">
            <h3>Strengths</h3>
            <ul className="strengths-list">
              {result.strengths.map((s, i) => (
                <li key={i}>✓ {s}</li>
              ))}
            </ul>
          </div>

          {result.weaknesses.length > 0 && (
            <div className="review-section">
              <h3>Areas to Improve</h3>
              <ul className="weaknesses-list">
                {result.weaknesses.map((w, i) => (
                  <li key={i}>⚠ {w}</li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className="review-section">
              <h3>Suggestions</h3>
              <ul className="suggestions-list">
                {result.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.rubricBreakdown && (
            <div className="review-section">
              <h3>Detailed Rubric Scores</h3>
              <div className="rubric-scores">
                {Object.entries(result.rubricBreakdown).map(([key, score]) => (
                  <div key={key} className="rubric-item">
                    <span className="rubric-label">
                      {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                    </span>
                    <div className="rubric-bar">
                      <div
                        className="rubric-fill"
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="rubric-score">{score}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button onClick={onClose} className="btn-done">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="project-submission" onSubmit={handleSubmit}>
      <div className="submission-header">
        <h2>Submit Project</h2>
        <p className="submission-subtitle">
          Get AI-powered feedback on your code
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="submission-type-selector">
        {submissionTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`type-button ${submissionType === type.id ? "active" : ""}`}
            onClick={() => {
              setSubmissionType(type.id);
              setContent("");
            }}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="submission-input">
        {submissionType === "code" && (
          <textarea
            placeholder="Paste your code here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="code-textarea"
            rows="12"
          />
        )}

        {submissionType === "editor" && (
          <div className="editor-container">
            <textarea
              placeholder="Write or paste your code..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="code-textarea"
              rows="12"
            />
            <p className="editor-hint">
              💡 Tip: Use syntax highlighting libraries for better experience
            </p>
          </div>
        )}

        {submissionType === "github" && (
          <div className="github-input">
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-input"
            />
            <p className="input-hint">
              Enter the GitHub repository URL. We'll analyze the code
              automatically.
            </p>
          </div>
        )}

        {submissionType === "upload" && (
          <div className="file-upload">
            <input
              type="file"
              id="file-input"
              accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.go,.rs,.rb,.php"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMetadata({ filename: file.name });
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setContent(event.target?.result || "");
                  };
                  reader.readAsText(file);
                }
              }}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <span className="upload-icon">📤</span>
              <span className="upload-text">
                Click to upload or drag & drop
              </span>
              <span className="upload-hint">
                Supported: .js, .ts, .py, .java, .cpp, .go, .rs, .php
              </span>
            </label>
            {metadata.filename && (
              <p className="file-name">✓ {metadata.filename}</p>
            )}
          </div>
        )}
      </div>

      <div className="submission-footer">
        <p className="submission-note">
          ⏱️ Reviews typically take a few seconds. You have 10 submissions per
          day.
        </p>
        <div className="button-group">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn-submit"
          >
            {loading ? "Reviewing..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProjectSubmission;
