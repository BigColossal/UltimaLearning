import axios from "axios";

const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
export const getUser = () => apiClient.get("/users");

// ==================== GENERIC NODE API ====================

export const getAllNodes = () => apiClient.get("/nodes");
export const createNode = (data) => {
  if (data.type === "container") {
    return createContainerNode(data);
  } else if (data.type === "learning") {
    return createLearningNode(data);
  } else {
    return Promise.reject(new Error("Invalid node type"));
  }
};
export const deleteNode = (id) => apiClient.delete(`/nodes/${id}`);

// ==================== USER API ====================

export const getUserStats = () => apiClient.get("/users/stats");

// Container Node API
export const createContainerNode = (data) =>
  apiClient.post("/nodes/containers", data);
export const getContainerNodes = (parentId) =>
  parentId
    ? apiClient.get(`/nodes/containers?parentId=${parentId}`)
    : apiClient.get("/nodes/containers");
export const getContainerNodeById = (id) =>
  apiClient.get(`/nodes/containers/${id}`);
export const updateContainerNode = (id, data) =>
  apiClient.patch(`/nodes/containers/${id}`, data);
export const deleteContainerNode = (id) =>
  apiClient.delete(`/nodes/containers/${id}`);
export const reorderContainerNode = (id, data) =>
  apiClient.patch(`/nodes/containers/${id}/reorder`, data);

// Learning Node API
export const createLearningNode = (data) =>
  apiClient.post("/nodes/learning", data);
export const getLearningNodes = (parentContainerId) =>
  parentContainerId
    ? apiClient.get(`/nodes/learning?parentContainerId=${parentContainerId}`)
    : apiClient.get("/nodes/learning");
export const getLearningNodeById = (id) =>
  apiClient.get(`/nodes/learning/${id}`);
export const updateLearningNode = (id, data) =>
  apiClient.patch(`/nodes/learning/${id}`, data);
export const deleteLearningNode = (id) =>
  apiClient.delete(`/nodes/learning/${id}`);
export const addXpToLearningNode = (id, amount) =>
  apiClient.patch(`/nodes/learning/${id}/xp`, { amount });

// ==================== TEST API ====================

export const generateTest = (nodeIds, difficulty) =>
  apiClient.post("/tests/generate", { nodeIds, difficulty });
export const submitTest = (nodeIds, answers, difficulty, timeSpent) =>
  apiClient.post("/tests/submit", {
    nodeIds,
    answers,
    difficulty,
    timeSpent,
  });
export const getTestHistory = (limit, skip) =>
  apiClient.get(`/tests/history?limit=${limit}&skip=${skip}`);
export const getNodeTestHistory = (nodeId) =>
  apiClient.get(`/tests/history/${nodeId}`);

// ==================== PROJECT API ====================

export const submitProject = (nodeId, submissionType, content, metadata) =>
  apiClient.post("/projects/submit", {
    nodeId,
    submissionType,
    content,
    metadata,
  });
export const getProjectReviews = (nodeId) =>
  apiClient.get(`/projects/reviews/${nodeId}`);
export const getProjectReviewById = (reviewId) =>
  apiClient.get(`/projects/${reviewId}`);
export const getUserProjectHistory = (limit = 20, skip = 0) =>
  apiClient.get(`/projects/history?limit=${limit}&skip=${skip}`);
export const deleteProjectReview = (reviewId) =>
  apiClient.delete(`/projects/${reviewId}`);

// Named helper object for older components that import `{ api }`
export const api = {
  getUser,
  getAllNodes,
  createNode,
  deleteNode,
  getUserStats,
  createContainerNode,
  getContainerNodes,
  getContainerNodeById,
  updateContainerNode,
  deleteContainerNode,
  reorderContainerNode,
  createLearningNode,
  getLearningNodes,
  getLearningNodeById,
  updateLearningNode,
  deleteLearningNode,
  addXpToLearningNode,
  generateTest,
  submitTest,
  getTestHistory,
  getNodeTestHistory,
  submitProject,
  getProjectReviews,
  getProjectReviewById,
  getUserProjectHistory,
  deleteProjectReview,
};

export default apiClient;
