import { useEffect, useRef, useState } from "react";
import "../styles/EditSkillCard.css";

const EditSkillCard = ({ isOpen, formData, setFormData, onSave, onCancel }) => {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  // ESC key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onCancel();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setActive(false);

      const timer = setTimeout(() => {
        setActive(true);
      }, 10); // small delay ensures a paint frame

      return () => clearTimeout(timer);
    } else {
      setActive(false);
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div
      className={`edit-overlay ${active ? "open" : "closing"}`}
      onMouseDown={handleOverlayClick}
    >
      <div className="edit-card" ref={cardRef}>
        <h2>Edit Skill</h2>

        <form onSubmit={onSave}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="edit-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSkillCard;
