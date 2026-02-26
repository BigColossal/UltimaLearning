import { useState } from "react";
import api from "../../api/api.js";
import "../../styles/learning-hub/NodeTree.css";

const NodeTree = ({ nodes, selectedNode, onNodeSelect, onNodeUpdate }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [editingNode, setEditingNode] = useState(null);
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    title: "",
    description: "",
    type: "learning",
    parentId: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const toggleExpanded = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createNode({
        ...newNodeData,
        parentId: newNodeData.parentId || undefined,
      });

      setSuccess("Node created successfully!");
      setNewNodeData({
        title: "",
        description: "",
        type: "learning",
        parentId: null,
      });
      setShowCreateNode(false);
      onNodeUpdate();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create node");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm("Are you sure you want to delete this node?")) return;

    setLoading(true);
    try {
      await api.deleteNode(nodeId);
      setSuccess("Node deleted successfully!");
      onNodeUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete node");
    } finally {
      setLoading(false);
    }
  };

  const renderNodeTree = (nodeList, parentId = null) => {
    // Filter nodes for this level
    const levelNodes = nodeList.filter(
      (node) => (node.parentId || null) === parentId,
    );

    if (levelNodes.length === 0) return null;

    return (
      <ul className="node-list">
        {levelNodes.map((node) => {
          const children = nodeList.filter((n) => n.parentId === node._id);
          const hasChildren = children.length > 0;
          const isExpanded = expandedNodes.has(node._id);
          const isSelected = selectedNode?._id === node._id;

          return (
            <li
              key={node._id}
              className={`node-item ${isSelected ? "selected" : ""}`}
            >
              <div className="node-row">
                {hasChildren && (
                  <button
                    className={`expand-btn ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleExpanded(node._id)}
                  >
                    ▶
                  </button>
                )}
                {!hasChildren && <span className="expand-placeholder"></span>}

                <button
                  className={`node-button ${node.type === "container" ? "container" : "learning"}`}
                  onClick={() => onNodeSelect(node)}
                >
                  <span className="node-icon">
                    {node.type === "container" ? "📁" : "📖"}
                  </span>
                  <div className="node-info">
                    <span className="node-title">{node.title}</span>
                    {node.type === "learning" && (
                      <span className="node-level">lvl {node.level}/100</span>
                    )}
                  </div>
                </button>

                <div className="node-actions">
                  <button
                    className="action-btn edit-btn"
                    title="Edit node"
                    onClick={() => setEditingNode(node)}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Delete node"
                    onClick={() => handleDeleteNode(node._id)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {hasChildren && isExpanded && renderNodeTree(nodeList, node._id)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="node-tree-container">
      <div className="tree-header">
        <h3>Skill Tree</h3>
        <button
          className="btn-create-node"
          onClick={() => setShowCreateNode(!showCreateNode)}
        >
          + New Node
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <span className="success-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      {showCreateNode && (
        <form className="create-node-form" onSubmit={handleCreateNode}>
          <div className="form-group">
            <label>Node Title</label>
            <input
              type="text"
              required
              value={newNodeData.title}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, title: e.target.value })
              }
              placeholder="e.g., React Basics"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newNodeData.description}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, description: e.target.value })
              }
              placeholder="What is this skill about?"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={newNodeData.type}
              onChange={(e) =>
                setNewNodeData({ ...newNodeData, type: e.target.value })
              }
            >
              <option value="container">Container (Folder)</option>
              <option value="learning">Learning Node (Skill)</option>
            </select>
          </div>

          {selectedNode && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newNodeData.parentId === selectedNode._id}
                  onChange={(e) =>
                    setNewNodeData({
                      ...newNodeData,
                      parentId: e.target.checked ? selectedNode._id : null,
                    })
                  }
                />
                Make child of "{selectedNode.title}"
              </label>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCreateNode(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating..." : "Create Node"}
            </button>
          </div>
        </form>
      )}

      <div className="tree-container">
        {nodes && nodes.length > 0 ? (
          renderNodeTree(nodes)
        ) : (
          <div className="empty-state">
            <p>No nodes yet. Create your first learning node!</p>
            <button
              className="btn-create-node"
              onClick={() => setShowCreateNode(true)}
            >
              + Create Node
            </button>
          </div>
        )}
      </div>

      {selectedNode && (
        <div className="node-details">
          <h4>Node Details</h4>
          <div className="details-content">
            <p>
              <strong>Type:</strong>{" "}
              {selectedNode.type === "container" ? "Container" : "Learning"}
            </p>
            <p>
              <strong>Title:</strong> {selectedNode.title}
            </p>
            {selectedNode.description && (
              <p>
                <strong>Description:</strong> {selectedNode.description}
              </p>
            )}
            {selectedNode.type === "learning" && (
              <>
                <p>
                  <strong>Level:</strong> {selectedNode.level} / 100
                </p>
                <p>
                  <strong>XP:</strong> {selectedNode.xp} / 100
                </p>
                <p>
                  <strong>Total XP:</strong> {selectedNode.totalXp}
                </p>
                <p>
                  <strong>Tier:</strong>{" "}
                  {selectedNode.milestoneTier || "Novice"}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeTree;
