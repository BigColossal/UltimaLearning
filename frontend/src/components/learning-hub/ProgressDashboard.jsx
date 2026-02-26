import "../../styles/learning-hub/ProgressDashboard.css";

const ProgressDashboard = ({ stats, nodes }) => {
  // Calculate progress metrics
  const totalNodes = nodes.length;
  const learningNodes = nodes.filter((n) => n.type === "learning").length;
  const containerNodes = nodes.filter((n) => n.type === "container").length;

  // Find highest level node
  const highestLevel = Math.max(
    0,
    ...nodes.filter((n) => n.type === "learning").map((n) => n.level || 0),
  );

  // Calculate average progress
  const avgProgress =
    learningNodes > 0
      ? Math.round(
          nodes
            .filter((n) => n.type === "learning")
            .reduce((sum, n) => sum + (n.level || 0), 0) / learningNodes,
        )
      : 0;

  // Group nodes by tier
  const getTierCount = (tier) => {
    return nodes.filter(
      (n) => n.type === "learning" && n.milestoneTier === tier,
    ).length;
  };

  const tiers = [
    { name: "Novice", count: getTierCount("Novice"), color: "#666666" },
    { name: "Bronze", count: getTierCount("Bronze"), color: "#cd7f32" },
    { name: "Silver", count: getTierCount("Silver"), color: "#c0c0c0" },
    { name: "Gold", count: getTierCount("Gold"), color: "#ffd700" },
    { name: "Platinum", count: getTierCount("Platinum"), color: "#e5e4e2" },
    { name: "Diamond", count: getTierCount("Diamond"), color: "#b9f2ff" },
    { name: "Master", count: getTierCount("Master"), color: "#ff1493" },
  ];

  // Calculate XP distribution
  const xpRanges = [
    { label: "0-30", min: 0, max: 30 },
    { label: "31-60", min: 31, max: 60 },
    { label: "61-100", min: 61, max: 100 },
  ];

  const getXpRangeCount = (min, max) => {
    return nodes.filter(
      (n) => n.type === "learning" && n.xp >= min && n.xp <= max,
    ).length;
  };

  return (
    <div className="progress-dashboard">
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-text">
            <p className="stat-label">Total XP</p>
            <p className="stat-main">{stats?.totalXp || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-text">
            <p className="stat-label">Total Nodes</p>
            <p className="stat-main">{totalNodes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-text">
            <p className="stat-label">Highest Level</p>
            <p className="stat-main">lvl {highestLevel}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-text">
            <p className="stat-label">avg Progress</p>
            <p className="stat-main">{avgProgress}</p>
          </div>
        </div>
      </div>

      {/* Node Breakdown */}
      <div className="metrics-row">
        <div className="metric-card">
          <h4>Node Distribution</h4>
          <div className="metric-content">
            <div className="metric-item">
              <span className="metric-icon">📁</span>
              <div className="metric-detail">
                <p className="metric-label">Containers</p>
                <p className="metric-value">{containerNodes}</p>
              </div>
            </div>
            <div className="metric-item">
              <span className="metric-icon">📖</span>
              <div className="metric-detail">
                <p className="metric-label">Learning Nodes</p>
                <p className="metric-value">{learningNodes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Statistics */}
        <div className="metric-card">
          <h4>Level Statistics</h4>
          <div className="level-stats">
            {[1, 10, 20, 30, 50, 100].map((level) => {
              const count = nodes.filter(
                (n) => n.type === "learning" && n.level >= level,
              ).length;
              return (
                <div key={level} className="level-stat">
                  <span className="level-label">Lvl {level}+</span>
                  <span className="level-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="tier-section">
        <h4>Milestone Tiers</h4>
        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.name} className="tier-card">
              <div
                className="tier-badge"
                style={{ backgroundColor: tier.color }}
              >
                {tier.count}
              </div>
              <p className="tier-name">{tier.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP Distribution */}
      <div className="xp-section">
        <h4>XP Progress Distribution</h4>
        <div className="xp-bars">
          {xpRanges.map((range) => {
            const count = getXpRangeCount(range.min, range.max);
            const percentage =
              learningNodes > 0 ? (count / learningNodes) * 100 : 0;
            return (
              <div key={range.label} className="xp-bar-item">
                <p className="xp-label">{range.label}</p>
                <div className="xp-bar">
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="xp-count">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="activity-section">
        <h4>Quick Stats</h4>
        <div className="activity-stats">
          <div className="activity-item">
            <span className="activity-icon">⏱️</span>
            <p>
              Active nodes:{" "}
              {
                nodes.filter((n) => n.type === "learning" && n.totalXp > 0)
                  .length
              }
            </p>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🔥</span>
            <p>
              Completion rate:{" "}
              {learningNodes > 0
                ? Math.round(
                    (nodes.filter(
                      (n) => n.type === "learning" && n.level === 100,
                    ).length /
                      learningNodes) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🎖️</span>
            <p>
              Master tier:{" "}
              {
                nodes.filter(
                  (n) => n.type === "learning" && n.milestoneTier === "Master",
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
