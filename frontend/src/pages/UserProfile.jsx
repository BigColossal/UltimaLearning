import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSkills, getSkillById } from '../api/api';
import { getTier, getTierClass } from '../utils/levelUtils';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user, skills } = useUser();
  const [allSubskills, setAllSubskills] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadAllSubskills();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadAllSubskills = async () => {
    try {
      setLoading(true);
      
      // Fetch skills directly to avoid dependency on context state
      const skillsResponse = await getSkills(user?.username || 'default');
      const currentSkills = skillsResponse.data;
      
      if (currentSkills.length === 0) {
        setLoading(false);
        return;
      }
      
      // Fetch all subskills from all skills
      const subskillsPromises = currentSkills.map(async (skill) => {
        try {
          const skillData = await getSkillById(skill._id);
          const allSubskills = [];
          
          if (skillData.data.domains) {
            for (const domain of skillData.data.domains) {
              if (domain.subskills) {
                allSubskills.push(...domain.subskills.map(subskill => ({
                  ...subskill,
                  skillName: skillData.data.name,
                  domainName: domain.name,
                })));
              }
            }
          }
          
          return allSubskills;
        } catch (error) {
          console.error(`Error loading skill ${skill._id}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(subskillsPromises);
      setAllSubskills(results.flat());
    } catch (error) {
      console.error('Error loading subskills:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalXP = allSubskills.reduce((sum, s) => sum + (s.xp || 0), 0);
  const totalLevels = allSubskills.reduce((sum, s) => sum + (s.level || 0), 0);
  const averageLevel = allSubskills.length > 0 
    ? Math.round(totalLevels / allSubskills.length) 
    : 0;

  // Sort by level descending
  const sortedSubskills = [...allSubskills].sort((a, b) => (b.level || 0) - (a.level || 0));

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>User Profile</h1>
        {user && (
          <div className="profile-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Total Skills</h3>
          <p className="stat-value">{skills.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Subskills</h3>
          <p className="stat-value">{allSubskills.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total XP</h3>
          <p className="stat-value">{totalXP.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Average Level</h3>
          <p className="stat-value">{averageLevel}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading progress...</div>
      ) : (
        <div className="progress-section">
          <h2>All Subskill Progress</h2>
          {sortedSubskills.length > 0 ? (
            <div className="subskills-list">
              {sortedSubskills.map((subskill) => {
                const tier = getTier(subskill.level);
                const tierClass = getTierClass(subskill.level);
                const xpProgress = (subskill.xp % 100);
                
                return (
                  <Link 
                    key={subskill._id} 
                    to={`/subskill/${subskill._id}`}
                    className={`subskill-progress-item ${tierClass}`}
                  >
                    <div className="subskill-progress-header">
                      <div>
                        <h3>{subskill.name}</h3>
                        <p className="subskill-path">
                          {subskill.skillName} → {subskill.domainName}
                        </p>
                      </div>
                      <span className={`level-badge ${tierClass}`}>
                        {tier} {subskill.level}
                      </span>
                    </div>
                    <div className="subskill-progress-bar">
                      <div className="xp-info-small">
                        <span>{subskill.xp} XP</span>
                        <span>Level {subskill.level}/100</span>
                      </div>
                      <div className="xp-bar">
                        <div 
                          className="xp-bar-fill" 
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No subskills yet. Start creating skills and subskills to track your progress!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
