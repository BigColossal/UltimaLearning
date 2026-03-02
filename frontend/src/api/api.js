import axios from "axios";

const API_BASE_URL = "/api";

/* ==============================
   TOKEN HELPERS
============================== */

const getToken = () => localStorage.getItem("accessToken");

export const setToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const clearToken = () => {
  localStorage.removeItem("accessToken");
};

/* ==============================
   AXIOS INSTANCE
============================== */

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================
   REQUEST INTERCEPTOR
============================== */

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ==============================
   RESPONSE INTERCEPTOR
============================== */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        setToken(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/* ==============================
   AUTH API
============================== */

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  if (response.data?.accessToken) {
    setToken(response.data.accessToken);
  }

  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  if (response.data?.accessToken) {
    setToken(response.data.accessToken);
  }

  return response.data;
};

export const logoutUser = () => {
  clearToken();
  window.location.href = "/login";
};

export const getCurrentUser = () => api.get("/auth/me");

/* ==============================
   SKILL API (NO USER ID PARAMS)
============================== */

export const getSkills = () => api.get("/skills");
export const getSkillById = (id) => api.get(`/skills/${id}`);
export const createSkill = (data) => api.post("/skills", data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);

/* ==============================
   DOMAIN API
============================== */

export const getDomains = (skillId) => api.get(`/domains/skill/${skillId}`);

export const getDomainById = (id) => api.get(`/domains/${id}`);

export const createDomain = (skillId, data) =>
  api.post(`/domains/skill/${skillId}`, data);

export const updateDomain = (id, data) => api.put(`/domains/${id}`, data);

export const deleteDomain = (id) => api.delete(`/domains/${id}`);

/* ==============================
   SUBSKILL API
============================== */

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
