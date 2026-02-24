import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
export const getUser = () => api.get("/users");

// Skill API
export const getSkills = (userId) =>
  api.get(`/skills?userId=${userId || "Jeremy"}`);
export const getSkillById = (id) => api.get(`/skills/${id}`);
export const createSkill = (data) => api.post("/skills", data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);

// Domain API
export const getDomains = (skillId) => api.get(`/domains/skill/${skillId}`);
export const getDomainById = (id) => api.get(`/domains/${id}`);
export const createDomain = (skillId, data) =>
  api.post(`/domains/skill/${skillId}`, data);
export const updateDomain = (id, data) => api.put(`/domains/${id}`, data);
export const deleteDomain = (id) => api.delete(`/domains/${id}`);

// Subskill API
export const getSubskills = (domainId) =>
  api.get(`/subskills/domain/${domainId}`);
export const getSubskillById = (id) => api.get(`/subskills/${id}`);
export const createSubskill = (domainId, data) =>
  api.post(`/subskills/domain/${domainId}`, data);
export const updateSubskill = (id, data) => api.put(`/subskills/${id}`, data);
export const addXP = (id, amount) =>
  api.patch(`/subskills/${id}/xp`, { amount });
export const deleteSubskill = (id) => api.delete(`/subskills/${id}`);

export default api;
