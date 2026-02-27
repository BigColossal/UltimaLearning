import { Link } from "react-router-dom";
import "../styles/SkillCard.css";
import { getTierClass } from "../utils/levelUtils";

const SkillCard = ({ skill, domains = [] }) => {
  const previewSubskills =
    domains.length > 0 && domains[0].subskills
      ? domains[0].subskills.slice(0, 3)
      : [];

  return (
    <Link to={`/skill/${skill._id}`} className="skill-card-link">
      <div className="skill-card">
        <div className="skill-card-banner">
          <div className="skill-card-banner-inner">
            <div className="banner-placeholder">
              {skill.image ? (
                <img src={skill.image} alt={skill.name} />
              ) : (
                <span>{skill.name}</span>
              )}
            </div>
          </div>
        </div>

        <div className="skill-card-header">
          <h3 className="skill-card-title">{skill.name}</h3>
          <p className="skill-card-description">
            {skill.description || "No description"}
          </p>
        </div>

        <div className="skill-card-content">
          <div className="skill-card-domains">
            <span className="domain-count">
              {domains.length} Domain{domains.length !== 1 ? "s" : ""}
            </span>

            {domains.length > 0 && (
              <div className="domain-preview">
                {domains.slice(0, 2).map((domain) => (
                  <span key={domain._id} className="domain-tag">
                    {domain.name}
                  </span>
                ))}
                {domains.length > 2 && (
                  <span className="domain-tag">+{domains.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;
