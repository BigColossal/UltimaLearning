import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/DomainAccordion.css";

const DomainAccordion = ({ domain, subskills = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`domain-accordion ${isOpen ? "open" : ""}`}>
      <div
        className="domain-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="domain-accordion-title">
          <span className={`accordion-icon ${isOpen ? "open" : ""}`}>▶</span>
          <span>{domain.name}</span>
          <span className="subskill-count">({subskills.length} subskills)</span>
        </div>
        <Link
          to={`/domain/${domain._id}`}
          className="btn btn-primary btn-small"
          onClick={(e) => e.stopPropagation()}
        >
          View Domain
        </Link>
      </div>

      <div className={`domain-accordion-content ${isOpen ? "open" : ""}`}>
        {domain.description && (
          <p className="domain-description">{domain.description}</p>
        )}
        <div className="subskill-list">
          {subskills.length > 0 ? (
            subskills.map((subskill) => (
              <Link
                key={subskill._id}
                to={`/subskill/${subskill._id}`}
                className="subskill-item"
              >
                <span className="subskill-name">{subskill.name}</span>
                <span className="subskill-level">Lv. {subskill.level}</span>
              </Link>
            ))
          ) : (
            <p className="no-subskills">No subskills yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainAccordion;
