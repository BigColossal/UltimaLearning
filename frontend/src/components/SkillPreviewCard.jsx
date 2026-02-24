import { Link } from 'react-router-dom';
import '../styles/SkillPreviewCard.css';

const SkillPreviewCard = ({ skill, domains = [] }) => {
  // Calculate total subskills
  const totalSubskills = domains.reduce((total, domain) => {
    return total + (domain.subskills?.length || 0);
  }, 0);

  // Get skill icon based on name (fallback to default)
  const getSkillIcon = (skillName) => {
    const name = skillName.toLowerCase();
    if (name.includes('web') || name.includes('frontend') || name.includes('backend')) {
      return '🌐';
    } else if (name.includes('data') || name.includes('science') || name.includes('machine')) {
      return '📊';
    } else if (name.includes('mobile') || name.includes('app')) {
      return '📱';
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
      return '🎨';
    } else if (name.includes('language') || name.includes('programming')) {
      return '💻';
    } else if (name.includes('cloud') || name.includes('devops')) {
      return '☁️';
    } else {
      return '📚';
    }
  };

  return (
    <Link to={`/skill/${skill._id}`} className="skill-preview-card">
      <div className="skill-preview-icon">{getSkillIcon(skill.name)}</div>
      <div className="skill-preview-content">
        <h3 className="skill-preview-name">{skill.name}</h3>
        <p className="skill-preview-description">
          {skill.description || 'Start your learning journey here'}
        </p>
        <div className="skill-preview-stats">
          <span className="skill-preview-stat">
            <span className="stat-label">Domains:</span>
            <span className="stat-value">{domains.length}</span>
          </span>
          <span className="skill-preview-stat">
            <span className="stat-label">Subskills:</span>
            <span className="stat-value">{totalSubskills}</span>
          </span>
        </div>
      </div>
      <div className="skill-preview-arrow">→</div>
    </Link>
  );
};

export default SkillPreviewCard;
