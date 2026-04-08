// src/utils/api.js
import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE, timeout: 30000 });

// Request logging
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Network error";
    console.error("[API Error]", msg);
    return Promise.reject(new Error(msg));
  }
);

export const chatAPI = {
  send: (messages, language = "en") =>
    api.post("/chat", { messages, language }).then((r) => r.data.reply),
};

export const recommendAPI = {
  get: (params) => api.get("/recommend", { params }).then((r) => r.data),
  calculate: (body) => api.post("/recommend/calculate", body).then((r) => r.data),
};

export const portfolioAPI = {
  get: () => api.get("/portfolio").then((r) => r.data),
  add: (data) => api.post("/portfolio", data).then((r) => r.data),
  update: (id, data) => api.put(`/portfolio/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/portfolio/${id}`).then((r) => r.data),
  addGoal: (data) => api.post("/portfolio/goals", data).then((r) => r.data),
};

export const fundsAPI = {
  getAll: (params) => api.get("/funds", { params }).then((r) => r.data),
  getOne: (id) => api.get(`/funds/${id}`).then((r) => r.data),
};

export default api;