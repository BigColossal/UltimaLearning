import { useState, useEffect, useRef } from "react";
import "../styles/EditSkillCard.css";

const CreateDomainCard = ({ isOpen, onCreate, onCancel }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [visible, setVisible] = useState(isOpen);
  const [active, setActive] = useState(false);
  const cardRef = useRef(null);

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

  const handleOverlayClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ name: "", description: "" });
  };

  if (!visible) return null;

  return (
    <div
      className={`edit-overlay ${active ? "open" : "closing"}`}
      onMouseDown={handleOverlayClick}
    >
      <div className="edit-card" ref={cardRef}>
        <h2>Create Domain</h2>

        <form onSubmit={handleSubmit}>
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
              placeholder="Domain name"
            />
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
              />
            </div>
            <div className="edit-actions">
              <button type="submit" className="btn btn-primary">
                Create
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

export default CreateDomainCard;
