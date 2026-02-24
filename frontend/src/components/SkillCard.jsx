import { Link } from 'react-router-dom';
import '../styles/SkillCard.css';

const SkillCard = ({ skill, domains = [] }) => {
  // Get preview of subskills (first 3 from first domain)
  const previewSubskills = domains.length > 0 && domains[0].subskills
    ? domains[0].subskills.slice(0, 3)
    : [];

  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <Link to={`/skill/${skill._id}`} className="skill-card-title">
          {skill.name}
        </Link>
        <p className="skill-card-description">{skill.description || 'No description'}</p>
      </div>
      
      <div className="skill-card-content">
        <div className="skill-card-domains">
          <span className="domain-count">{domains.length} Domain{domains.length !== 1 ? 's' : ''}</span>
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
        
        {previewSubskills.length > 0 && (
          <div className="subskill-preview">
            <span className="subskill-label">Subskills:</span>
            {previewSubskills.map((subskill) => (
              <span key={subskill._id} className="subskill-tag">
                {subskill.name}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="skill-card-actions">
        <Link to={`/skill/${skill._id}`} className="btn btn-primary btn-small">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default SkillCard;
