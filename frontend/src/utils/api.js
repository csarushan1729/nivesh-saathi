import axios from "axios";

const BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "/api";

const api = axios.create({ baseURL: BASE, timeout: 30000 });

api.interceptors.request.use((cfg) => {
  console.log(`[API] ${cfg.method?.toUpperCase()} ${cfg.url}`);
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Network error";
    console.error("[API Error]", msg);
    return Promise.reject(new Error(msg));
  }
);

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  // messages: [{role, content}], language: "en"|"hi"|"te", userProfile: {...}
  send: (messages, language = "en", userProfile = {}) =>
    api.post("/chat", { messages, language, userProfile }).then((r) => r.data.reply),
};

// ── Recommendations ───────────────────────────────────────────────────────────
export const recommendAPI = {
  get: (params) => api.get("/recommend", { params }).then((r) => r.data),
  calculate: (body) => api.post("/recommend/calculate", body).then((r) => r.data),
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolioAPI = {
  get: (lang = "en") => api.get("/portfolio", { params: { lang } }).then((r) => r.data),
  add: (data) => api.post("/portfolio", data).then((r) => r.data),
  update: (id, data) => api.put(`/portfolio/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/portfolio/${id}`).then((r) => r.data),
  addGoal: (data) => api.post("/portfolio/goals", data).then((r) => r.data),
};

// ── Funds ─────────────────────────────────────────────────────────────────────
export const fundsAPI = {
  getAll: (params = {}) => api.get("/funds", { params }).then((r) => r.data),
  getOne: (id) => api.get(`/funds/${id}`).then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  save: (profile) => api.post("/users", profile).then((r) => r.data),
};

export default api;