import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NodeTree from "../components/learning-hub/NodeTree";
import TestingInterface from "./learning-hub/TestingInterface";
import ProjectSubmission from "./learning-hub/ProjectSubmission";
import ProgressDashboard from "../components/learning-hub/ProgressDashboard";
import { api } from "../api/api";
import "../styles/learning-hub/LearningHub.css";

const LearningHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("nodes");
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [nodesRes, statsRes] = await Promise.all([
          api.getAllNodes(),
          api.getUserStats(),
        ]);
        setNodes(nodesRes.data.nodes || []);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load learning hub");
        console.error("Error fetching hub data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    // Switch to appropriate tab based on node type
    if (node.type === "learning") {
      setActiveTab("tests");
    }
  };

  const handleNodeUpdate = async () => {
    // Refresh nodes after update
    try {
      const res = await api.getAllNodes();
      setNodes(res.data.nodes || []);
    } catch (err) {
      console.error("Error refreshing nodes:", err);
    }
  };

  const handleRefreshStats = async () => {
    try {
      const res = await api.getUserStats();
      setStats(res.data);
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  };

  if (loading) {
    return (
      <div className="learning-hub">
        <div className="hub-loading">
          <div className="spinner"></div>
          <p>Loading your learning hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-hub-container">
      <div className="hub-header">
        <div>
          <h1>Learning Hub</h1>
          <p className="hub-welcome">
            Welcome back, {user?.name || "Learner"}! 🎓
          </p>
        </div>
        {stats && (
          <div className="hub-stats-quick">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div>
                <p className="stat-label">Total XP</p>
                <p className="stat-value">{stats.totalXp || 0}</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <div>
                <p className="stat-label">Nodes</p>
                <p className="stat-value">{stats.nodeCount || 0}</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div>
                <p className="stat-label">Max Level</p>
                <p className="stat-value">lvl {stats.maxLevel || 1}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="hub-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "nodes" ? "active" : ""}`}
            onClick={() => setActiveTab("nodes")}
          >
            <span className="tab-icon">🌳</span>
            <span className="tab-label">Node Tree</span>
          </button>
          <button
            className={`tab-button ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => setActiveTab("tests")}
            disabled={!selectedNode || selectedNode.type !== "learning"}
          >
            <span className="tab-icon">✍️</span>
            <span className="tab-label">Tests</span>
          </button>
          <button
            className={`tab-button ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
            disabled={!selectedNode || selectedNode.type !== "learning"}
          >
            <span className="tab-icon">💻</span>
            <span className="tab-label">Projects</span>
          </button>
          <button
            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-label">Progress</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Nodes Tab */}
          {activeTab === "nodes" && (
            <NodeTree
              nodes={nodes}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              onNodeUpdate={handleNodeUpdate}
            />
          )}

          {/* Tests Tab */}
          {activeTab === "tests" &&
            selectedNode &&
            selectedNode.type === "learning" && (
              <div className="test-tab-wrapper">
                <div className="test-node-info">
                  <h3>{selectedNode.title}</h3>
                  <p className="node-description">{selectedNode.description}</p>
                  <div className="node-stats-inline">
                    <span>Level {selectedNode.level} / 100</span>
                    <span>{selectedNode.xp} / 100 XP</span>
                  </div>
                </div>
                <TestingInterface
                  nodeIds={[selectedNode._id]}
                  onComplete={handleRefreshStats}
                  onClose={() => setActiveTab("nodes")}
                />
              </div>
            )}

          {/* Projects Tab */}
          {activeTab === "projects" &&
            selectedNode &&
            selectedNode.type === "learning" && (
              <div className="projects-tab-wrapper">
                <div className="project-node-info">
                  <h3>{selectedNode.title}</h3>
                  <p className="node-description">{selectedNode.description}</p>
                  <div className="node-stats-inline">
                    <span>Level {selectedNode.level} / 100</span>
                    <span>{selectedNode.xp} / 100 XP</span>
                  </div>
                </div>
                <ProjectSubmission
                  nodeId={selectedNode._id}
                  onCompleted={handleRefreshStats}
                  onClose={() => setActiveTab("nodes")}
                />
              </div>
            )}

          {/* Progress Tab */}
          {activeTab === "progress" && stats && (
            <ProgressDashboard stats={stats} nodes={nodes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningHub;
