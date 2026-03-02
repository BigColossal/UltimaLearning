import { Link } from "react-router-dom";
import { getXPProgress, getTier, getTierClass } from "../utils/levelUtils";
import "../styles/SubskillCard.css";

const SubskillCard = ({ subskill }) => {
  const xpProgress = getXPProgress(subskill.xp);
  const tier = getTier(subskill.level);
  const tierClass = getTierClass(subskill.level);

  return (
    <Link
      to={`/subskill/${subskill._id}`}
      className={`subskill-card ${tierClass}`}
    >
      <div className="subskill-card-header">
        <h3 className="subskill-card-name">{subskill.name}</h3>
        <div className="subskill-card-level">
          <span className={`level-badge ${tierClass}`}>
            {tier} {subskill.level}
          </span>
        </div>
      </div>

      <div className="subskill-card-progress">
        <div className="xp-info">
          <span className="xp-text">{subskill.xp} XP</span>
          <span className="level-text">Level {subskill.level}/100</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubskillCard;
