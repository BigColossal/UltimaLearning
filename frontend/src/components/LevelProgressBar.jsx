import { getXPProgress, getTier, getTierClass, getNextLevelXP } from '../utils/levelUtils';
import '../styles/LevelProgressBar.css';

const LevelProgressBar = ({ xp, level }) => {
  const xpProgress = getXPProgress(xp);
  const tier = getTier(level);
  const tierClass = getTierClass(level);
  const nextLevelXP = getNextLevelXP(xp);

  return (
    <div className="level-progress-container">
      <div className="level-progress-header">
        <div className="level-info">
          <span className={`level-badge-large ${tierClass}`}>
            {tier} Level {level}
          </span>
          <span className="xp-total">{xp} XP</span>
        </div>
        {nextLevelXP && (
          <span className="next-level-xp">
            Next: {nextLevelXP} XP
          </span>
        )}
      </div>
      
      <div className="xp-bar-container-large">
        <div className="xp-bar-large">
          <div 
            className="xp-bar-fill-large" 
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="xp-bar-labels">
          <span>{level * 100} XP</span>
          {nextLevelXP && <span>{nextLevelXP} XP</span>}
        </div>
      </div>
    </div>
  );
};

export default LevelProgressBar;
